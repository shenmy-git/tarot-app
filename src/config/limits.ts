/**
 * 全局配额与限制（防止滥用、降低成本）。
 */
export const LIMITS = {
  /** 每个 IP 每日可免费占卜的次数（基础解读）。 */
  FREE_PER_IP_PER_DAY: 3,

  /** 每个 session 的最大 prompt token 数。 */
  MAX_INPUT_TOKENS: 2000,

  /** 每个 session 最多保存的对话长度。 */
  MAX_TURNS: 10,

  /** 塔罗抽牌数量上限。 */
  MAX_CARDS_PER_SPREAD: 10,

  /** AI 流式响应的超时（ms）。 */
  AI_STREAM_TIMEOUT_MS: 60_000,
} as const;

/**
 * 功能开关。
 */
export const FEATURES = {
  /**
   * 全流程免费：跳过支付墙，深度解读随基础解读一起自动生成。
   * 设 NEXT_PUBLIC_FREE_MODE=false 可恢复付费流程。
   */
  FREE_MODE: process.env.NEXT_PUBLIC_FREE_MODE !== 'false',
} as const;
