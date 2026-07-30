import { useTranslations } from 'next-intl';

/**
 * 占卜免责声明：所有占卜结果页顶部固定显示。
 */
export function Disclaimer({ className }: { className?: string }) {
  const t = useTranslations('common');
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20 p-3 text-sm text-amber-100 backdrop-blur ${className ?? ''}`}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-300 to-amber-600" />
      <span className="ml-2">⚠️ {t('disclaimer')}</span>
    </div>
  );
}