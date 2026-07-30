import type {
  CheckoutParams,
  CheckoutResult,
  OrderStatus,
  PaymentProvider,
  WebhookEvent,
} from '../types';

/**
 * 虎皮椒支付 provider（个人可接入，微信 + 支付宝）。
 *
 * 参考文档：https://www.hupijiao.com/doc/
 * 重要：实际接入时请用最新文档替换下面的 URL / 签名算法。
 *
 * 当前实现为骨架：环境变量缺失时返回 mock 响应，便于开发期联调。
 */

function getAppId(): string {
  return process.env.HUPIJIAO_APP_ID ?? '';
}
function getAppSecret(): string {
  return process.env.HUPIJIAO_APP_SECRET ?? '';
}

/** MD5 哈希（Node 自带 crypto）。 */
async function md5(input: string): Promise<string> {
  const { createHash } = await import('node:crypto');
  return createHash('md5').update(input).digest('hex');
}

export const hupijiaoProvider: PaymentProvider = {
  name: 'hupijiao',
  supportedLocales: ['zh-CN', 'zh-TW'],
  supportedCurrencies: ['CNY'],

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    if (!getAppId() || !getAppSecret()) {
      // dev fallback
      console.warn('[hupijiao] dev fallback: redirecting to about:blank');
      return { redirectUrl: 'about:blank', externalId: params.sessionId };
    }

    // 构造订单参数
    const orderId = `${params.module}_${params.sessionId.slice(0, 8)}_${Date.now()}`;
    const tradeId = orderId;
    const sign = await md5(`${getAppId()}${tradeId}${params.amount}${getAppSecret()}`);

    const formData = new URLSearchParams({
      app_id: getAppId(),
      trade_id: tradeId,
      total_fee: String(params.amount), // 单位：分
      title: `${params.module} - Deep Reading`,
      notify_url: params.notifyUrl,
      return_url: params.successUrl,
      cancel_url: params.cancelUrl,
      sign,
    });

    // 实际请求方式取决于虎皮椒 API 版本（GET/POST 都有）
    const res = await fetch('https://api.hupijiao.com/v1/pay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    const data = (await res.json()) as { code: number; data?: { pay_url: string }; msg?: string };
    if (data.code !== 1 || !data.data?.pay_url) {
      throw new Error(`hupijiao createCheckout failed: ${data.msg ?? 'unknown'}`);
    }

    return { redirectUrl: data.data.pay_url, externalId: tradeId };
  },

  async verifyWebhook(request: Request): Promise<WebhookEvent> {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const tradeId = params.get('trade_id') ?? '';
    const status = params.get('status') ?? '';
    const totalFee = Number(params.get('total_fee') ?? '0');
    const sign = params.get('sign') ?? '';

    // 验签：sign = MD5(trade_id + status + total_fee + appsecret)
    const expected = await md5(`${tradeId}${status}${totalFee}${getAppSecret()}`);
    if (sign !== expected) throw new Error('hupijiao signature mismatch');

    const isPaid = status === 'TRADE_SUCCESS' || status === 'paid';
    return {
      externalId: tradeId,
      status: isPaid ? 'paid' : 'failed',
      amount: totalFee,
      currency: 'CNY',
      rawPayload: Object.fromEntries(params.entries()),
    };
  },

  async queryOrder(externalId: string): Promise<OrderStatus> {
    const sign = await md5(`${getAppId()}${externalId}${getAppSecret()}`);
    const res = await fetch(
      `https://api.hupijiao.com/v1/pay/query?app_id=${getAppId()}&trade_id=${externalId}&sign=${sign}`,
    );
    const data = (await res.json()) as { code: number; data?: { status: string } };
    const status = data.data?.status ?? 'pending';
    return {
      externalId,
      status:
        status === 'TRADE_SUCCESS'
          ? 'paid'
          : status === 'TRADE_FAILED'
            ? 'failed'
            : status === 'REFUND'
              ? 'refunded'
              : 'pending',
    };
  },
};