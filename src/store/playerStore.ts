import { create } from 'zustand';

interface PlayerState {
  currentVideoId: string | null;
  currentSongIndex: number | null;
  isPlaying: boolean;
  volume: number;
  setCurrentSong: (videoId: string, songIndex: number, autoplay?: boolean) => void;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  currentVideoId: null,
  currentSongIndex: null,
  isPlaying: false,
  volume: 70,

  setCurrentSong: (videoId, songIndex, autoplay = true) => 
    set({ currentVideoId: videoId, currentSongIndex: songIndex, isPlaying: autoplay }),
    
  setPlaying: (isPlaying) => set({ isPlaying }),
  
  setVolume: (volume) => set({ volume }),
  
  stop: () => set({ currentVideoId: null, currentSongIndex: null, isPlaying: false }),
}));
