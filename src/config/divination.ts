/**
 * 6 个占卜模块的静态配置 + 多语言类型。
 */

export type Locale = 'zh-CN' | 'zh-TW' | 'en';
export type DivinationModule = 'tarot' | 'astrology' | 'bazi' | 'yijing' | 'dream' | 'birthchart';

export interface ModuleConfig {
  id: DivinationModule;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  icon: string;
  freeResultLabel: Record<Locale, string>;
  paidResultLabel: Record<Locale, string>;
  basicPriceCNY: number;
  basicPriceUSD: number;
  deepPriceCNY: number;
  deepPriceUSD: number;
}

export const DIVINATION_MODULES: Record<DivinationModule, ModuleConfig> = {
  tarot: {
    id: 'tarot',
    name: { 'zh-CN': '塔罗解读', 'zh-TW': '塔羅解讀', en: 'Tarot Reading' },
    description: {
      'zh-CN': '抽取 78 张神秘塔罗牌，获取你内心的指引',
      'zh-TW': '抽取 78 張神秘塔羅牌，獲取你內心的指引',
      en: 'Draw from 78 mysterious tarot cards and receive guidance from within',
    },
    icon: '🃏',
    freeResultLabel: {
      'zh-CN': '基础解读',
      'zh-TW': '基礎解讀',
      en: 'Basic Reading',
    },
    paidResultLabel: {
      'zh-CN': '深度解读',
      'zh-TW': '深度解讀',
      en: 'Deep Reading',
    },
    basicPriceCNY: 0,
    basicPriceUSD: 0,
    deepPriceCNY: 990,
    deepPriceUSD: 199,
  },
  astrology: {
    id: 'astrology',
    name: { 'zh-CN': '星座解读', 'zh-TW': '星座解讀', en: 'Astrology' },
    description: {
      'zh-CN': '根据你的星座和出生日期，了解性格倾向与近期运势',
      'zh-TW': '根據你的星座和出生日期，了解性格傾向與近期運勢',
      en: 'Understand your personality and near-term tendencies based on your zodiac',
    },
    icon: '⭐',
    freeResultLabel: {
      'zh-CN': '今日运势',
      'zh-TW': '今日運勢',
      en: 'Daily Insights',
    },
    paidResultLabel: {
      'zh-CN': '完整星图解读',
      'zh-TW': '完整星圖解讀',
      en: 'Full Chart Reading',
    },
    basicPriceCNY: 0,
    basicPriceUSD: 0,
    deepPriceCNY: 1990,
    deepPriceUSD: 399,
  },
  bazi: {
    id: 'bazi',
    name: { 'zh-CN': '八字解读', 'zh-TW': '八字解讀', en: 'Ba Zi Reading' },
    description: {
      'zh-CN': '基于出生年月日时，分析五行平衡与性格特征',
      'zh-TW': '基於出生年月日時，分析五行平衡與性格特徵',
      en: 'Analyze five-element balance and personality from your birth data',
    },
    icon: '🔮',
    freeResultLabel: {
      'zh-CN': '八字简析',
      'zh-TW': '八字簡析',
      en: 'Quick Insight',
    },
    paidResultLabel: {
      'zh-CN': '完整命盘分析',
      'zh-TW': '完整命盤分析',
      en: 'Full Destiny Chart',
    },
    basicPriceCNY: 0,
    basicPriceUSD: 0,
    deepPriceCNY: 1990,
    deepPriceUSD: 399,
  },
  yijing: {
    id: 'yijing',
    name: { 'zh-CN': '周易抽签', 'zh-TW': '周易抽籤', en: 'I Ching Reference' },
    description: {
      'zh-CN': '古老 64 卦随机抽取，参考当下心境与抉择',
      'zh-TW': '古老 64 卦隨機抽取，參考當下心境與抉擇',
      en: 'Draw from the ancient 64 hexagrams for guidance',
    },
    icon: '☯️',
    freeResultLabel: {
      'zh-CN': '卦象简释',
      'zh-TW': '卦象簡釋',
      en: 'Hexagram Insight',
    },
    paidResultLabel: {
      'zh-CN': '完整卦辞解读',
      'zh-TW': '完整卦辭解讀',
      en: 'Full Hexagram Reading',
    },
    basicPriceCNY: 0,
    basicPriceUSD: 0,
    deepPriceCNY: 990,
    deepPriceUSD: 199,
  },
  dream: {
    id: 'dream',
    name: { 'zh-CN': '梦境解析', 'zh-TW': '夢境解析', en: 'Dream Interpretation' },
    description: {
      'zh-CN': '描述你的梦境，AI 帮你分析意象与潜在情绪',
      'zh-TW': '描述你的夢境，AI 幫你分析意象與潛在情緒',
      en: 'Describe your dream and let AI analyze its imagery',
    },
    icon: '💭',
    freeResultLabel: {
      'zh-CN': '意象速览',
      'zh-TW': '意象速覽',
      en: 'Quick Symbol Scan',
    },
    paidResultLabel: {
      'zh-CN': '完整梦境分析',
      'zh-TW': '完整夢境分析',
      en: 'Full Dream Analysis',
    },
    basicPriceCNY: 0,
    basicPriceUSD: 0,
    deepPriceCNY: 990,
    deepPriceUSD: 199,
  },
  birthchart: {
    id: 'birthchart',
    name: { 'zh-CN': '出生星图', 'zh-TW': '出生星圖', en: 'Birth Chart' },
    description: {
      'zh-CN': '基于精确出生时间的西方占星星图分析',
      'zh-TW': '基於精確出生時間的西方占星星圖分析',
      en: 'Western astrology chart based on your precise birth time',
    },
    icon: '🌌',
    freeResultLabel: {
      'zh-CN': '太阳星座速览',
      'zh-TW': '太陽星座速覽',
      en: 'Sun Sign Snapshot',
    },
    paidResultLabel: {
      'zh-CN': '完整出生星图解读',
      'zh-TW': '完整出生星圖解讀',
      en: 'Full Birth Chart Reading',
    },
    basicPriceCNY: 0,
    basicPriceUSD: 0,
    deepPriceCNY: 2990,
    deepPriceUSD: 599,
  },
};

export const LOCALES: readonly Locale[] = ['zh-CN', 'zh-TW', 'en'] as const;
export const DEFAULT_LOCALE: Locale = 'zh-CN';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isDivinationModule(value: string): value is DivinationModule {
  return value in DIVINATION_MODULES;
}

/** 根据 locale 返回该模块的价格（分/cents）。 */
export function getDeepPrice(
  module: DivinationModule,
  locale: Locale,
): { amount: number; currency: 'CNY' | 'USD' } {
  const cfg = DIVINATION_MODULES[module];
  if (locale === 'en') return { amount: cfg.deepPriceUSD, currency: 'USD' };
  return { amount: cfg.deepPriceCNY, currency: 'CNY' };
}