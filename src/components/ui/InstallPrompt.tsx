import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="bg-surface-800 border border-surface-600 rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-accent-600/20 flex items-center justify-center shrink-0">
            <Download size={20} className="text-accent-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-100">Install App</p>
            <p className="text-xs text-surface-400">Add to home screen for the best experience</p>
          </div>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-accent-600 hover:bg-accent-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Install
          </button>
          <button onClick={() => setDismissed(true)} className="text-surface-500 hover:text-surface-300">
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
