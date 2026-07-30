import type { Locale } from '@/config/divination';

/**
 * 支付提供商统一接口。
 * 任何支付平台（虎皮椒/YunGouOS/Creem/Stripe/LemonSqueezy）都实现这个接口。
 * 这样切换 provider 只需改 registry，无需改业务代码。
 */

export type SupportedProvider = 'hupijiao' | 'yungouos' | 'creem' | 'stripe' | 'lemonsqueezy';

export interface CheckoutParams {
  sessionId: string;
  module: string;
  productSku: string;
  amount: number; // 分/cents
  currency: 'CNY' | 'USD';
  successUrl: string;
  cancelUrl: string;
  notifyUrl: string; // webhook URL
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutResult {
  redirectUrl: string;
  externalId: string;
}

export interface WebhookEvent {
  externalId: string;
  status: 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  rawPayload: unknown;
}

export interface OrderStatus {
  externalId: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface PaymentProvider {
  name: SupportedProvider;
  supportedLocales: Locale[];
  supportedCurrencies: ('CNY' | 'USD')[];

  /** 创建 checkout session，返回支付 URL。 */
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;

  /** 验证 webhook 签名并解析事件。 */
  verifyWebhook(request: Request): Promise<WebhookEvent>;

  /** 查询订单状态（可选，不一定所有 provider 都支持）。 */
  queryOrder?(externalId: string): Promise<OrderStatus>;
}