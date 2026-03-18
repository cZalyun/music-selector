import type { Song, SongWithSelection, Selection, FilterState, LibraryTab } from '../types';

export function filterSongs(
  songs: Song[],
  selections: Map<number, Selection>,
  filters: FilterState
): SongWithSelection[] {
  let result: SongWithSelection[] = songs.map((s) => ({
    ...s,
    selection: selections.get(s.index),
  }));

  // Tab filter
  result = filterByTab(result, filters.tab);

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (s) =>
        s.titleNormalized.includes(q) ||
        s.primaryArtist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }

  // Explicit filter
  if (filters.explicitOnly) {
    result = result.filter((s) => s.isExplicit);
  }

  // Sort
  result.sort((a, b) => {
    const dir = filters.sortDirection === 'asc' ? 1 : -1;
    const field = filters.sortField;
    const aVal = a[field];
    const bVal = b[field];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * dir;
    }
    return ((aVal as number) - (bVal as number)) * dir;
  });

  return result;
}

function filterByTab(songs: SongWithSelection[], tab: LibraryTab): SongWithSelection[] {
  switch (tab) {
    case 'liked':
      return songs.filter((s) => s.selection?.status === 'liked');
    case 'disliked':
      return songs.filter((s) => s.selection?.status === 'disliked');
    case 'unreviewed':
      return songs.filter((s) => !s.selection);
    default:
      return songs;
  }
}
