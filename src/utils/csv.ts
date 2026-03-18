import Papa from 'papaparse';
import type { Song } from '../types';

const REQUIRED_COLUMNS = [
  'index', 'title', 'primaryArtist', 'videoId',
] as const;

export function parseCSV(file: File): Promise<{ songs: Song[]; errors: string[] }> {
  return new Promise((resolve) => {
    const errors: string[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          errors.push(...results.errors.slice(0, 5).map((e) => `Row ${e.row}: ${e.message}`));
        }

        const headers = results.meta.fields ?? [];
        const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          errors.push(`Missing required columns: ${missing.join(', ')}`);
          resolve({ songs: [], errors });
          return;
        }

        const songs: Song[] = (results.data as Record<string, string>[])
          .map((row) => ({
            index: parseInt(row.index, 10) || 0,
            title: (row.title ?? '').trim(),
            titleNormalized: (row.titleNormalized ?? row.title ?? '').trim().toLowerCase(),
            primaryArtist: (row.primaryArtist ?? '').trim(),
            allArtists: (row.allArtists ?? row.primaryArtist ?? '').trim(),
            artistCount: parseInt(row.artistCount, 10) || 1,
            album: (row.album ?? '').trim(),
            duration: (row.duration ?? '').trim(),
            durationSeconds: parseInt(row.durationSeconds, 10) || 0,
            videoId: (row.videoId ?? '').trim(),
            url: (row.url ?? '').trim(),
            youtubeWatchUrl: (row.youtubeWatchUrl ?? '').trim(),
            youtubeMusicUrl: (row.youtubeMusicUrl ?? '').trim(),
            thumbnail: (row.thumbnail ?? '').trim(),
            isExplicit: row.isExplicit === 'true',
          }))
          .filter((s) => s.title && s.videoId);

        resolve({ songs, errors });
      },
      error(err) {
        errors.push(`Parse error: ${err.message}`);
        resolve({ songs: [], errors });
      },
    });
  });
}

export function parseCSVString(csvText: string): { songs: Song[]; errors: string[] } {
  const errors: string[] = [];
  const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  if (results.errors.length > 0) {
    errors.push(...results.errors.slice(0, 5).map((e) => `Row ${e.row}: ${e.message}`));
  }

  const headers = results.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    errors.push(`Missing required columns: ${missing.join(', ')}`);
    return { songs: [], errors };
  }

  const songs: Song[] = (results.data as Record<string, string>[])
    .map((row) => ({
      index: parseInt(row.index, 10) || 0,
      title: (row.title ?? '').trim(),
      titleNormalized: (row.titleNormalized ?? row.title ?? '').trim().toLowerCase(),
      primaryArtist: (row.primaryArtist ?? '').trim(),
      allArtists: (row.allArtists ?? row.primaryArtist ?? '').trim(),
      artistCount: parseInt(row.artistCount, 10) || 1,
      album: (row.album ?? '').trim(),
      duration: (row.duration ?? '').trim(),
      durationSeconds: parseInt(row.durationSeconds, 10) || 0,
      videoId: (row.videoId ?? '').trim(),
      url: (row.url ?? '').trim(),
      youtubeWatchUrl: (row.youtubeWatchUrl ?? '').trim(),
      youtubeMusicUrl: (row.youtubeMusicUrl ?? '').trim(),
      thumbnail: (row.thumbnail ?? '').trim(),
      isExplicit: row.isExplicit === 'true',
    }))
    .filter((s) => s.title && s.videoId);

  return { songs, errors };
}

export function exportToCSV(songs: Song[], filename: string): void {
  const headers = [
    'index', 'title', 'titleNormalized', 'primaryArtist', 'allArtists',
    'artistCount', 'album', 'duration', 'durationSeconds', 'videoId',
    'url', 'youtubeWatchUrl', 'youtubeMusicUrl', 'thumbnail', 'isExplicit',
  ];

  const csvContent = Papa.unparse({
    fields: headers,
    data: songs.map((s) => headers.map((h) => String(s[h as keyof Song] ?? ''))),
  });

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
}

export function exportJSON(data: unknown, filename: string): void {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
