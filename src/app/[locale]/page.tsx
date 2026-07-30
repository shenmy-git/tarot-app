import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { DIVINATION_MODULES, type ModuleConfig } from '@/config/divination';
import { Disclaimer } from '@/components/common/Disclaimer';

export default async function HomePage({
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
      <div className="container mx-auto px-4 py-12">
        <Disclaimer />
      </div>
    </>
  );
}

function Hero({ locale: _locale }: { locale: string }) {
  const t = useTranslations('home');
  return (
    <section className="relative overflow-hidden gradient-cosmos starfield py-28 text-center">
      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-6 inline-block">
          <span className="text-7xl">✦</span>
        </div>
        <h1 className="mb-6 text-5xl font-bold text-white glow-text md:text-7xl">
          <span className="text-gradient">{t('hero.title')}</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-purple-100/80 md:text-xl">
          {t('hero.subtitle')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#modules"
            className="btn-mystic inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-semibold text-white"
          >
            ✨ {t('cta')}
          </a>
        </div>
      </div>
    </section>
  );
}

function ModulesGrid({ locale }: { locale: string }) {
  const t = useTranslations('home');
  const modules = Object.values(DIVINATION_MODULES);

  return (
    <section id="modules" className="container mx-auto px-4 py-20">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
        <span className="text-gradient">{t('modulesTitle')}</span>
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m: ModuleConfig) => {
          const name = m.name[locale as keyof typeof m.name];
          const desc = m.description[locale as keyof typeof m.description];
          return (
            <Link
              key={m.id}
              href={`/${locale}/${m.id}`}
              className="mystic-card group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
            >
              {/* 角落装饰 */}
              <div className="absolute right-3 top-3 text-xs text-purple-300/40">
                ✦
              </div>
              <div className="mb-4 text-5xl transition-transform duration-500 group-hover:scale-110">
                {m.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-gold">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-purple-300/70 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span>{t('cta')}</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}