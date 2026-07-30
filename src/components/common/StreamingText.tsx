'use client';

import { useEffect, useState } from 'react';

/**
 * 流式 AI 输出展示：每收到一个 chunk 就追加。
 * 用于占卜结果页和深度报告页。
 */
export function StreamingText({
  source,
  fallback,
  className,
}: {
  source: string | null;
  fallback?: string;
  className?: string;
}) {
  const [text, setText] = useState(fallback ?? '');

  useEffect(() => {
    if (!source) return;
    const es = new EventSource(source);
    es.onmessage = (e) => {
      if (e.data === '[DONE]') {
        es.close();
        return;
      }
      try {
        const data = JSON.parse(e.data) as { delta?: string };
        if (data.delta) setText((prev) => prev + data.delta);
      } catch {
        setText((prev) => prev + e.data);
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [source]);

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className ?? ''}`}>
      {text.split('\n').map((line, i) => (
        <p key={i}>{line || ' '}</p>
      ))}
    </div>
  );
}