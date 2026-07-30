import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.SUPABASE_DB_URL ??
  process.env.DATABASE_URL ??
  // 本地 fallback，避免 import 时崩溃
  'postgresql://localhost/placeholder';

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__pgClient ??
  postgres(connectionString, {
    prepare: false, // Supabase pooler 需要 prepare:false
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__pgClient = client;
}

export const db = drizzle(client, { schema });
export { schema };