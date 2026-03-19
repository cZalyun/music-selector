import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            className="relative bg-surface-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-surface-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <div className="flex items-center gap-3 mb-3">
              {destructive && (
                <AlertTriangle size={24} className="text-dislike shrink-0" />
              )}
              <h2 id="confirm-title" className="text-lg font-bold text-surface-100">
                {title}
              </h2>
            </div>
            <p id="confirm-message" className="text-surface-400 text-sm mb-6">
              {message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-surface-300 bg-surface-700 hover:bg-surface-600 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
                  destructive
                    ? 'bg-dislike hover:bg-dislike-dark'
                    : 'bg-accent-500 hover:bg-accent-600'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
