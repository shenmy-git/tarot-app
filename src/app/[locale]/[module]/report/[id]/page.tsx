import { notFound } from 'next/navigation';
import { Disclaimer } from '@/components/common/Disclaimer';
import { getSessionById } from '@/db/queries/divination';
import { DIVINATION_MODULES, isDivinationModule, type Locale } from '@/config/divination';
import { FEATURES } from '@/config/limits';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { locale, id } = await params;
  const session = await getSessionById(id);
  if (!session || !isDivinationModule(session.module)) notFound();

  if (!FEATURES.FREE_MODE && session.paymentStatus !== 'paid') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1
          className="mb-4 text-2xl font-bold text-gradient"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          ⚠️ 请先解锁
        </h1>
        <p className="text-purple-200/70">
          你需要先完成支付才能查看完整解读报告。
        </p>
        <a
          href={`/${locale}/${session.module}/reading/${id}`}
          className="btn-mystic mt-6 inline-block rounded-full px-6 py-3 text-white"
        >
          返回解读页
        </a>
      </div>
    );
  }

  const cfg = DIVINATION_MODULES[session.module];
  const deepText = (session.aiDeepResult as { text?: string } | null)?.text;
  const isReady = !!deepText;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6">
        <Disclaimer />
      </div>

      <h1
        className="mb-2 text-3xl font-bold text-gradient"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {cfg.icon} {cfg.paidResultLabel[locale as keyof typeof cfg.paidResultLabel]}
      </h1>
      <p className="mb-8 text-sm text-amber-100/60">
        {isReady ? '✦ 完整解读已就绪' : '✦ AI 正在生成完整解读，预计 30-60 秒...'}
      </p>

      {isReady ? (
        <article className="mystic-card rounded-xl p-8 prose prose-lg max-w-none prose-invert prose-headings:text-gold prose-p:text-purple-100/80">
          {deepText.split('\n').map((line, i) => (
            <p key={i}>{line || ' '}</p>
          ))}
        </article>
      ) : (
        <div className="mystic-card flex items-center justify-center gap-3 rounded-xl py-16 text-amber-100/60">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          生成中...
        </div>
      )}
    </div>
  );
}