import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Disclaimer } from '@/components/common/Disclaimer';
import { DIVINATION_MODULES, isDivinationModule } from '@/config/divination';

interface PageProps {
  params: Promise<{ locale: string; module: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { locale, module } = await params;
  if (!isDivinationModule(module)) {
    return <div className="container mx-auto p-8">Unknown module: {module}</div>;
  }
  const cfg = DIVINATION_MODULES[module];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mb-4 text-7xl mystic-card inline-block rounded-2xl p-6">
          {cfg.icon}
        </div>
        <h1
          className="mb-3 text-4xl font-bold text-gradient"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {cfg.name[locale as keyof typeof cfg.name]}
        </h1>
        <p className="text-purple-200/70">{cfg.description[locale as keyof typeof cfg.description]}</p>
      </div>

      <div className="mb-8">
        <Disclaimer />
      </div>

      <ModuleStartForm module={module} locale={locale} />
    </div>
  );
}

function ModuleStartForm({ module, locale }: { module: string; locale: string }) {
  return (
    <div className="mystic-card rounded-xl p-8 text-center">
      <Link
        href={`/${locale}/${module}/new`}
        className="btn-mystic inline-flex h-14 items-center justify-center rounded-full px-10 text-base font-semibold text-white"
      >
        ✨ {module === 'tarot' ? '开始抽牌' : '开始解读'}
      </Link>
    </div>
  );
}