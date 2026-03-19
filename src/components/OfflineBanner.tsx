import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 bg-skip/90 text-surface-950 text-center text-sm font-medium"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: -50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          role="alert"
        >
          <div className="flex items-center justify-center gap-2 py-2">
            <WifiOff size={16} />
            <span>{t('toast.offline')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
