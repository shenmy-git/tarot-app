'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { drawRandomCards } from '@/ai/tarot-deck';

type SpreadId = 'single' | 'three' | 'celtic';

interface SpreadConfig {
  id: SpreadId;
  count: number;
  positions: string[]; // 多语言
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
      cardName:
        d.card.name[locale as 'zh-CN' | 'zh-TW' | 'en'] ?? d.card.name['en'],
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
      alert('创建失败，请重试');
      return;
    }
    const { sessionId } = (await res.json()) as { sessionId: string };

    startTransition(() => {
      router.push(`/${locale}/tarot/reading/${sessionId}`);
    });
  }

  const spreadEntries: SpreadId[] = ['single', 'three', 'celtic'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t('spreadsTitle')}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {spreadEntries.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSpread(id)}
              className={`rounded-lg border p-4 text-left transition ${
                spread === id ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
              }`}
            >
              <div className="mb-1 font-semibold">{t(`spreads.${id}.name`)}</div>
              <div className="text-xs text-muted-foreground">{t(`spreads.${id}.desc`)}</div>
              <div className="mt-2 text-xs">
                {SPREADS[id].count} {SPREADS[id].count === 1 ? 'card' : 'cards'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="question" className="mb-2 block text-sm font-medium">
          {t('questionLabel')}
        </label>
        <textarea
          id="question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('questionPlaceholder')}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={isPending || !question.trim()}
        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? '...' : `✨ ${t('drawButton')}`}
      </button>
    </div>
  );
}