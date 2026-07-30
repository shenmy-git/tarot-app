'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/config/divination';
import { formatPrice } from '@/payments/pricing';
import { FEATURES } from '@/config/limits';

interface ReadingViewProps {
  sessionId: string;
  locale: string;
  module: string;
  basicText: string | null;
  isPaid: boolean;
  deepPrice: { amount: number; currency: 'CNY' | 'USD' };
}

export function ReadingView({ sessionId, locale, module, basicText, isPaid, deepPrice }: ReadingViewProps) {
  const t = useTranslations('tarot');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(basicText);
  const [genError, setGenError] = useState<string | null>(null);

  // 基础解读尚未生成 → 按需触发（不依赖 Inngest）
  useEffect(() => {
    if (text) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/divination/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, tier: 'basic' }),
        });
        const data = (await res.json()) as { text?: string; message?: string };
        if (cancelled) return;
        if (!res.ok || !data.text) {
          setGenError(data.message ?? '解读生成失败，请刷新重试');
          return;
        }
        setText(data.text);
      } catch {
        if (!cancelled) setGenError('网络异常，请刷新重试');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, text]);

  async function unlock() {
    setError(null);
    const res = await fetch('/api/payments/router', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, module }),
    });
    if (!res.ok) {
      setError('支付初始化失败，请稍后再试');
      return;
    }
    const data = (await res.json()) as { redirectUrl: string };
    if (data.redirectUrl === 'about:blank') {
      setError('支付通道暂未配置');
      return;
    }
    // 跳到支付
    window.location.href = data.redirectUrl;
  }

  return (
    <div className="space-y-8">
      {/* 基础解读 */}
      <section className="mystic-card rounded-xl p-6">
        <h2 className="mb-4 text-xl font-bold text-gold" style={{ fontFamily: 'var(--font-serif)' }}>
          ✨ {t('basicResultTitle')}
        </h2>
        {text ? (
          <div className="prose prose-sm max-w-none prose-invert prose-p:text-purple-100/80">
            {text.split('\n').map((line, i) => (
              <p key={i}>{line || ' '}</p>
            ))}
          </div>
        ) : genError ? (
          <p className="text-sm text-destructive">{genError}</p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            AI 正在解读中...
          </div>
        )}
      </section>

      {/* 深度解读入口（全流程免费） */}
      {FEATURES.FREE_MODE ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => startTransition(() => router.push(`/${locale}/${module}/report/${sessionId}`))}
            disabled={isPending}
            className="btn-mystic inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold text-white disabled:opacity-50"
          >
            {isPending ? '...' : '📖 查看深度解读报告'}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">✦ 全部内容免费</p>
        </div>
      ) : !isPaid ? (
        <section className="mystic-card rounded-xl p-8 text-center">
          <div className="mb-2 text-4xl">🔓</div>
          <h2 className="mb-2 text-2xl font-bold text-gradient" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('deepResultTitle')}
          </h2>
          <p className="mb-6 text-sm text-purple-200/70">{t('deepTeaser')}</p>
          <div className="mb-4 text-3xl font-bold text-gold">
            {formatPrice(deepPrice.amount, deepPrice.currency, locale as Locale)}
          </div>
          <button
            type="button"
            onClick={unlock}
            disabled={isPending}
            className="btn-mystic inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold text-white disabled:opacity-50"
          >
            {isPending ? '...' : t('unlockButton')}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <p className="mt-3 text-xs text-muted-foreground">{t('paymentMethods')}</p>
        </section>
      ) : (
        <div className="text-center">
          <button
            type="button"
            onClick={() => startTransition(() => router.push(`/${locale}/${module}/report/${sessionId}`))}
            className="btn-mystic inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold text-white"
          >
            📖 查看深度解读报告
          </button>
        </div>
      )}
    </div>
  );
}