import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { DIVINATION_MODULES, type DivinationModule } from '@/config/divination';
import { Disclaimer } from '@/components/common/Disclaimer';

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <HomeContent params={params} />;
}

async function HomeContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <Hero locale={locale} />
      <ModulesGrid locale={locale} />
      <div className="container mx-auto px-4 py-8">
        <Disclaimer />
      </div>
    </>
  );
}

function Hero({ locale }: { locale: string }) {
  const t = useTranslations('home');
  return (
    <section className="gradient-mystic py-20 text-center text-white">
      <div className="container mx-auto px-4">
        <h1 className="mb-4 text-4xl font-bold md:text-6xl">{t('hero.title')}</h1>
        <p className="mx-auto max-w-2xl text-lg opacity-90">{t('hero.subtitle')}</p>
      </div>
    </section>
  );
}

function ModulesGrid({ locale }: { locale: string }) {
  const t = useTranslations('home');
  const modules = Object.values(DIVINATION_MODULES);

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="mb-8 text-center text-3xl font-bold">{t('modulesTitle')}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m: import('@/config/divination').ModuleConfig) => {
          const name = m.name[locale as keyof typeof m.name];
          const desc = m.description[locale as keyof typeof m.description];
          return (
            <Link
              key={m.id}
              href={`/${locale}/${m.id}`}
              className="group rounded-xl border bg-card p-6 transition hover:border-primary hover:shadow-lg"
            >
              <div className="mb-4 text-5xl">{m.icon}</div>
              <h3 className="mb-2 text-xl font-bold group-hover:text-primary">{name}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
              <div className="mt-4 text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                {t('cta')} →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}