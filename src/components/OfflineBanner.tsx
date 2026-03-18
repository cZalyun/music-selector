import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-rose-600/95 backdrop-blur-sm text-white text-xs font-medium text-center py-2 px-4 flex items-center justify-center gap-2"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <WifiOff size={14} />
          <span>No internet connection — playback and thumbnails require network</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
