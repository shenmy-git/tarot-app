import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { divinationSessions, paymentIntents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getClientIp, hashIdentifier } from '@/lib/crypto';
import { LIMITS } from '@/config/limits';
import { isDivinationModule, isLocale, type Locale } from '@/config/divination';
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

  const [session] = await db
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

  // 触发 Inngest 生成基础解读
  await inngest.send({
    name: 'divination/created',
    data: {
      sessionId: session.id,
      module: module as 'tarot' | 'astrology' | 'bazi' | 'yijing' | 'dream' | 'birthchart',
      locale: locale as 'zh-CN' | 'zh-TW' | 'en',
      userInputs,
    },
  });

  return NextResponse.json({ sessionId: session.id });
}