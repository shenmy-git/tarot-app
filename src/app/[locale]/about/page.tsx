import { useTranslations } from 'next-intl';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <AboutContent locale={locale} />
    </div>
  );
}

function AboutContent({ locale: _locale }: { locale: string }) {
  const t = useTranslations('about');
  const values = (t.raw('values') as string[]) ?? [];
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">📖 {t('title')}</h1>
      <p className="mb-8 text-lg text-muted-foreground">{t('intro')}</p>
      <ul className="space-y-3">
        {values.map((v, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1 text-primary">●</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}