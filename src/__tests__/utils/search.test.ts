import { describe, it, expect } from 'vitest';
import { filterSongs, getSearchHighlightRanges } from '@/utils/search';
import type { Song, Selection } from '@/types';

function makeSong(overrides: Partial<Song> = {}): Song {
  return {
    index: 1,
    title: 'Test Song',
    titleNormalized: 'test song',
    primaryArtist: 'Test Artist',
    allArtists: 'Test Artist',
    artistCount: 1,
    album: 'Test Album',
    duration: '3:30',
    durationSeconds: 210,
    videoId: 'abc123',
    url: '',
    youtubeWatchUrl: '',
    youtubeMusicUrl: '',
    thumbnail: '',
    isExplicit: false,
    ...overrides,
  };
}

describe('filterSongs', () => {
  const songs: Song[] = [
    makeSong({ index: 1, title: 'Alpha', primaryArtist: 'Artist A', durationSeconds: 100, isExplicit: false }),
    makeSong({ index: 2, title: 'Beta', primaryArtist: 'Artist B', durationSeconds: 200, isExplicit: true }),
    makeSong({ index: 3, title: 'Gamma', primaryArtist: 'Artist A', durationSeconds: 300, isExplicit: false }),
  ];

  const selections: Record<number, Selection> = {
    1: { songIndex: 1, status: 'liked', timestamp: 1000 },
    2: { songIndex: 2, status: 'disliked', timestamp: 1001 },
  };

  it('returns all songs with no filters', () => {
    const result = filterSongs(songs, {}, {
      tab: 'all', search: '', sortField: 'index', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result).toHaveLength(3);
  });

  it('filters by liked tab', () => {
    const result = filterSongs(songs, selections, {
      tab: 'liked', search: '', sortField: 'index', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('Alpha');
  });

  it('filters by disliked tab', () => {
    const result = filterSongs(songs, selections, {
      tab: 'disliked', search: '', sortField: 'index', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('Beta');
  });

  it('filters by unreviewed tab', () => {
    const result = filterSongs(songs, selections, {
      tab: 'unreviewed', search: '', sortField: 'index', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('Gamma');
  });

  it('hides explicit songs', () => {
    const result = filterSongs(songs, {}, {
      tab: 'all', search: '', sortField: 'index', sortDirection: 'asc', groupBy: 'none', hideExplicit: true,
    });
    expect(result).toHaveLength(2);
    expect(result.every((s) => !s.isExplicit)).toBe(true);
  });

  it('searches by title', () => {
    const result = filterSongs(songs, {}, {
      tab: 'all', search: 'alpha', sortField: 'index', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('Alpha');
  });

  it('searches by artist', () => {
    const result = filterSongs(songs, {}, {
      tab: 'all', search: 'Artist A', sortField: 'index', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result).toHaveLength(2);
  });

  it('sorts by title ascending', () => {
    const result = filterSongs(songs, {}, {
      tab: 'all', search: '', sortField: 'title', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result.map((s) => s.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('sorts by title descending', () => {
    const result = filterSongs(songs, {}, {
      tab: 'all', search: '', sortField: 'title', sortDirection: 'desc', groupBy: 'none', hideExplicit: false,
    });
    expect(result.map((s) => s.title)).toEqual(['Gamma', 'Beta', 'Alpha']);
  });

  it('sorts by duration ascending', () => {
    const result = filterSongs(songs, {}, {
      tab: 'all', search: '', sortField: 'duration', sortDirection: 'asc', groupBy: 'none', hideExplicit: false,
    });
    expect(result.map((s) => s.durationSeconds)).toEqual([100, 200, 300]);
  });
});

describe('getSearchHighlightRanges', () => {
  it('returns empty for empty query', () => {
    expect(getSearchHighlightRanges('hello world', '')).toEqual([]);
  });

  it('returns empty for whitespace query', () => {
    expect(getSearchHighlightRanges('hello world', '   ')).toEqual([]);
  });

  it('finds single match', () => {
    expect(getSearchHighlightRanges('hello world', 'world')).toEqual([
      { start: 6, end: 11 },
    ]);
  });

  it('finds multiple matches', () => {
    expect(getSearchHighlightRanges('abcabc', 'abc')).toEqual([
      { start: 0, end: 3 },
      { start: 3, end: 6 },
    ]);
  });

  it('is case-insensitive', () => {
    expect(getSearchHighlightRanges('Hello World', 'hello')).toEqual([
      { start: 0, end: 5 },
    ]);
  });

  it('returns empty for no match', () => {
    expect(getSearchHighlightRanges('hello', 'xyz')).toEqual([]);
  });
});
