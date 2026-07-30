/**
 * 简单 SHA-256 + 盐值，用于把用户 IP 哈希后存入数据库（每日配额统计）。
 * 仅在浏览器/服务端边缘运行时可用。
 */
export async function hashIdentifier(input: string, salt = 'tarot-app'): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${input}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 获取客户端 IP（来自 request headers）。在 Vercel 部署下 `x-forwarded-for` 第一个值就是真实 IP。
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  const real = headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

/**
 * 生成简短 ID（用于支付订单号等）。
 */
export function shortId(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}${ts}${rand}`;
}