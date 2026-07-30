import { useTranslations } from 'next-intl';
import { Disclaimer } from '@/components/common/Disclaimer';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1
        className="mb-10 text-center text-4xl font-bold text-gradient"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        💎 价格
      </h1>
      <div className="mb-10">
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
        <div className="mystic-card rounded-xl p-6">
          <div className="mb-2 text-3xl">✨</div>
          <h3 className="mb-2 text-xl font-bold text-foreground">{t('freeTitle')}</h3>
          <p className="text-sm text-purple-200/70">{t('freeDesc')}</p>
          <div className="mt-4 text-2xl font-bold text-gold">免费</div>
        </div>
        <div className="mystic-card rounded-xl p-6 ring-1 ring-amber-500/40">
          <div className="mb-2 text-3xl">💫</div>
          <h3 className="mb-2 text-xl font-bold text-gold">{t('deepTitle')}</h3>
          <p className="text-sm text-purple-200/70">{t('deepDesc')}</p>
          <div className="mt-4 text-2xl font-bold text-gradient">
            ¥9.90 起 / $1.99 起
          </div>
        </div>
      </div>

      <div className="mt-14">
        <h2
          className="mb-6 text-2xl font-bold text-gradient"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          ✦ {t('faqTitle')}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="mystic-card rounded-lg p-5">
              <h4 className="mb-2 font-semibold text-amber-100">{faq.q}</h4>
              <p className="text-sm text-purple-200/70">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}