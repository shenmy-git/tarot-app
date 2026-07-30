import type { Locale } from '@/config/divination';
import type { PaymentProvider, SupportedProvider } from './types';
import { hupijiaoProvider } from './providers/hupijiao';
import { yungouosProvider } from './providers/yungouos';
import { creemProvider } from './providers/creem';

const providers: Record<SupportedProvider, PaymentProvider> = {
  hupijiao: hupijiaoProvider,
  yungouos: yungouosProvider,
  creem: creemProvider,
  stripe: hupijiaoProvider, // 占位（未实现，避免 TS 错误）
  lemonsqueezy: hupijiaoProvider, // 占位
};

/**
 * 根据 locale + 可用 provider 选择最合适的支付通道。
 * 优先级：locale 匹配 → 配置的 PAYMENT_PRIMARY → fallback。
 */
export function selectProvider(locale: Locale): PaymentProvider {
  const primary = (process.env.PAYMENT_PRIMARY ?? 'hupijiao') as SupportedProvider;

  if (locale === 'en') {
    return providers.creem;
  }

  // 中文 locale：先用 primary，没配置就 fallback 到 hupijiao
  if (primary === 'yungouos' && process.env.YUNGOUOS_MCH_ID) {
    return providers.yungouos;
  }
  return providers.hupijiao;
}

export function listAvailableProviders(): PaymentProvider[] {
  return [
    ...(process.env.HUPIJIAO_APP_ID ? [providers.hupijiao] : []),
    ...(process.env.YUNGOUOS_MCH_ID ? [providers.yungouos] : []),
    ...(process.env.CREEM_API_KEY ? [providers.creem] : []),
  ];
}

export { providers };
export type { PaymentProvider, SupportedProvider } from './types';