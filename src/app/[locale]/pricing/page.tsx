import { useTranslations } from 'next-intl';
import { Disclaimer } from '@/components/common/Disclaimer';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold">💎 价格</h1>
      <div className="mb-8">
        <Disclaimer />
      </div>
      <PricingContent locale={locale} />
    </div>
  );
}

function PricingContent({ locale: _locale }: { locale: string }) {
  const t = useTranslations('pricing');
  const faqs = (t.raw('faqs') as Array<{ q: string; a: string }>) ?? [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 text-2xl">✨</div>
          <h3 className="mb-2 text-xl font-bold">{t('freeTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('freeDesc')}</p>
          <div className="mt-4 text-2xl font-bold">免费</div>
        </div>
        <div className="rounded-xl border-2 border-primary bg-card p-6">
          <div className="mb-2 text-2xl">💫</div>
          <h3 className="mb-2 text-xl font-bold">{t('deepTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('deepDesc')}</p>
          <div className="mt-4 text-2xl font-bold text-primary">
            ¥9.90 起 / $1.99 起
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">{t('faqTitle')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <h4 className="mb-2 font-semibold">{faq.q}</h4>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}