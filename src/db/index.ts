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

  const rawUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error(
      'Database not configured: set SUPABASE_DB_URL or DATABASE_URL',
    );
  }

  // 关键：密码中的特殊字符（! # @ 等）必须 percent-encode
  // 否则 URL.parse 直接抛 Invalid URL
  const connectionString = encodeDbPassword(rawUrl);

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
 * 对 PostgreSQL 连接字符串中的密码进行 percent-encode。
 * 幂等：先 decode 再 encode，避免已编码的密码被二次编码（% -> %25）。
 */
function encodeDbPassword(url: string): string {
  try {
    const m = url.match(/^(postgresql?:\/\/)([^:/@]+):([^@]+)@(.+)$/);
    if (!m) return url;
    const [, scheme, user, pass, rest] = m;
    let raw = pass;
    try {
      raw = decodeURIComponent(pass);
    } catch {
      // pass 含裸 % ，按原样处理
    }
    return `${scheme}${user}:${encodeURIComponent(raw)}@${rest}`;
  } catch {
    return url;
  }
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