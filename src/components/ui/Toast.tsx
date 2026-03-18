import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-900/80 border-emerald-700',
  error: 'bg-rose-900/80 border-rose-700',
  info: 'bg-surface-800/80 border-surface-600',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm" style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${colors[toast.type]}`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-sm text-surface-100 flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="text-surface-400 hover:text-surface-200">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
