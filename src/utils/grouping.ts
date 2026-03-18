import type { SongWithSelection, GroupBy } from '../types';

export interface SongGroup {
  label: string;
  songs: SongWithSelection[];
}

export function groupSongs(songs: SongWithSelection[], groupBy: GroupBy): SongGroup[] {
  if (groupBy === 'none') {
    return [{ label: 'All Songs', songs }];
  }

  const map = new Map<string, SongWithSelection[]>();

  for (const song of songs) {
    const key = getGroupKey(song, groupBy);
    const arr = map.get(key) ?? [];
    arr.push(song);
    map.set(key, arr);
  }

  return Array.from(map.entries())
    .map(([label, items]) => ({ label, songs: items }))
    .sort((a, b) => b.songs.length - a.songs.length);
}

function getGroupKey(song: SongWithSelection, groupBy: GroupBy): string {
  switch (groupBy) {
    case 'artist':
      return song.primaryArtist || 'Unknown Artist';
    case 'album':
      return song.album || 'No Album';
    case 'duration':
      if (song.durationSeconds < 120) return '< 2 min';
      if (song.durationSeconds < 540) return '2–9 min';
      return '9+ min';
    case 'status':
      if (!song.selection) return 'Unreviewed';
      return song.selection.status.charAt(0).toUpperCase() + song.selection.status.slice(1);
    default:
      return 'All';
  }
}
