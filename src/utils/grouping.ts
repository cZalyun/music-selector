import type { GroupBy, SongGroup } from '@/types';
import type { FilteredSong } from './search';

export function groupSongs(
  songs: FilteredSong[],
  groupBy: GroupBy,
): SongGroup[] | null {
  if (groupBy === 'none') return null;

  const map = new Map<string, FilteredSong[]>();

  for (const song of songs) {
    const key = getGroupKey(song, groupBy);
    const group = map.get(key);
    if (group) {
      group.push(song);
    } else {
      map.set(key, [song]);
    }
  }

  return Array.from(map.entries())
    .map(([label, groupSongs]) => ({ label, songs: groupSongs }))
    .sort((a, b) => b.songs.length - a.songs.length);
}

function getGroupKey(song: FilteredSong, groupBy: GroupBy): string {
  switch (groupBy) {
    case 'artist':
      return song.primaryArtist || 'Unknown Artist';
    case 'album':
      return song.album || 'Unknown Album';
    case 'duration': {
      const secs = song.durationSeconds;
      if (secs < 120) return 'Under 2 min';
      if (secs < 540) return '2–9 min';
      return '9+ min';
    }
    case 'status':
      return song.selectionStatus ?? 'Unreviewed';
    default:
      return 'Unknown';
  }
}
