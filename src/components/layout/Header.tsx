import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher';
import { DIVINATION_MODULES } from '@/config/divination';

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  return (
    <header className="sticky top-0 z-40 border-b border-purple-500/20 bg-background/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-xl font-bold text-gradient"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <span className="text-2xl">✦</span>
            <span>Mystic</span>
          </Link>
          <nav className="hidden gap-4 md:flex">
            {Object.values(DIVINATION_MODULES).map((m) => (
              <Link
                key={m.id}
                href={`/${locale}/${m.id}`}
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
              >
                <span>{m.icon}</span>
                <span>{t(m.id as never)}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}

export function Footer({ locale: _locale }: { locale: string }) {
  return (
    <footer className="relative border-t border-purple-500/20 bg-gradient-to-b from-background to-black/40 py-8">
      <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
        <p className="mb-2 text-gold" style={{ fontFamily: 'var(--font-serif)' }}>
          ✦ Mystic ✦
        </p>
        <p>© {new Date().getFullYear()} Mystic. 解读工具 · 娱乐参考</p>
        <p className="mt-1 opacity-60">
          For entertainment purposes only. 本服务仅供娱乐参考，不构成任何决策建议。
        </p>
      </div>
    </footer>
  );
}