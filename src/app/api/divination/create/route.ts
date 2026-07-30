import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { divinationSessions } from '@/db/schema';
import { getClientIp, hashIdentifier } from '@/lib/crypto';
import { LIMITS } from '@/config/limits';
import { isDivinationModule, isLocale } from '@/config/divination';
import { inngest } from '@/jobs/client';
import { getRecentSessionsByIp } from '@/db/queries/divination';

const BodySchema = z.object({
  module: z.string().refine(isDivinationModule, 'invalid module'),
  locale: z.string().refine(isLocale, 'invalid locale'),
  spread: z.string().optional(),
  question: z.string().max(500).optional().default(''),
  cards: z
    .array(
      z.object({
        cardId: z.string(),
        cardName: z.string(),
        position: z.string(),
        upright: z.boolean(),
      }),
    )
    .optional(),
  // 通用 inputs（其他模块用）
  inputs: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', details: parsed.error.flatten() }, { status: 400 });
  }
  const { module, locale, question, cards, spread, inputs } = parsed.data;

  // IP 限流：每天 N 次免费解读
  const ip = getClientIp(request.headers);
  const ipHash = await hashIdentifier(ip);
  const recent = await getRecentSessionsByIp(ipHash, 24);
  if (recent.length >= LIMITS.FREE_PER_IP_PER_DAY) {
    return NextResponse.json(
      { error: 'quota_exceeded', message: '今日免费次数已用完，请明日再来' },
      { status: 429 },
    );
  }

  // 创建 session
  const userInputs: Record<string, unknown> = {
    question,
    spread,
    cards,
    ...(inputs ?? {}),
  };

  let session;
  try {
    [session] = await db
      .insert(divinationSessions)
      .values({
        module,
        locale,
        userInputs,
        ipHash,
        userAgent: request.headers.get('user-agent') ?? null,
        paymentStatus: 'free',
      })
      .returning();
  } catch (err) {
    console.error('[divination/create] DB insert failed:', err);
    return NextResponse.json(
      {
        error: 'db_failed',
        message: (err as Error).message,
      },
      { status: 500 },
    );
  }

  // 触发 Inngest 生成基础解读（失败不阻塞主流程，session 已创建）
  try {
    await inngest.send({
      name: 'divination/created',
      data: {
        sessionId: session.id,
        module: module as 'tarot' | 'astrology' | 'bazi' | 'yijing' | 'dream' | 'birthchart',
        locale: locale as 'zh-CN' | 'zh-TW' | 'en',
        userInputs,
      },
    });
  } catch (err) {
    console.error('[divination/create] inngest send failed (non-fatal):', err);
  }

  return NextResponse.json({ sessionId: session.id });
}