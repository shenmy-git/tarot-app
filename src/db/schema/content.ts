import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  uuid,
  jsonb,
  timestamp,
  index,
  customType,
} from 'drizzle-orm/pg-core';

/** Postgres tsvector 自定义类型，用于全文搜索。 */
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

/**
 * 百科/科普词条（多语言）。
 * 用于"知识搜索"和 SEO 长尾流量。
 */
export const entries = pgTable(
  'entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: jsonb('title').notNull(), // { "zh-CN": "...", "en": "..." }
    summary: jsonb('summary'),
    body: jsonb('body'), // markdown (per locale)
    source: text('source'), // wikipedia / manual / ai
    sourceUrl: text('source_url'),
    category: text('category'),
    tags: text('tags').array(),
    searchTsv: tsvector('search_tsv'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('entries_slug_idx').on(table.slug),
    categoryIdx: index('entries_category_idx').on(table.category),
    tsvIdx: index('entries_tsv_idx').using('gin', table.searchTsv),
  }),
);

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

/**
 * 通用搜索：在 tsvector 上做 websearch_to_tsquery。
 * 使用：select * from entries where search_tsv @@ websearch_to_tsquery('simple', $1);
 */
export const searchEntries = sql`
  SELECT id, slug, title, summary, source_url, category
  FROM ${entries}
  WHERE ${entries.searchTsv} @@ websearch_to_tsquery('simple', $1)
  ORDER BY ts_rank(${entries.searchTsv}, websearch_to_tsquery('simple', $1)) DESC
  LIMIT 20
`;