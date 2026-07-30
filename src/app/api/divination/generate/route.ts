import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { divinationSessions, aiJobs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateBasic, streamDeep } from '@/ai/gateway';
import {
  getTarotSystemPrompt,
  buildTarotBasicPrompt,
  buildTarotDeepPrompt,
  type TarotCardDraw,
} from '@/ai/prompts/tarot';
import type { Locale } from '@/config/divination';

/**
 * 按需生成解读（无需 Inngest）。
 * 前端在解读页/报告页轮询调用；若已生成则直接返回缓存结果，天然幂等。
 */

// 推理模型较慢（深度解读实测约 30s），Vercel 默认 10s 会截断
export const maxDuration = 120;

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  tier: z.enum(['basic', 'deep']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    const { sessionId, tier } = parsed.data;

    const [session] = await db
      .select()
      .from(divinationSessions)
      .where(eq(divinationSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // 已生成 → 直接返回（幂等，避免重复计费）
    const existing =
      tier === 'basic'
        ? (session.aiBasicResult as { text?: string } | null)
        : (session.aiDeepResult as { text?: string } | null);
    if (existing?.text) {
      return NextResponse.json({ status: 'ready', text: existing.text, cached: true });
    }

    const cards = ((session.userInputs as { cards?: TarotCardDraw[] }).cards) ?? [];
    const question = ((session.userInputs as { question?: string }).question) ?? '';
    const locale = session.locale as Locale;
    const system = getTarotSystemPrompt(locale);
    const startTime = Date.now();

    let text: string;
    let model: string;
    let usage: { promptTokens: number; completionTokens: number; totalTokens: number };

    if (session.module !== 'tarot') {
      return NextResponse.json(
        { error: 'unsupported_module', message: `${session.module} 的解读模板尚未实现` },
        { status: 501 },
      );
    }

    if (tier === 'basic') {
      const r = await generateBasic(buildTarotBasicPrompt(question, cards, locale), system);
      text = r.text;
      model = r.model;
      usage = r.usage;
    } else {
      const stream = streamDeep(buildTarotDeepPrompt(question, cards, locale), system);
      let acc = '';
      for await (const chunk of stream.textStream) acc += chunk;
      text = acc;
      model = stream.model;
      usage = await stream.finalUsage;
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'empty_generation' }, { status: 502 });
    }

    const payload = {
      text,
      model,
      tokens: usage,
      generatedAt: new Date().toISOString(),
    };

    await db
      .update(divinationSessions)
      .set(tier === 'basic' ? { aiBasicResult: payload } : { aiDeepResult: payload })
      .where(eq(divinationSessions.id, sessionId));

    await db.insert(aiJobs).values({
      sessionId,
      type: `${session.module}_${tier}`,
      model,
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      durationMs: Date.now() - startTime,
      status: 'success',
    });

    return NextResponse.json({ status: 'ready', text, cached: false });
  } catch (err) {
    const e = err as Error;
    console.error('[divination/generate] failed:', e);
    return NextResponse.json(
      { error: 'generation_failed', message: e?.message ?? String(err) },
      { status: 500 },
    );
  }
}
