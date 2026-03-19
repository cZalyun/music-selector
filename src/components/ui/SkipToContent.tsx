import { useTranslation } from 'react-i18next';

export function SkipToContent() {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
    >
      {t('a11y.skipToContent')}
    </a>
  );
}
