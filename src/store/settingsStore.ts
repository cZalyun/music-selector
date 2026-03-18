import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoplay: boolean;
  toggleAutoplay: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoplay: true,
      toggleAutoplay: () => set((s) => ({ autoplay: !s.autoplay })),
    }),
    { name: 'music-selector-settings' }
  )
);
