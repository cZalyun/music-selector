import type { Song } from '@/types';

export function canShare(): boolean {
  return typeof navigator.share === 'function';
}

export async function shareSong(song: Song): Promise<boolean> {
  if (!canShare()) return false;

  try {
    await navigator.share({
      title: `${song.title} — ${song.primaryArtist}`,
      text: `Check out "${song.title}" by ${song.primaryArtist}`,
      url: song.youtubeMusicUrl || song.youtubeWatchUrl,
    });
    return true;
  } catch {
    return false;
  }
}

export async function shareLikedSongs(songs: Song[]): Promise<boolean> {
  if (!canShare() || songs.length === 0) return false;

  const text = songs
    .slice(0, 20)
    .map((s, i) => `${i + 1}. ${s.title} — ${s.primaryArtist}`)
    .join('\n');

  const suffix = songs.length > 20 ? `\n...and ${songs.length - 20} more` : '';

  try {
    await navigator.share({
      title: `My Liked Songs (${songs.length})`,
      text: `${text}${suffix}`,
    });
    return true;
  } catch {
    return false;
  }
}
