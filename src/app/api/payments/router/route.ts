import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { paymentIntents, divinationSessions } from '@/db/schema';
import {
  isDivinationModule,
  isLocale,
  type Locale,
  getDeepPrice,
} from '@/config/divination';
import { selectProvider } from '@/payments/registry';
import { getProductSku } from '@/payments/pricing';
import { getSessionById } from '@/db/queries/divination';

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  module: z.string().refine(isDivinationModule),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { sessionId, module } = parsed.data;

  // 1. 校验 session
  const session = await getSessionById(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  }
  if (session.paymentStatus === 'paid') {
    return NextResponse.json({ error: 'already_paid' }, { status: 400 });
  }

  const locale = session.locale as Locale;
  const price = getDeepPrice(module, locale);
  const productSku = getProductSku(module, 'deep');

  // 2. 选 provider
  const provider = selectProvider(locale);

  // 3. 创建 payment_intent
  const [intent] = await db
    .insert(paymentIntents)
    .values({
      provider: provider.name,
      sessionId,
      locale,
      module,
      productSku,
      amount: price.amount,
      currency: price.currency,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    })
    .returning();
  if (!intent) {
    return NextResponse.json({ error: 'create_intent_failed' }, { status: 500 });
  }

  // 4. 关联到 session
  await db
    .update(divinationSessions)
    .set({ paymentIntentId: intent.id, paymentStatus: 'pending' })
    .where(eq(divinationSessions.id, sessionId));

  // 5. 创建 checkout
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const result = await provider.createCheckout({
      sessionId,
      module,
      productSku,
      amount: price.amount,
      currency: price.currency,
      successUrl: `${baseUrl}/${locale}/${module}/reading/${sessionId}`,
      cancelUrl: `${baseUrl}/${locale}/${module}/reading/${sessionId}`,
      notifyUrl: `${baseUrl}/api/payments/${provider.name}/webhook`,
      metadata: { sessionId, module },
    });

    // 6. 更新 external_id
    await db
      .update(paymentIntents)
      .set({ externalId: result.externalId })
      .where(eq(paymentIntents.id, intent.id));

    return NextResponse.json({ redirectUrl: result.redirectUrl, intentId: intent.id });
  } catch (err) {
    console.error('[payments/router] createCheckout failed:', err);
    return NextResponse.json(
      { error: 'create_failed', message: (err as Error).message },
      { status: 500 },
    );
  }
}