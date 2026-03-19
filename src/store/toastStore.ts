import { create } from 'zustand';
import type { Toast, ToastType } from '@/types';
import { TOAST_AUTO_DISMISS_MS } from '@/constants';

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const role = type === 'error' ? 'alert' : 'status';
    const toast: Toast = { id, message, type, role, createdAt: Date.now() };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    const timer = setTimeout(() => {
      get().removeToast(id);
    }, TOAST_AUTO_DISMISS_MS);
    timers.set(id, timer);
  },

  removeToast: (id) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  pauseToast: (id) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  },

  resumeToast: (id) => {
    const timer = setTimeout(() => {
      get().removeToast(id);
    }, TOAST_AUTO_DISMISS_MS);
    timers.set(id, timer);
  },
}));
