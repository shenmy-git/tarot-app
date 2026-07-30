import { useTranslations } from 'next-intl';

/**
 * 占卜免责声明：所有占卜结果页顶部固定显示。
 */
export function Disclaimer({ className }: { className?: string }) {
  const t = useTranslations('common');
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-100 ${className ?? ''}`}
    >
      ⚠️ {t('disclaimer')}
    </div>
  );
}