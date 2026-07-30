import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  uuid,
  jsonb,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';

export const MODULES = ['tarot', 'astrology', 'bazi', 'yijing', 'dream', 'birthchart'] as const;
export const LOCALES = ['zh-CN', 'zh-TW', 'en'] as const;
export const PAYMENT_STATUS = ['free', 'pending', 'paid', 'refunded', 'failed'] as const;

/**
 * 占卜会话：所有模块共用一张表，用 module 区分。
 * 6 个模块的"基础解读"都免费，"深度解读"需要付费解锁。
 */
export const divinationSessions = pgTable(
  'divination_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    module: text('module').notNull(),
    locale: text('locale').notNull(),
    userInputs: jsonb('user_inputs').notNull(), // { question, spread, cardsDrawn, birthday, ... }
    aiBasicResult: jsonb('ai_basic_result'), // { text, model, tokens, generatedAt }
    aiDeepResult: jsonb('ai_deep_result'), // { text, model, tokens, generatedAt }
    paymentStatus: text('payment_status').default('free').notNull(),
    paymentIntentId: uuid('payment_intent_id'),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => ({
    moduleIdx: index('divination_sessions_module_idx').on(table.module, table.createdAt),
    ipIdx: index('divination_sessions_ip_idx').on(table.ipHash, table.createdAt),
    moduleCheck: check(
      'divination_sessions_module_check',
      sql`${table.module} = ANY(${sql.raw(`ARRAY['tarot','astrology','bazi','yijing','dream','birthchart']::text[]`)})`,
    ),
  }),
);

export type DivinationSession = typeof divinationSessions.$inferSelect;
export type NewDivinationSession = typeof divinationSessions.$inferInsert;