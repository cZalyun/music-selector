import { useToastStore, ToastType } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="text-accent-500" size={20} />,
  error: <AlertCircle className="text-brand-500" size={20} />,
  info: <Info className="text-surface-500" size={20} />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div 
      className="fixed left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none mx-auto max-w-sm"
      style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-lg rounded-xl p-3 pointer-events-auto"
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            <div className="flex-shrink-0">
              {icons[toast.type]}
            </div>
            <p className="flex-1 text-sm font-medium text-surface-900 dark:text-surface-50">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors p-1 rounded-lg"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
