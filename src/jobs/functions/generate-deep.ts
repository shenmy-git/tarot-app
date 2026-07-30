import { inngest } from '../client';
import { streamDeep } from '@/ai/gateway';
import {
  getTarotSystemPrompt,
  buildTarotDeepPrompt,
} from '@/ai/prompts/tarot';
import { db } from '@/db';
import { divinationSessions, aiJobs, paymentIntents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Locale } from '@/config/divination';
import type { TarotCardDraw } from '@/ai/prompts/tarot';

/**
 * 支付成功后触发，AI 生成深度解读报告。
 * 触发：payment/paid 事件
 */
export const generateDeepReport = inngest.createFunction(
  {
    id: 'generate-deep-report',
    name: 'Generate Deep Reading Report',
    // 如果 AI 失败，3 次重试
    retries: 3,
  },
  { event: 'payment/paid' },
  async ({ event, step }) => {
    const { paymentIntentId, sessionId } = event.data;
    const startTime = Date.now();

    // 1. 校验支付状态
    const intent = await step.run('verify-payment', async () => {
      const rows = await db
        .select()
        .from(paymentIntents)
        .where(eq(paymentIntents.id, paymentIntentId))
        .limit(1);
      return rows[0] ?? null;
    });

    if (!intent || intent.status !== 'paid') {
      throw new Error(`Payment intent not paid: ${paymentIntentId}`);
    }

    // 2. 加载 session
    const session = await step.run('load-session', async () => {
      const rows = await db
        .select()
        .from(divinationSessions)
        .where(eq(divinationSessions.id, sessionId))
        .limit(1);
      return rows[0] ?? null;
    });

    if (!session) throw new Error(`Session not found: ${sessionId}`);

    // 3. AI 流式生成
    const result = await step.run('ai-stream', async () => {
      if (session.module !== 'tarot') {
        return {
          text: '深度解读已就绪（其他模块的 prompt 待实现）',
          model: 'stub',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      }

      const cards = ((session.userInputs as { cards?: TarotCardDraw[] }).cards) ?? [];
      const question = ((session.userInputs as { question?: string }).question) ?? '';
      const locale = session.locale as Locale;

      const prompt = buildTarotDeepPrompt(question, cards, locale);
      const system = getTarotSystemPrompt(locale);

      const stream = streamDeep(prompt, system);
      let text = '';
      for await (const chunk of stream.textStream) {
        text += chunk;
      }
      const usage = await stream.finalUsage;
      return { text, model: stream.model, usage };
    });

    // 4. 写回
    await step.run('persist', async () => {
      await db
        .update(divinationSessions)
        .set({
          aiDeepResult: {
            text: result.text,
            model: result.model,
            tokens: result.usage,
            generatedAt: new Date().toISOString(),
          },
          paidAt: new Date(),
        })
        .where(eq(divinationSessions.id, sessionId));

      await db.insert(aiJobs).values({
        sessionId,
        type: `${session.module}_deep`,
        model: result.model,
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
        durationMs: Date.now() - startTime,
        status: 'success',
      });
    });

    return { sessionId, ok: true, length: result.text.length };
  },
);