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
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-2 text-6xl">{cfg.icon}</div>
        <h1 className="mb-2 text-4xl font-bold">{cfg.name[locale as keyof typeof cfg.name]}</h1>
        <p className="text-muted-foreground">
          {cfg.description[locale as keyof typeof cfg.description]}
        </p>
      </div>

      <div className="mb-6">
        <Disclaimer />
      </div>

      <ModuleStartForm module={module} locale={locale} />
    </div>
  );
}

/**
 * 占卜起始表单（占位版：直接进入 new 页）。
 * 后续可在此扩展成"选择牌阵 + 提问"两步表单。
 */
function ModuleStartForm({ module, locale }: { module: string; locale: string }) {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <Link
        href={`/${locale}/${module}/new`}
        className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90"
      >
        {module === 'tarot' ? '🃏 开始抽牌' : '✨ 开始'}
      </Link>
    </div>
  );
}