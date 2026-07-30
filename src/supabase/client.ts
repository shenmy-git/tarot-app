'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * 浏览器端 Supabase client（用于客户端 RSC 交互）。
 * 当前项目无 Auth，主要用于客户端读取 entries / knowledge_cards（anon 读权限已开启）。
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }
  return createBrowserClient(url, key);
}