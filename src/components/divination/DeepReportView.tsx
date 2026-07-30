'use client';

import { useEffect, useState } from 'react';

interface DeepReportViewProps {
  sessionId: string;
  initialText: string | null;
}

/**
 * 深度解读展示 + 按需生成（不依赖 Inngest）。
 */
export function DeepReportView({ sessionId, initialText }: DeepReportViewProps) {
  const [text, setText] = useState<string | null>(initialText);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (text) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/divination/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, tier: 'deep' }),
        });
        const data = (await res.json()) as { text?: string; message?: string };
        if (cancelled) return;
        if (!res.ok || !data.text) {
          setError(data.message ?? '完整解读生成失败，请刷新重试');
          return;
        }
        setText(data.text);
      } catch {
        if (!cancelled) setError('网络异常，请刷新重试');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, text]);

  if (text) {
    return (
      <>
        <p className="mb-8 text-sm text-amber-100/60">✦ 完整解读已就绪</p>
        <article className="mystic-card rounded-xl p-8 prose prose-lg max-w-none prose-invert prose-headings:text-gold prose-p:text-purple-100/80">
          {text.split('\n').map((line, i) => (
            <p key={i}>{line || ' '}</p>
          ))}
        </article>
      </>
    );
  }

  if (error) {
    return (
      <div className="mystic-card rounded-xl p-8 text-center text-sm text-destructive">{error}</div>
    );
  }

  return (
    <>
      <p className="mb-8 text-sm text-amber-100/60">
        ✦ AI 正在生成完整解读，预计 30-60 秒...
      </p>
      <div className="mystic-card flex items-center justify-center gap-3 rounded-xl py-16 text-amber-100/60">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        生成中...
      </div>
    </>
  );
}
