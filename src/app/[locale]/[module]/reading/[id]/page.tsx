import { notFound } from 'next/navigation';
import { Disclaimer } from '@/components/common/Disclaimer';
import { ReadingView } from '@/components/divination/ReadingView';
import { getSessionById } from '@/db/queries/divination';
import { DIVINATION_MODULES, getDeepPrice, isDivinationModule, type Locale } from '@/config/divination';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ReadingPage({ params }: PageProps) {
  const { locale, id } = await params;
  const session = await getSessionById(id);
  if (!session || !isDivinationModule(session.module)) notFound();

  const cfg = DIVINATION_MODULES[session.module];
  const basicText =
    (session.aiBasicResult as { text?: string } | null)?.text ?? null;
  const deepPrice = getDeepPrice(session.module, locale as Locale);
  const isPaid = session.paymentStatus === 'paid';

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <div className="text-4xl mystic-card inline-block rounded-xl p-3">{cfg.icon}</div>
        <div>
          <h1
            className="text-2xl font-bold text-gradient"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {cfg.name[locale as keyof typeof cfg.name]}
          </h1>
          <p className="text-xs text-purple-300/60">
            {new Date(session.createdAt).toLocaleString(locale)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Disclaimer />
      </div>

      <ReadingView
        sessionId={session.id}
        locale={locale}
        module={session.module}
        basicText={basicText}
        isPaid={isPaid}
        deepPrice={deepPrice}
      />
    </div>
  );
}