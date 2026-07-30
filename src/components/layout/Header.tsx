import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/common/LocaleSwitcher';
import { DIVINATION_MODULES } from '@/config/divination';

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="font-bold text-lg text-gradient">
            ✨ Mystic
          </Link>
          <nav className="hidden gap-4 md:flex">
            <Link href={`/${locale}/tarot`} className="text-sm hover:text-primary">
              🃏 {t('tarot')}
            </Link>
            <Link href={`/${locale}/astrology`} className="text-sm hover:text-primary">
              ⭐ {t('astrology')}
            </Link>
            <Link href={`/${locale}/bazi`} className="text-sm hover:text-primary">
              🔮 {t('bazi')}
            </Link>
            <Link href={`/${locale}/yijing`} className="text-sm hover:text-primary">
              ☯️ {t('yijing')}
            </Link>
            <Link href={`/${locale}/dream`} className="text-sm hover:text-primary">
              💭 {t('dream')}
            </Link>
            <Link href={`/${locale}/birthchart`} className="text-sm hover:text-primary">
              🌌 {t('birthchart')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: string }) {
  return (
    <footer className="border-t bg-muted/30 py-6">
      <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Mystic. {DIVINATION_MODULES.tarot.name['zh-CN']} · 解读工具 · 娱乐参考</p>
        <p className="mt-1">
          For entertainment purposes only. 本服务仅供娱乐参考，不构成任何决策建议。
        </p>
      </div>
    </footer>
  );
}