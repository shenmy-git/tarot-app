/**
 * Admin 守卫（服务端组件用）。
 */
export function checkAdminToken(token: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  if (!token) return false;
  return token === expected;
}