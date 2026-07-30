import type { DivinationModule, Locale } from '@/config/divination';

/**
 * SKU 与价格表。
 * 每个模块 + 档位（基础/深度） = 2 个 SKU。
 * Creem 的 product_id 通过环境变量 `CREEM_PRODUCT_ID_<MODULE>_<TIER>` 读取。
 */

export type Tier = 'basic' | 'deep';

export function getProductSku(module: DivinationModule, tier: Tier): string {
  return `CREEM_PRODUCT_ID_${module.toUpperCase()}_${tier.toUpperCase()}`;
}

export interface PriceConfig {
  amount: number;
  currency: 'CNY' | 'USD';
  formatted: string;
}

export function formatPrice(amount: number, currency: 'CNY' | 'USD', locale: Locale): string {
  const value = amount / 100;
  if (currency === 'CNY') {
    if (locale === 'en') return `$${value.toFixed(2)}`;
    if (locale === 'zh-TW') return `NT$${Math.round(value * 4.5)}`;
    return `¥${value.toFixed(2)}`;
  }
  // USD
  return `$${value.toFixed(2)}`;
}