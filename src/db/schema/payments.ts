import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  uuid,
  integer,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { divinationSessions } from './divination';

export const PROVIDERS = ['hupijiao', 'yungouos', 'creem', 'stripe', 'lemonsqueezy'] as const;
export const PAYMENT_INTENT_STATUS = ['pending', 'paid', 'failed', 'refunded'] as const;
export const CURRENCIES = ['CNY', 'USD'] as const;

/**
 * 支付意图表：与支付平台解耦。
 * - provider: 实际接入的支付平台
 * - externalId: 第三方订单号（用于 webhook 幂等）
 * - amount/currency: 实际价格（分/cents）
 */
export const paymentIntents = pgTable(
  'payment_intents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull(),
    externalId: text('external_id'),
    sessionId: uuid('session_id').references(() => divinationSessions.id, {
      onDelete: 'cascade',
    }),
    locale: text('locale').notNull(),
    module: text('module').notNull(),
    productSku: text('product_sku').notNull(), // e.g. 'tarot:deep' / 'CREEM_PRODUCT_ID_TAROT_DEEP'
    amount: integer('amount').notNull(), // 分/cents
    currency: text('currency').notNull(),
    status: text('status').default('pending').notNull(),
    customerEmail: text('customer_email'),
    rawWebhook: jsonb('raw_webhook'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => ({
    providerExternalIdx: uniqueIndex('payment_intents_provider_external_idx').on(
      table.provider,
      table.externalId,
    ),
    sessionIdx: index('payment_intents_session_idx').on(table.sessionId),
    statusIdx: index('payment_intents_status_idx').on(table.status, table.createdAt),
    providerCheck: check(
      'payment_intents_provider_check',
      sql`${table.provider} = ANY(${sql.raw(`ARRAY['hupijiao','yungouos','creem','stripe','lemonsqueezy']::text[]`)})`,
    ),
    currencyCheck: check(
      'payment_intents_currency_check',
      sql`${table.currency} = ANY(${sql.raw(`ARRAY['CNY','USD']::text[]`)})`,
    ),
  }),
);

export type PaymentIntent = typeof paymentIntents.$inferSelect;
export type NewPaymentIntent = typeof paymentIntents.$inferInsert;