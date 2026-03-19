import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoopMode, Theme } from '@/types';
import { idbStorage } from './idbStorage';

interface SettingsState {
  autoplay: boolean;
  loopMode: LoopMode;
  autoContinue: boolean;
  shufflePlayback: boolean;
  hideExplicit: boolean;
  theme: Theme;
  locale: string;
  toggleAutoplay: () => void;
  cycleLoopMode: () => void;
  toggleAutoContinue: () => void;
  toggleShufflePlayback: () => void;
  toggleHideExplicit: () => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: string) => void;
}

const LOOP_CYCLE: LoopMode[] = ['off', 'one', 'all'];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      autoplay: true,
      loopMode: 'off' as LoopMode,
      autoContinue: true,
      shufflePlayback: false,
      hideExplicit: false,
      theme: 'dark' as Theme,
      locale: 'en',

      toggleAutoplay: () => set((s) => ({ autoplay: !s.autoplay })),
      cycleLoopMode: () => {
        const current = get().loopMode;
        const idx = LOOP_CYCLE.indexOf(current);
        const next = LOOP_CYCLE[(idx + 1) % LOOP_CYCLE.length]!;
        set({ loopMode: next });
      },
      toggleAutoContinue: () => set((s) => ({ autoContinue: !s.autoContinue })),
      toggleShufflePlayback: () => set((s) => ({ shufflePlayback: !s.shufflePlayback })),
      toggleHideExplicit: () => set((s) => ({ hideExplicit: !s.hideExplicit })),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'music-selector-settings',
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
