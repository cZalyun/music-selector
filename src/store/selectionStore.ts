import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idbStorage';
import { Selection, SelectionStatus } from '../types';

interface SelectionState {
  selections: Record<number, Selection>;
  history: Selection[];
  addSelection: (songIndex: number, status: SelectionStatus) => void;
  undoLast: () => Selection | null;
  getSelection: (songIndex: number) => Selection | undefined;
  getSelectionsMap: () => Record<number, Selection>;
  clearSelections: () => void;
  getLikedCount: () => number;
  getDislikedCount: () => number;
  getSkippedCount: () => number;
  getReviewedCount: () => number;
}

const MAX_HISTORY = 50; // Cap undo history to prevent unbounded growth

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      selections: {},
      history: [],

      addSelection: (songIndex, status) => set((state) => {
        const selection: Selection = { songIndex, status, timestamp: Date.now() };
        const newHistory = [...state.history, selection].slice(-MAX_HISTORY);
        return {
          selections: { ...state.selections, [songIndex]: selection },
          history: newHistory,
        };
      }),

      undoLast: () => {
        const { history, selections } = get();
        if (history.length === 0) return null;

        const lastSelection = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        const newSelections = { ...selections };
        delete newSelections[lastSelection.songIndex];

        set({ history: newHistory, selections: newSelections });
        return lastSelection;
      },

      getSelection: (songIndex) => get().selections[songIndex],
      getSelectionsMap: () => get().selections,
      
      clearSelections: () => set({ selections: {}, history: [] }),

      getLikedCount: () => Object.values(get().selections).filter(s => s.status === 'liked').length,
      getDislikedCount: () => Object.values(get().selections).filter(s => s.status === 'disliked').length,
      getSkippedCount: () => Object.values(get().selections).filter(s => s.status === 'skipped').length,
      getReviewedCount: () => Object.keys(get().selections).length,
    }),
    {
      name: 'music-selector-selections',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
