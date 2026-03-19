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

export type SortField = 'index' | 'title' | 'artist' | 'duration';
export type SortDirection = 'asc' | 'desc';
export type GroupBy = 'none' | 'artist' | 'album' | 'duration' | 'status';
export type TabFilter = 'all' | 'liked' | 'disliked' | 'unreviewed';
export type LoopMode = 'off' | 'one' | 'all';
export type ToastType = 'success' | 'error' | 'info';
export type Theme = 'dark' | 'light' | 'system';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  role: 'status' | 'alert';
  createdAt: number;
}

export interface SongGroup {
  label: string;
  songs: Song[];
}

export interface FilterOptions {
  tab: TabFilter;
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
  groupBy: GroupBy;
  hideExplicit: boolean;
}
