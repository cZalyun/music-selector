import { useMemo } from 'react';
import type { Song } from '../types';
import { useSelectionStore } from '../store/selectionStore';
import { useSettingsStore } from '../store/settingsStore';

export type FilterTab = 'all' | 'liked' | 'disliked' | 'unreviewed';
export type SortOption = 'index' | 'title' | 'artist' | 'duration';
export type GroupOption = 'none' | 'artist' | 'album' | 'duration' | 'status';

export interface FilterState {
  tab: FilterTab;
  search: string;
  sort: SortOption;
  sortDesc: boolean;
  group: GroupOption;
}

export function useLibraryFilters(songs: Song[], filters: FilterState) {
  const { selections } = useSelectionStore();
  const { hideExplicit } = useSettingsStore();

  return useMemo(() => {
    let result = [...songs];

    // 1. Hide Explicit
    if (hideExplicit) {
      result = result.filter(song => !song.isExplicit);
    }

    // 2. Tab Filter
    if (filters.tab !== 'all') {
      result = result.filter(song => {
        const sel = selections[song.index];
        if (filters.tab === 'unreviewed') return !sel;
        if (filters.tab === 'liked') return sel?.status === 'liked';
        if (filters.tab === 'disliked') return sel?.status === 'disliked';
        return true;
      });
    }

    // 3. Search Filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.primaryArtist.toLowerCase().includes(query) ||
        (song.album && song.album.toLowerCase().includes(query))
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sort) {
        case 'index':
          comparison = a.index - b.index;
          break;
        case 'title':
          comparison = a.titleNormalized.localeCompare(b.titleNormalized);
          break;
        case 'artist':
          comparison = a.primaryArtist.localeCompare(b.primaryArtist);
          break;
        case 'duration':
          comparison = a.durationSeconds - b.durationSeconds;
          break;
      }
      return filters.sortDesc ? -comparison : comparison;
    });

    return result;
  }, [songs, selections, hideExplicit, filters]);
}

export interface SongGroup {
  name: string;
  songs: Song[];
}

export function useGroupedSongs(songs: Song[], groupBy: GroupOption): SongGroup[] {
  const { selections } = useSelectionStore();

  return useMemo(() => {
    if (groupBy === 'none') {
      return [{ name: 'All', songs }];
    }

    const groups: Record<string, Song[]> = {};

    songs.forEach(song => {
      let key = 'Unknown';
      
      switch (groupBy) {
        case 'artist':
          key = song.primaryArtist;
          break;
        case 'album':
          key = song.album || 'Unknown Album';
          break;
        case 'duration':
          if (song.durationSeconds < 120) key = 'Short (< 2m)';
          else if (song.durationSeconds > 540) key = 'Long (> 9m)';
          else key = 'Medium (2m - 9m)';
          break;
        case 'status': {
          const sel = selections[song.index];
          if (!sel) key = 'Unreviewed';
          else if (sel.status === 'liked') key = 'Liked';
          else if (sel.status === 'disliked') key = 'Disliked';
          else key = 'Skipped';
          break;
        }
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(song);
    });

    // Convert to array and sort by group size (largest first)
    return Object.entries(groups)
      .map(([name, groupSongs]) => ({ name, songs: groupSongs }))
      .sort((a, b) => b.songs.length - a.songs.length);
      
  }, [songs, groupBy, selections]);
}
