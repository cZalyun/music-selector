import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_VOLUME } from '@/constants';
import { idbStorage } from './idbStorage';

interface PlayerState {
  currentVideoId: string | null;
  currentSongIndex: number | null;
  isPlaying: boolean;
  volume: number;
  setCurrentSong: (videoId: string, songIndex: number, autoplay?: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentVideoId: null,
      currentSongIndex: null,
      isPlaying: false,
      volume: DEFAULT_VOLUME,

      setCurrentSong: (videoId, songIndex, autoplay = true) =>
        set({ currentVideoId: videoId, currentSongIndex: songIndex, isPlaying: autoplay }),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => set({ volume }),
      stop: () => set({ currentVideoId: null, currentSongIndex: null, isPlaying: false }),
    }),
    {
      name: 'music-selector-player',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ volume: state.volume }),
    },
  ),
);
