import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import type { ToastType } from '@/types';

const ICON_MAP: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLOR_MAP: Record<ToastType, string> = {
  success: 'border-like/30 bg-like/10',
  error: 'border-dislike/30 bg-dislike/10',
  info: 'border-surface-600 bg-surface-800',
};

const ICON_COLOR_MAP: Record<ToastType, string> = {
  success: 'text-like',
  error: 'text-dislike',
  info: 'text-accent-400',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  const pauseToast = useToastStore((s) => s.pauseToast);
  const resumeToast = useToastStore((s) => s.resumeToast);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4"
      style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type];
          return (
            <motion.div
              key={toast.id}
              role={toast.role}
              aria-live={toast.role === 'alert' ? 'assertive' : 'polite'}
              aria-atomic="true"
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full ${COLOR_MAP[toast.type]}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => pauseToast(toast.id)}
              onMouseLeave={() => resumeToast(toast.id)}
              onFocus={() => pauseToast(toast.id)}
              onBlur={() => resumeToast(toast.id)}
            >
              <Icon size={18} className={`shrink-0 ${ICON_COLOR_MAP[toast.type]}`} />
              <span className="text-sm text-surface-100 flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-surface-400 hover:text-surface-200 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
