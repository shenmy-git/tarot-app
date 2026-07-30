import { pgTable, text, jsonb } from 'drizzle-orm/pg-core';

/**
 * 静态知识库（多语言）：
 * - tarot: 78 张牌（major:00-21 + minor:wands/cups/swords/pentacles × ace-king）
 * - astrology: 12 星座 + 行星
 * - bazi: 天干地支五行
 * - yijing: 64 卦
 * - dream: 常见梦境象征
 * - birthchart: 行星符号
 */
export const knowledgeCards = pgTable('knowledge_cards', {
  id: text('id').primaryKey(), // e.g. "tarot:major:00-fool"
  module: text('module').notNull(),
  name: jsonb('name').notNull(), // { "zh-CN": "愚者", "en": "The Fool" }
  uprightMeaning: jsonb('upright_meaning').notNull(),
  reversedMeaning: jsonb('reversed_meaning'),
  description: jsonb('description'),
  imageUrl: text('image_url'),
  metadata: jsonb('metadata'), // 额外结构（suit、number、element 等）
});

export type KnowledgeCard = typeof knowledgeCards.$inferSelect;
export type NewKnowledgeCard = typeof knowledgeCards.$inferInsert;