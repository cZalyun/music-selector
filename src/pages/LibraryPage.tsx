import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Library, Shuffle } from 'lucide-react';
import SearchBar from '../components/library/SearchBar';
import FilterChips from '../components/library/FilterChips';
import SongList from '../components/library/SongList';
import { useSongStore } from '../store/songStore';
import { useSelectionStore } from '../store/selectionStore';
import { usePlayerStore } from '../store/playerStore';
import { useSettingsStore } from '../store/settingsStore';
import { filterSongs } from '../utils/search';
import { groupSongs } from '../utils/grouping';
import type { FilterState, LibraryTab, GroupBy, SortField } from '../types';

export default function LibraryPage() {
  const songs = useSongStore((s) => s.songs);
  const selections = useSelectionStore((s) => s.selections);
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);
  const hideExplicit = useSettingsStore((s) => s.hideExplicit);

  const selectionsMap = useMemo(
    () => new Map(Object.entries(selections).map(([k, v]) => [Number(k), v])),
    [selections]
  );

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tab: 'all',
    sortField: 'index',
    sortDirection: 'asc',
    groupBy: 'none',
    hideExplicit: false,
  });

  const counts = useMemo(() => ({
    all: songs.length,
    liked: Object.values(selections).filter((s) => s.status === 'liked').length,
    disliked: Object.values(selections).filter((s) => s.status === 'disliked').length,
    unreviewed: songs.filter((s) => !selections[s.index]).length,
  }), [songs, selections]);

  const filtered = useMemo(
    () => filterSongs(songs, selectionsMap, { ...filters, hideExplicit }),
    [songs, selectionsMap, filters, hideExplicit]
  );

  const groups = useMemo(
    () => groupSongs(filtered, filters.groupBy),
    [filtered, filters.groupBy]
  );

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
          <Library size={28} className="text-surface-600" />
        </div>
        <h2 className="text-lg font-bold text-surface-300 mb-2">Library Empty</h2>
        <p className="text-sm text-surface-500">Upload a CSV to see your songs here</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-4 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <SearchBar value={filters.search} onChange={(v) => updateFilter('search', v)} />
      </motion.div>

      <FilterChips
        tab={filters.tab}
        onTabChange={(v: LibraryTab) => updateFilter('tab', v)}
        groupBy={filters.groupBy}
        onGroupByChange={(v: GroupBy) => updateFilter('groupBy', v)}
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        onSortChange={(v: SortField) => updateFilter('sortField', v)}
        onDirectionToggle={() => updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
        counts={counts}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-500">
          {filtered.length} song{filtered.length !== 1 ? 's' : ''}
        </span>
        {filtered.length > 0 && (
          <button
            onClick={() => {
              const idx = Math.floor(Math.random() * filtered.length);
              const song = filtered[idx];
              setCurrentSong(song.videoId, song.index);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-400 bg-accent-600/10 hover:bg-accent-600/20 border border-accent-600/30 rounded-lg transition-colors"
          >
            <Shuffle size={13} />
            Shuffle Play
          </button>
        )}
      </div>

      <SongList groups={groups} />
    </div>
  );
}
