import { NextResponse, type NextRequest } from 'next/server';
import { providers } from '@/payments/registry';
import { getPaymentIntentByExternal, markPaymentPaid, markSessionPaid } from '@/db/queries/divination';
import { inngest } from '@/jobs/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const provider = providers.yungouos;
  try {
    const event = await provider.verifyWebhook(request);
    if (event.status !== 'paid') {
      return NextResponse.json({ ok: false, reason: 'not_paid' });
    }

    const intent = await getPaymentIntentByExternal(provider.name, event.externalId);
    if (!intent) return NextResponse.json({ ok: false, reason: 'intent_not_found' });
    if (!intent.sessionId) return NextResponse.json({ ok: false, reason: 'intent_no_session' });
    if (intent.status === 'paid') return NextResponse.json({ ok: true, idempotent: true });

    await markPaymentPaid(intent.id, event.rawPayload);
    await markSessionPaid(intent.sessionId);
    await inngest.send({
      name: 'payment/paid',
      data: { paymentIntentId: intent.id, sessionId: intent.sessionId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}