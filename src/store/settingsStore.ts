import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LoopMode = 'off' | 'one' | 'all';

interface SettingsState {
  autoplay: boolean;
  loopMode: LoopMode;
  autoContinue: boolean;
  shufflePlayback: boolean;
  hideExplicit: boolean;
  toggleAutoplay: () => void;
  cycleLoopMode: () => void;
  toggleAutoContinue: () => void;
  toggleShufflePlayback: () => void;
  toggleHideExplicit: () => void;
}

const loopCycle: LoopMode[] = ['off', 'one', 'all'];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoplay: true,
      loopMode: 'off' as LoopMode,
      autoContinue: false,
      shufflePlayback: false,
      hideExplicit: false,
      toggleAutoplay: () => set((s) => ({ autoplay: !s.autoplay })),
      cycleLoopMode: () =>
        set((s) => ({
          loopMode: loopCycle[(loopCycle.indexOf(s.loopMode) + 1) % loopCycle.length],
        })),
      toggleAutoContinue: () => set((s) => ({ autoContinue: !s.autoContinue })),
      toggleShufflePlayback: () => set((s) => ({ shufflePlayback: !s.shufflePlayback })),
      toggleHideExplicit: () => set((s) => ({ hideExplicit: !s.hideExplicit })),
    }),
    { name: 'music-selector-settings' }
  )
);
