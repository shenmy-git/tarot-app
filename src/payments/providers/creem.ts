import type {
  CheckoutParams,
  CheckoutResult,
  OrderStatus,
  PaymentProvider,
  WebhookEvent,
} from '../types';

/**
 * Creem.io provider（海外，Merchant of Record 模式）。
 *
 * 参考文档：https://docs.creem.io/
 * API：https://api.creem.io/v1/
 */

const CREEM_API_BASE = 'https://api.creem.io/v1';

function getApiKey(): string {
  return process.env.CREEM_API_KEY ?? '';
}
function getWebhookSecret(): string {
  return process.env.CREEM_WEBHOOK_SECRET ?? '';
}

export const creemProvider: PaymentProvider = {
  name: 'creem',
  supportedLocales: ['en'],
  supportedCurrencies: ['USD'],

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    if (!getApiKey()) {
      return { redirectUrl: 'about:blank', externalId: params.sessionId };
    }

    // Creem 的 product_id 在环境变量里（每个模块每个档位一个）
    const productId = process.env[params.productSku];
    if (!productId) {
      throw new Error(`Creem product ID missing: ${params.productSku}`);
    }

    const res = await fetch(`${CREEM_API_BASE}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getApiKey(),
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          session_id: params.sessionId,
          module: params.module,
          ...params.metadata,
        },
        customer: params.customerEmail ? { email: params.customerEmail } : undefined,
      }),
    });

    const data = (await res.json()) as { id: string; checkout_url?: string };
    if (!data.checkout_url) throw new Error('Creem createCheckout: no checkout_url');

    return { redirectUrl: data.checkout_url, externalId: data.id };
  },

  async verifyWebhook(request: Request): Promise<WebhookEvent> {
    const body = await request.text();
    const sig = request.headers.get('creem-signature') ?? '';

    // Creem webhook 签名验证：HMAC-SHA256(body, secret)
    const { createHmac } = await import('node:crypto');
    const expected = createHmac('sha256', getWebhookSecret()).update(body).digest('hex');
    if (sig !== expected) throw new Error('Creem signature mismatch');

    const payload = JSON.parse(body);
    const eventType = payload.event_type ?? payload.type;
    const obj = payload.data ?? payload.object ?? payload;

    let status: 'paid' | 'failed' | 'refunded';
    if (eventType === 'checkout.completed' || eventType === 'payment.succeeded') status = 'paid';
    else if (eventType === 'payment.failed') status = 'failed';
    else if (eventType === 'refund.created') status = 'refunded';
    else throw new Error(`Unhandled Creem event: ${eventType}`);

    return {
      externalId: obj.id ?? obj.checkout_id ?? '',
      status,
      amount: Math.round((obj.amount ?? 0) * 100), // Creem amount 可能是元，转分
      currency: (obj.currency ?? 'USD').toUpperCase(),
      rawPayload: payload,
    };
  },

  async queryOrder(externalId: string): Promise<OrderStatus> {
    const res = await fetch(`${CREEM_API_BASE}/checkouts/${externalId}`, {
      headers: { 'x-api-key': getApiKey() },
    });
    const data = (await res.json()) as { status: string };
    const map: Record<string, OrderStatus['status']> = {
      completed: 'paid',
      succeeded: 'paid',
      pending: 'pending',
      failed: 'failed',
      refunded: 'refunded',
    };
    return { externalId, status: map[data.status] ?? 'pending' };
  },
};