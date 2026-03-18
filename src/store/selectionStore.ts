import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Selection, SelectionStatus } from '../types';

interface SelectionState {
  selections: Record<number, Selection>;
  history: Selection[];
  addSelection: (songIndex: number, status: SelectionStatus) => void;
  undoLast: () => Selection | null;
  getSelection: (songIndex: number) => Selection | undefined;
  getSelectionsMap: () => Map<number, Selection>;
  clearSelections: () => void;
  getLikedCount: () => number;
  getDislikedCount: () => number;
  getSkippedCount: () => number;
  getReviewedCount: () => number;
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      selections: {},
      history: [],

      addSelection: (songIndex, status) => {
        const selection: Selection = { songIndex, status, timestamp: Date.now() };
        set((state) => ({
          selections: { ...state.selections, [songIndex]: selection },
          history: [...state.history, selection],
        }));
      },

      undoLast: () => {
        const state = get();
        if (state.history.length === 0) return null;
        const last = state.history[state.history.length - 1];
        const newSelections = { ...state.selections };
        delete newSelections[last.songIndex];
        set({
          selections: newSelections,
          history: state.history.slice(0, -1),
        });
        return last;
      },

      getSelection: (songIndex) => get().selections[songIndex],

      getSelectionsMap: () => new Map(Object.entries(get().selections).map(([k, v]) => [Number(k), v])),

      clearSelections: () => set({ selections: {}, history: [] }),

      getLikedCount: () => Object.values(get().selections).filter((s) => s.status === 'liked').length,
      getDislikedCount: () => Object.values(get().selections).filter((s) => s.status === 'disliked').length,
      getSkippedCount: () => Object.values(get().selections).filter((s) => s.status === 'skipped').length,
      getReviewedCount: () => Object.keys(get().selections).length,
    }),
    { name: 'music-selector-selections' }
  )
);
