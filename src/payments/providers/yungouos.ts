import type {
  CheckoutParams,
  CheckoutResult,
  OrderStatus,
  PaymentProvider,
  WebhookEvent,
} from '../types';

/**
 * YunGouOS provider（备用通道，国内个人可接入）。
 *
 * 参考文档：https://www.yungouos.com/doc/
 */

function getMchId(): string {
  return process.env.YUNGOUOS_MCH_ID ?? '';
}
function getApiKey(): string {
  return process.env.YUNGOUOS_API_KEY ?? '';
}

async function md5(input: string): Promise<string> {
  const { createHash } = await import('node:crypto');
  return createHash('md5').update(input).digest('hex');
}

export const yungouosProvider: PaymentProvider = {
  name: 'yungouos',
  supportedLocales: ['zh-CN', 'zh-TW'],
  supportedCurrencies: ['CNY'],

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    if (!getMchId() || !getApiKey()) {
      return { redirectUrl: 'about:blank', externalId: params.sessionId };
    }

    const outTradeNo = `${params.module}_${params.sessionId.slice(0, 8)}_${Date.now()}`;
    const sign = await md5(`${outTradeNo}${params.amount}${getApiKey()}`);

    const res = await fetch('https://api.yungouos.com/api/pay/wxpay/nativePay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        mch_id: getMchId(),
        out_trade_no: outTradeNo,
        total_fee: String(params.amount / 100), // YunGouOS 用元
        body: `${params.module} - Deep Reading`,
        notify_url: params.notifyUrl,
        sign,
      }),
    });

    const data = (await res.json()) as { code: number; data?: { pay_url: string }; msg?: string };
    if (data.code !== 0 || !data.data?.pay_url) {
      throw new Error(`yungouos createCheckout failed: ${data.msg}`);
    }
    return { redirectUrl: data.data.pay_url, externalId: outTradeNo };
  },

  async verifyWebhook(request: Request): Promise<WebhookEvent> {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const outTradeNo = params.get('out_trade_no') ?? '';
    const totalFee = Number(params.get('total_fee') ?? '0');
    const sign = params.get('sign') ?? '';

    const expected = await md5(`${outTradeNo}${totalFee}${getApiKey()}`);
    if (sign !== expected) throw new Error('yungouos signature mismatch');

    return {
      externalId: outTradeNo,
      status: 'paid',
      amount: Math.round(totalFee * 100),
      currency: 'CNY',
      rawPayload: Object.fromEntries(params.entries()),
    };
  },

  async queryOrder(externalId: string): Promise<OrderStatus> {
    const sign = await md5(`${getMchId()}${externalId}${getApiKey()}`);
    const res = await fetch(
      `https://api.yungouos.com/api/pay/wxpay/orderQuery?mch_id=${getMchId()}&out_trade_no=${externalId}&sign=${sign}`,
    );
    const data = (await res.json()) as { code: number; data?: { pay_status: number } };
    const status = data.data?.pay_status;
    return {
      externalId,
      status: status === 1 ? 'paid' : 'pending',
    };
  },
};