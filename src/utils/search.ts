import type { Song, Selection, FilterOptions, TabFilter } from '@/types';

export interface FilteredSong extends Song {
  selectionStatus?: Selection['status'];
}

export function filterSongs(
  songs: Song[],
  selections: Record<number, Selection>,
  options: FilterOptions,
): FilteredSong[] {
  let result: FilteredSong[] = songs.map((song) => ({
    ...song,
    selectionStatus: selections[song.index]?.status,
  }));

  // Tab filter
  result = filterByTab(result, options.tab);

  // Hide explicit
  if (options.hideExplicit) {
    result = result.filter((s) => !s.isExplicit);
  }

  // Search
  if (options.search.trim()) {
    const query = options.search.toLowerCase().trim();
    result = result.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.primaryArtist.toLowerCase().includes(query) ||
        s.album.toLowerCase().includes(query),
    );
  }

  // Sort
  result.sort((a, b) => {
    const dir = options.sortDirection === 'asc' ? 1 : -1;
    switch (options.sortField) {
      case 'index':
        return (a.index - b.index) * dir;
      case 'title':
        return a.title.localeCompare(b.title) * dir;
      case 'artist':
        return a.primaryArtist.localeCompare(b.primaryArtist) * dir;
      case 'duration':
        return (a.durationSeconds - b.durationSeconds) * dir;
      default:
        return 0;
    }
  });

  return result;
}

export function filterByTab<T extends FilteredSong>(
  songs: T[],
  tab: TabFilter,
): T[] {
  switch (tab) {
    case 'liked':
      return songs.filter((s) => s.selectionStatus === 'liked');
    case 'disliked':
      return songs.filter((s) => s.selectionStatus === 'disliked');
    case 'unreviewed':
      return songs.filter((s) => !s.selectionStatus);
    default:
      return songs;
  }
}

export function getSearchHighlightRanges(
  text: string,
  query: string,
): Array<{ start: number; end: number }> {
  if (!query.trim()) return [];
  const ranges: Array<{ start: number; end: number }> = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  let startIndex = 0;

  while (startIndex < lowerText.length) {
    const idx = lowerText.indexOf(lowerQuery, startIndex);
    if (idx === -1) break;
    ranges.push({ start: idx, end: idx + lowerQuery.length });
    startIndex = idx + 1;
  }

  return ranges;
}
