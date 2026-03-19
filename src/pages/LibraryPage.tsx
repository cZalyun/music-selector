import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Shuffle, ArrowUp } from 'lucide-react';
import { SearchBar } from '@/components/library/SearchBar';
import { FilterChips } from '@/components/library/FilterChips';
import { SongList } from '@/components/library/SongList';
import { useSongStore } from '@/store/songStore';
import { useSelectionStore } from '@/store/selectionStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { filterSongs, filterByTab } from '@/utils/search';
import { groupSongs } from '@/utils/grouping';
import { loadVideoFromGesture } from '@/utils/playerBridge';
import type { Song, TabFilter, SortField, SortDirection, GroupBy } from '@/types';
import type { FilteredSong } from '@/utils/search';

export default function LibraryPage() {
  const { t } = useTranslation();
  const songs = useSongStore((s) => s.songs);
  const selections = useSelectionStore((s) => s.selections);
  const currentSongIndex = usePlayerStore((s) => s.currentSongIndex);
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);
  const hideExplicit = useSettingsStore((s) => s.hideExplicit);

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabFilter>('all');
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  // Tab counts
  const counts = useMemo(() => {
    const allSongs: FilteredSong[] = songs.map((s) => ({
      ...s,
      selectionStatus: selections[s.index]?.status,
    }));
    return {
      all: allSongs.length,
      liked: filterByTab(allSongs, 'liked').length,
      disliked: filterByTab(allSongs, 'disliked').length,
      unreviewed: filterByTab(allSongs, 'unreviewed').length,
    };
  }, [songs, selections]);

  // Filtered + sorted songs
  const filtered = useMemo(
    () => filterSongs(songs, selections, { tab, search, sortField, sortDirection, groupBy, hideExplicit }),
    [songs, selections, tab, search, sortField, sortDirection, groupBy, hideExplicit],
  );

  // Grouped songs (or null)
  const groups = useMemo(() => groupSongs(filtered, groupBy), [filtered, groupBy]);

  const handlePlay = useCallback((song: Song) => {
    loadVideoFromGesture(song.videoId, true);
    setCurrentSong(song.videoId, song.index, true);
  }, [setCurrentSong]);

  const handleShufflePlay = useCallback(() => {
    if (filtered.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const song = filtered[randomIndex];
    if (song) handlePlay(song);
  }, [filtered, handlePlay]);

  const handleSortChange = useCallback((field: SortField) => {
    setSortField(field);
  }, []);

  const handleDirectionToggle = useCallback(() => {
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
  }, []);

  const handleJumpToUnreviewed = useCallback(() => {
    const unreviewed = songs.find((s) => !selections[s.index]);
    if (unreviewed) handlePlay(unreviewed);
  }, [songs, selections, handlePlay]);

  return (
    <div className="max-w-lg mx-auto px-4 py-4 flex flex-col h-[calc(100dvh-4rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))]">
      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Filters */}
      <div className="mt-3 mb-2">
        <FilterChips
          tab={tab}
          onTabChange={setTab}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onDirectionToggle={handleDirectionToggle}
          groupBy={groupBy}
          onGroupChange={setGroupBy}
          counts={counts}
        />
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-surface-500">
          {t('library.resultCount', { count: filtered.length })}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToUnreviewed}
            className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-200 transition-colors"
            aria-label={t('library.jumpToUnreviewed')}
          >
            <ArrowUp size={12} />
            {t('library.jumpToUnreviewed')}
          </button>
          <button
            onClick={handleShufflePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500/10 text-accent-400 text-xs font-medium rounded-lg hover:bg-accent-500/20 transition-colors"
            aria-label={t('library.shufflePlay')}
          >
            <Shuffle size={12} />
            {t('library.shufflePlay')}
          </button>
        </div>
      </div>

      {/* Song list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <SongList
          songs={filtered}
          groups={groups}
          activeSongIndex={currentSongIndex}
          searchQuery={search}
          onPlay={handlePlay}
        />
      </div>
    </div>
  );
}
