import { inngest } from '../client';
import { generateBasic } from '@/ai/gateway';
import {
  getTarotSystemPrompt,
  buildTarotBasicPrompt,
} from '@/ai/prompts/tarot';
import { db } from '@/db';
import { divinationSessions, aiJobs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Locale } from '@/config/divination';
import { FEATURES } from '@/config/limits';
import type { TarotCardDraw } from '@/ai/prompts/tarot';

/**
 * 用户发起占卜 → 创建 session → AI 生成基础解读（免费）。
 * 触发：divination/created 事件
 */
export const generateBasicReading = inngest.createFunction(
  { id: 'generate-basic-reading', name: 'Generate Basic Reading' },
  { event: 'divination/created' },
  async ({ event, step }) => {
    const { sessionId, module, locale, userInputs } = event.data;
    const startTime = Date.now();

    const result = await step.run('ai-call', async () => {
      // 仅塔罗完整实现，其他模块的 prompt 在 Phase 5/6 补充
      if (module !== 'tarot') {
        return {
          text: '基础解读已就绪（其他模块的 prompt 待实现）',
          model: 'stub',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      }

      const cards = ((userInputs as { cards?: TarotCardDraw[] }).cards) ?? [];
      const question = ((userInputs as { question?: string }).question) ?? '';

      const prompt = buildTarotBasicPrompt(question, cards, locale as Locale);
      const system = getTarotSystemPrompt(locale as Locale);
      const r = await generateBasic(prompt, system);
      return { text: r.text, model: r.model, usage: r.usage };
    });

    await step.run('persist', async () => {
      // 更新 session 的 ai_basic_result
      await db
        .update(divinationSessions)
        .set({
          aiBasicResult: {
            text: result.text,
            model: result.model,
            tokens: result.usage,
            generatedAt: new Date().toISOString(),
          },
        })
        .where(eq(divinationSessions.id, sessionId));

      // 记录 ai_jobs
      await db.insert(aiJobs).values({
        sessionId,
        type: `${module}_basic`,
        model: result.model,
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
        durationMs: Date.now() - startTime,
        status: 'success',
      });
    });

    // 全流程免费：直接续上深度解读，无需支付
    if (FEATURES.FREE_MODE) {
      await step.sendEvent('trigger-deep', {
        name: 'divination/deep-requested',
        data: { sessionId },
      });
    }

    return { sessionId, ok: true };
  },
);