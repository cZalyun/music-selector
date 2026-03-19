import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallPrompt() {
  const { canInstall, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();

  if (!canInstall || dismissed || isIOS) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-40 left-4 right-4 bg-surface-800 border border-surface-700 rounded-2xl p-4 shadow-2xl flex items-center gap-3"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <Download size={20} className="text-accent-400 shrink-0" />
        <span className="text-sm text-surface-200 flex-1">
          {t('pwa.installBanner')}
        </span>
        <button
          onClick={install}
          className="px-3 py-1.5 bg-accent-500 text-white text-sm font-medium rounded-lg hover:bg-accent-600 transition-colors"
          aria-label={t('pwa.install')}
        >
          {t('pwa.install')}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-surface-400 hover:text-surface-200 transition-colors"
          aria-label={t('pwa.dismiss')}
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
