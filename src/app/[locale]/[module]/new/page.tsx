import { redirect } from 'next/navigation';
import { TarotNewForm } from '@/components/divination/TarotNewForm';
import { Disclaimer } from '@/components/common/Disclaimer';
import { isDivinationModule } from '@/config/divination';

interface PageProps {
  params: Promise<{ locale: string; module: string }>;
}

export default async function GenericNewPage({ params }: PageProps) {
  const { locale, module } = await params;

  // 塔罗有专属表单，其他模块暂时重定向到通用 new 页
  if (module === 'tarot') {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">🃏 塔罗解读</h1>
        <p className="mb-8 text-muted-foreground">
          选择牌阵，输入你的问题，让塔罗为你揭示答案。
        </p>
        <div className="mb-6">
          <Disclaimer />
        </div>
        <TarotNewForm locale={locale} />
      </div>
    );
  }

  if (!isDivinationModule(module)) {
    redirect(`/${locale}`);
  }

  // 其他模块：先用占位表单
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6">
        <Disclaimer />
      </div>
      <h1 className="mb-2 text-3xl font-bold">✨ {module}</h1>
      <p className="mb-8 text-muted-foreground">
        本模块的专属表单将在后续版本提供。当前请使用 API。
      </p>
      <a
        href={`/${locale}/${module}`}
        className="text-sm text-primary underline"
      >
        ← 返回模块首页
      </a>
    </div>
  );
}