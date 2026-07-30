import {
  pgTable,
  text,
  uuid,
  integer,
  numeric,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { divinationSessions } from './divination';

/**
 * AI 调用日志：所有 AI Gateway 调用都记入，便于成本分析与限流。
 */
export const aiJobs = pgTable(
  'ai_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => divinationSessions.id, {
      onDelete: 'set null',
    }),
    type: text('type').notNull(), // tarot_basic / tarot_deep / etc.
    model: text('model').notNull(), // anthropic/claude-haiku-4-5
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }),
    durationMs: integer('duration_ms'),
    status: text('status'), // success / error
    error: text('error'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index('ai_jobs_session_idx').on(table.sessionId),
    typeIdx: index('ai_jobs_type_idx').on(table.type, table.createdAt),
  }),
);

export type AiJob = typeof aiJobs.$inferSelect;
export type NewAiJob = typeof aiJobs.$inferInsert;