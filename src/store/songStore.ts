import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song } from '../types';

interface SongState {
  songs: Song[];
  fileName: string | null;
  setSongs: (songs: Song[], fileName: string) => void;
  clearSongs: () => void;
}

export const useSongStore = create<SongState>()(
  persist(
    (set) => ({
      songs: [],
      fileName: null,
      setSongs: (songs, fileName) => set({ songs, fileName }),
      clearSongs: () => set({ songs: [], fileName: null }),
    }),
    { name: 'music-selector-songs' }
  )
);
