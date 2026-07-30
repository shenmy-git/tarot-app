import { TarotNewForm } from '@/components/divination/TarotNewForm';
import { Disclaimer } from '@/components/common/Disclaimer';

export default async function TarotNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">🃏 塔罗解读</h1>
      <p className="mb-8 text-muted-foreground">选择牌阵，输入你的问题，让塔罗为你揭示答案。</p>
      <div className="mb-6">
        <Disclaimer />
      </div>
      <TarotNewForm locale={locale} />
    </div>
  );
}