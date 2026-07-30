import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client（service role key，绕过 RLS）。
 * 仅服务端使用，**严禁** import 到客户端组件。
 */
let cached: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}