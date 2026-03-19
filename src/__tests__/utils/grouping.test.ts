import { describe, it, expect } from 'vitest';
import { groupSongs } from '@/utils/grouping';
import type { FilteredSong } from '@/utils/search';

function makeSong(overrides: Partial<FilteredSong> = {}): FilteredSong {
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

describe('groupSongs', () => {
  it('returns null for groupBy "none"', () => {
    const songs = [makeSong()];
    expect(groupSongs(songs, 'none')).toBeNull();
  });

  it('groups by artist', () => {
    const songs = [
      makeSong({ index: 1, primaryArtist: 'Artist A' }),
      makeSong({ index: 2, primaryArtist: 'Artist B' }),
      makeSong({ index: 3, primaryArtist: 'Artist A' }),
    ];
    const groups = groupSongs(songs, 'artist');
    expect(groups).not.toBeNull();
    expect(groups).toHaveLength(2);
    expect(groups![0]!.label).toBe('Artist A');
    expect(groups![0]!.songs).toHaveLength(2);
    expect(groups![1]!.label).toBe('Artist B');
    expect(groups![1]!.songs).toHaveLength(1);
  });

  it('groups by album', () => {
    const songs = [
      makeSong({ index: 1, album: 'Album X' }),
      makeSong({ index: 2, album: '' }),
      makeSong({ index: 3, album: 'Album X' }),
    ];
    const groups = groupSongs(songs, 'album');
    expect(groups).not.toBeNull();
    expect(groups).toHaveLength(2);
    // Sorted by count desc
    expect(groups![0]!.label).toBe('Album X');
    expect(groups![0]!.songs).toHaveLength(2);
    expect(groups![1]!.label).toBe('Unknown Album');
  });

  it('groups by duration ranges', () => {
    const songs = [
      makeSong({ index: 1, durationSeconds: 60 }),  // Under 2 min
      makeSong({ index: 2, durationSeconds: 300 }), // 2-9 min
      makeSong({ index: 3, durationSeconds: 600 }), // 9+ min
      makeSong({ index: 4, durationSeconds: 90 }),   // Under 2 min
    ];
    const groups = groupSongs(songs, 'duration');
    expect(groups).not.toBeNull();
    expect(groups).toHaveLength(3);
    // Sorted by count desc: "Under 2 min" (2), then 1 each
    expect(groups![0]!.label).toBe('Under 2 min');
    expect(groups![0]!.songs).toHaveLength(2);
  });

  it('groups by status', () => {
    const songs: FilteredSong[] = [
      makeSong({ index: 1, selectionStatus: 'liked' }),
      makeSong({ index: 2, selectionStatus: 'disliked' }),
      makeSong({ index: 3, selectionStatus: undefined }),
      makeSong({ index: 4, selectionStatus: 'liked' }),
    ];
    const groups = groupSongs(songs, 'status');
    expect(groups).not.toBeNull();
    expect(groups).toHaveLength(3);
    expect(groups![0]!.label).toBe('liked');
    expect(groups![0]!.songs).toHaveLength(2);
  });

  it('handles empty songs array', () => {
    const groups = groupSongs([], 'artist');
    expect(groups).not.toBeNull();
    expect(groups).toHaveLength(0);
  });
});
