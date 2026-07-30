'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/config/divination';
import { formatPrice } from '@/payments/pricing';

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
      <section className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">✨ {t('basicResultTitle')}</h2>
        {basicText ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {basicText.split('\n').map((line, i) => (
              <p key={i}>{line || ' '}</p>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            AI 正在解读中...
          </div>
        )}
      </section>

      {/* 深度报告解锁 */}
      {!isPaid && (
        <section className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 text-center">
          <div className="mb-2 text-4xl">🔓</div>
          <h2 className="mb-2 text-2xl font-bold">{t('deepResultTitle')}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{t('deepTeaser')}</p>
          <div className="mb-4 text-3xl font-bold text-primary">
            {formatPrice(deepPrice.amount, deepPrice.currency, locale as Locale)}
          </div>
          <button
            type="button"
            onClick={unlock}
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? '...' : t('unlockButton')}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <p className="mt-3 text-xs text-muted-foreground">{t('paymentMethods')}</p>
        </section>
      )}

      {/* 已支付：跳转深度报告 */}
      {isPaid && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => startTransition(() => router.push(`/${locale}/${module}/report/${sessionId}`))}
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground"
          >
            📖 查看深度解读报告
          </button>
        </div>
      )}
    </div>
  );
}