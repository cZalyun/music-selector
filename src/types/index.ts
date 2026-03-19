export interface Song {
  index: number;
  title: string;
  titleNormalized: string;
  primaryArtist: string;
  allArtists: string;
  artistCount: number;
  album: string;
  duration: string;
  durationSeconds: number;
  videoId: string;
  url: string;
  youtubeWatchUrl: string;
  youtubeMusicUrl: string;
  thumbnail: string;
  isExplicit: boolean;
}

export type SelectionStatus = 'liked' | 'disliked' | 'skipped';

export interface Selection {
  songIndex: number;
  status: SelectionStatus;
  timestamp: number;
}
