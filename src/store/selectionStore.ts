import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Selection, SelectionStatus } from '@/types';
import { UNDO_HISTORY_CAP } from '@/constants';
import { idbStorage } from './idbStorage';

interface SelectionState {
  selections: Record<number, Selection>;
  history: Selection[];
  addSelection: (songIndex: number, status: SelectionStatus) => void;
  undoLast: () => Selection | null;
  getSelection: (songIndex: number) => Selection | undefined;
  getSelectionsMap: () => Record<number, Selection>;
  clearSelections: () => void;
  setSelections: (selections: Record<number, Selection>) => void;
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
          history: [...state.history, selection].slice(-UNDO_HISTORY_CAP),
        }));
      },

      undoLast: () => {
        const { history, selections } = get();
        if (history.length === 0) return null;

        const last = history[history.length - 1]!;
        const newSelections = { ...selections };
        delete newSelections[last.songIndex];

        set({
          selections: newSelections,
          history: history.slice(0, -1),
        });

        return last;
      },

      getSelection: (songIndex) => get().selections[songIndex],
      getSelectionsMap: () => get().selections,
      clearSelections: () => set({ selections: {}, history: [] }),
      setSelections: (selections) => set({ selections }),

      getLikedCount: () =>
        Object.values(get().selections).filter((s) => s.status === 'liked').length,
      getDislikedCount: () =>
        Object.values(get().selections).filter((s) => s.status === 'disliked').length,
      getSkippedCount: () =>
        Object.values(get().selections).filter((s) => s.status === 'skipped').length,
      getReviewedCount: () => Object.keys(get().selections).length,
    }),
    {
      name: 'music-selector-selections',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        selections: state.selections,
        history: state.history,
      }),
    },
  ),
);
