import type { Config } from 'drizzle-kit';

if (!process.env.SUPABASE_DB_URL) {
  console.warn('[drizzle.config] SUPABASE_DB_URL is not set; db commands will fail until configured');
}

export default {
  schema: './src/db/schema/*.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL ?? 'postgresql://localhost/placeholder',
  },
  verbose: true,
  strict: true,
} satisfies Config;