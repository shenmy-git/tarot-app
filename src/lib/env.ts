import { z } from 'zod';

// 客户端可见的 env（NEXT_PUBLIC_ 前缀）
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

// 服务端 env
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_DB_URL: z.string().optional(),

  AI_GATEWAY_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_DEV: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  HUPIJIAO_APP_ID: z.string().optional(),
  HUPIJIAO_APP_SECRET: z.string().optional(),
  HUPIJIAO_NOTIFY_URL: z.string().optional(),

  YUNGOUOS_MCH_ID: z.string().optional(),
  YUNGOUOS_API_KEY: z.string().optional(),
  YUNGOUOS_NOTIFY_URL: z.string().optional(),

  CREEM_API_KEY: z.string().optional(),
  CREEM_WEBHOOK_SECRET: z.string().optional(),
  CREEM_PRODUCT_ID_TAROT_BASIC: z.string().optional(),
  CREEM_PRODUCT_ID_TAROT_DEEP: z.string().optional(),
  CREEM_PRODUCT_ID_ASTROLOGY_BASIC: z.string().optional(),
  CREEM_PRODUCT_ID_ASTROLOGY_DEEP: z.string().optional(),
  CREEM_PRODUCT_ID_BAZI_BASIC: z.string().optional(),
  CREEM_PRODUCT_ID_BAZI_DEEP: z.string().optional(),
  CREEM_PRODUCT_ID_DREAM_BASIC: z.string().optional(),
  CREEM_PRODUCT_ID_DREAM_DEEP: z.string().optional(),
  CREEM_PRODUCT_ID_YIJING_BASIC: z.string().optional(),
  CREEM_PRODUCT_ID_YIJING_DEEP: z.string().optional(),
  CREEM_PRODUCT_ID_BIRTHCHART_BASIC: z.string().optional(),
  CREEM_PRODUCT_ID_BIRTHCHART_DEEP: z.string().optional(),

  ADMIN_TOKEN: z.string().optional(),
  PAYMENT_PRIMARY: z.enum(['hupijiao', 'yungouos', 'creem']).default('hupijiao'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * 解析公共 env。失败时返回空对象（开发期容错，避免阻塞页面渲染）。
 */
export function getPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  return parsed.success ? parsed.data : publicEnvSchema.parse({});
}

/**
 * 解析服务端 env。仅在调用时校验，开发期返回空对象。
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  return parsed.success ? parsed.data : serverEnvSchema.parse({});
}