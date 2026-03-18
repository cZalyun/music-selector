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

export interface SongWithSelection extends Song {
  selection?: Selection;
}

export type SortField = 'title' | 'primaryArtist' | 'album' | 'durationSeconds' | 'index';
export type SortDirection = 'asc' | 'desc';
export type GroupBy = 'none' | 'artist' | 'album' | 'duration' | 'status';
export type LibraryTab = 'all' | 'liked' | 'disliked' | 'unreviewed';

export interface FilterState {
  search: string;
  tab: LibraryTab;
  sortField: SortField;
  sortDirection: SortDirection;
  groupBy: GroupBy;
  hideExplicit: boolean;
}
