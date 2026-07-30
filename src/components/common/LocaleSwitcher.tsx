'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const LOCALES = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
] as const;

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const t = useTranslations('common');

  function switchTo(locale: string) {
    const path = window.location.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, `/${locale}`);
    startTransition(() => router.push(path));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
      >
        🌐 {LOCALES.find((l) => l.code === currentLocale)?.label}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-md border bg-background shadow-lg">
          {LOCALES.filter((l) => l.code !== currentLocale).map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => switchTo(l.code)}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
            >
              {t('switchTo')} {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}