'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { drawRandomCards } from '@/ai/tarot-deck';

type SpreadId = 'single' | 'three' | 'celtic';

interface SpreadConfig {
  id: SpreadId;
  count: number;
  positions: string[];
}

const SPREADS: Record<SpreadId, SpreadConfig> = {
  single: { id: 'single', count: 1, positions: ['core'] },
  three: { id: 'three', count: 3, positions: ['past', 'present', 'future'] },
  celtic: {
    id: 'celtic',
    count: 10,
    positions: [
      'present',
      'challenge',
      'foundation',
      'past',
      'crown',
      'near_future',
      'self',
      'environment',
      'hopes_fears',
      'outcome',
    ],
  },
};

export function TarotNewForm({ locale }: { locale: string }) {
  const t = useTranslations('tarot');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spread, setSpread] = useState<SpreadId>('single');
  const [question, setQuestion] = useState('');

  async function submit() {
    const cfg = SPREADS[spread];
    const drawn = drawRandomCards(cfg.count);

    const cards = drawn.map((d, i) => ({
      cardId: d.card.id,
      cardName: d.card.name[locale as 'zh-CN' | 'zh-TW' | 'en'] ?? d.card.name['en'],
      position: cfg.positions[i] ?? `card_${i + 1}`,
      upright: d.upright,
    }));

    const res = await fetch('/api/divination/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: 'tarot',
        locale,
        spread,
        question,
        cards,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[tarot] create failed', res.status, text);
      alert(`创建失败 (${res.status}): ${text.slice(0, 200)}`);
      return;
    }
    const { sessionId } = (await res.json()) as { sessionId: string };

    startTransition(() => {
      router.push(`/${locale}/tarot/reading/${sessionId}`);
    });
  }

  const spreadEntries: SpreadId[] = ['single', 'three', 'celtic'];

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="mb-4 text-lg font-semibold text-gold"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          ✦ {t('spreadsTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {spreadEntries.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSpread(id)}
              className={`mystic-card rounded-xl p-5 text-left transition-all ${
                spread === id ? 'ring-2 ring-amber-500/60' : ''
              }`}
            >
              <div className="mb-1 font-semibold text-foreground">{t(`spreads.${id}.name`)}</div>
              <div className="text-xs text-purple-200/60">{t(`spreads.${id}.desc`)}</div>
              <div className="mt-3 text-xs text-gold">
                ✦ {SPREADS[id].count} {SPREADS[id].count === 1 ? 'card' : 'cards'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="question"
          className="mb-2 block text-sm font-medium text-amber-100/80"
        >
          ✦ {t('questionLabel')}
        </label>
        <textarea
          id="question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder')}
          className="w-full rounded-lg border border-purple-500/30 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-purple-300/40 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={isPending || !question.trim()}
        className="btn-mystic inline-flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white disabled:opacity-50"
      >
        {isPending ? '...' : `✨ ${t('drawButton')}`}
      </button>
    </div>
  );
}