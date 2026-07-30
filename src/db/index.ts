import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: Sql | undefined;
  // eslint-disable-next-line no-var
  var __db: PostgresJsDatabase<typeof schema> | undefined;
}

let cachedDb: PostgresJsDatabase<typeof schema> | null = null;

function buildDb(): PostgresJsDatabase<typeof schema> {
  if (global.__db) return global.__db;

  const connectionString =
    process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'Database not configured: set SUPABASE_DB_URL or DATABASE_URL',
    );
  }

  const client: Sql =
    global.__pgClient ??
    postgres(connectionString, {
      prepare: false,
      max: 10,
    });

  if (process.env.NODE_ENV !== 'production') {
    global.__pgClient = client;
  }

  global.__db = drizzle(client, { schema });
  return global.__db;
}

/**
 * 懒加载 Proxy：避免 build 阶段在没 env 时尝试连接 Postgres。
 * 任何 `db.xxx` 调用都会按需触发 `buildDb()`。
 */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    const real = cachedDb ?? buildDb();
    cachedDb = real;
    return Reflect.get(real, prop);
  },
});

export { schema };