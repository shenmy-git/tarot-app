-- 0001_init.sql
-- 初始 schema：5 张表 + 索引 + 约束
-- 由 drizzle-kit generate 等价生成

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- divination_sessions
-- ============================================
CREATE TABLE IF NOT EXISTS divination_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL CHECK (module IN ('tarot','astrology','bazi','yijing','dream','birthchart')),
  locale TEXT NOT NULL CHECK (locale IN ('zh-CN','zh-TW','en')),
  user_inputs JSONB NOT NULL,
  ai_basic_result JSONB,
  ai_deep_result JSONB,
  payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free','pending','paid','refunded','failed')),
  payment_intent_id UUID,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS divination_sessions_module_idx ON divination_sessions (module, created_at DESC);
CREATE INDEX IF NOT EXISTS divination_sessions_ip_idx ON divination_sessions (ip_hash, created_at DESC);

-- ============================================
-- payment_intents
-- ============================================
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('hupijiao','yungouos','creem','stripe','lemonsqueezy')),
  external_id TEXT,
  session_id UUID REFERENCES divination_sessions(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  module TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('CNY','USD')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  customer_email TEXT,
  raw_webhook JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_intents_provider_external_idx
  ON payment_intents (provider, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payment_intents_session_idx ON payment_intents (session_id);
CREATE INDEX IF NOT EXISTS payment_intents_status_idx ON payment_intents (status, created_at DESC);

ALTER TABLE divination_sessions
  ADD CONSTRAINT divination_sessions_payment_intent_fk
  FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id) ON DELETE SET NULL;

-- ============================================
-- entries (百科词条，多语言 + 全文搜索)
-- ============================================
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title JSONB NOT NULL,
  summary JSONB,
  body JSONB,
  source TEXT,
  source_url TEXT,
  category TEXT,
  tags TEXT[],
  search_tsv TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entries_slug_idx ON entries (slug);
CREATE INDEX IF NOT EXISTS entries_category_idx ON entries (category);
CREATE INDEX IF NOT EXISTS entries_tsv_idx ON entries USING GIN (search_tsv);

-- ============================================
-- knowledge_cards (静态知识)
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_cards (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  name JSONB NOT NULL,
  upright_meaning JSONB NOT NULL,
  reversed_meaning JSONB,
  description JSONB,
  image_url TEXT,
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS knowledge_cards_module_idx ON knowledge_cards (module);

-- ============================================
-- ai_jobs (AI 调用日志)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES divination_sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd NUMERIC(10,6),
  duration_ms INTEGER,
  status TEXT,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_jobs_session_idx ON ai_jobs (session_id);
CREATE INDEX IF NOT EXISTS ai_jobs_type_idx ON ai_jobs (type, created_at DESC);

-- ============================================
-- RLS 策略
-- ============================================
-- 公开读：entries + knowledge_cards（任何人都可读）
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entries_anon_read" ON entries FOR SELECT TO anon USING (true);
CREATE POLICY "knowledge_cards_anon_read" ON knowledge_cards FOR SELECT TO anon USING (true);

-- 服务端写：所有写操作走 service role，不开 RLS policy
-- divination_sessions / payment_intents / ai_jobs 不开 anon read，避免数据泄露
ALTER TABLE divination_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- 自动更新 search_tsv 的触发器（简化版：手动写入触发）
CREATE OR REPLACE FUNCTION entries_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('simple', coalesce(NEW.title::text, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.summary::text, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.body::text, '')), 'C');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entries_tsv_trigger ON entries;
CREATE TRIGGER entries_tsv_trigger
  BEFORE INSERT OR UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION entries_tsv_update();