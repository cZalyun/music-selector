import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';

export type LoopMode = 'off' | 'one' | 'all';

interface SettingsState {
  autoplay: boolean;
  loopMode: LoopMode;
  autoContinue: boolean;
  shufflePlayback: boolean;
  hideExplicit: boolean;
  theme: 'dark' | 'light' | 'system';
  
  toggleAutoplay: () => void;
  cycleLoopMode: () => void;
  toggleAutoContinue: () => void;
  toggleShufflePlayback: () => void;
  toggleHideExplicit: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoplay: true,
      loopMode: 'off',
      autoContinue: true,
      shufflePlayback: false,
      hideExplicit: false,
      theme: 'dark',

      toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
      
      cycleLoopMode: () => set((state) => {
        const modes: LoopMode[] = ['off', 'one', 'all'];
        const currentIndex = modes.indexOf(state.loopMode);
        return { loopMode: modes[(currentIndex + 1) % modes.length] };
      }),
      
      toggleAutoContinue: () => set((state) => ({ autoContinue: !state.autoContinue })),
      
      toggleShufflePlayback: () => set((state) => ({ shufflePlayback: !state.shufflePlayback })),
      
      toggleHideExplicit: () => set((state) => ({ hideExplicit: !state.hideExplicit })),
      
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'music-selector-settings',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
