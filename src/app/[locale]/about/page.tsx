import { useTranslations } from 'next-intl';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <AboutContent locale={locale} />
    </div>
  );
}

function AboutContent({ locale: _locale }: { locale: string }) {
  const t = useTranslations('about');
  const values = (t.raw('values') as string[]) ?? [];
  return (
    <div>
      <h1
        className="mb-6 text-3xl font-bold text-gradient"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        ✦ {t('title')}
      </h1>
      <p className="mb-10 text-lg text-purple-200/70">{t('intro')}</p>
      <ul className="space-y-4">
        {values.map((v, i) => (
          <li key={i} className="mystic-card flex items-start gap-3 rounded-lg p-4">
            <span className="mt-1 text-gold">✦</span>
            <span className="text-purple-100/80">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}