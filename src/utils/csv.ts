import Papa from 'papaparse';
import type { Song } from '@/types';
import { CSV_MAX_ERRORS_SHOWN } from '@/constants';

const REQUIRED_COLUMNS = ['index', 'title', 'primaryArtist', 'videoId'];

function mapRow(row: Record<string, string>): Song {
  return {
    index: parseInt(row['index'] ?? '0', 10),
    title: row['title'] ?? '',
    titleNormalized: row['titleNormalized'] ?? '',
    primaryArtist: row['primaryArtist'] ?? '',
    allArtists: row['allArtists'] ?? '',
    artistCount: parseInt(row['artistCount'] ?? '1', 10),
    album: row['album'] ?? '',
    duration: row['duration'] ?? '',
    durationSeconds: parseInt(row['durationSeconds'] ?? '0', 10),
    videoId: row['videoId'] ?? '',
    url: row['url'] ?? '',
    youtubeWatchUrl: row['youtubeWatchUrl'] ?? '',
    youtubeMusicUrl: row['youtubeMusicUrl'] ?? '',
    thumbnail: row['thumbnail'] ?? '',
    isExplicit: row['isExplicit'] === 'true',
  };
}

export function parseCSV(
  file: File,
): Promise<{ songs: Song[]; errors: string[] }> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];

        if (results.meta.fields) {
          const missing = REQUIRED_COLUMNS.filter(
            (col) => !results.meta.fields!.includes(col),
          );
          if (missing.length > 0) {
            resolve({ songs: [], errors: [`Missing required columns: ${missing.join(', ')}`] });
            return;
          }
        }

        if (results.errors.length > 0) {
          const shown = results.errors.slice(0, CSV_MAX_ERRORS_SHOWN);
          errors.push(...shown.map((e) => `Row ${e.row}: ${e.message}`));
          const remaining = results.errors.length - CSV_MAX_ERRORS_SHOWN;
          if (remaining > 0) {
            errors.push(`...and ${remaining} more errors`);
          }
        }

        const songs = results.data.map(mapRow);
        resolve({ songs, errors });
      },
      error: (error: Error) => {
        resolve({ songs: [], errors: [error.message] });
      },
    });
  });
}

export function parseCSVString(
  csvText: string,
): { songs: Song[]; errors: string[] } {
  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];

  if (results.meta.fields) {
    const missing = REQUIRED_COLUMNS.filter(
      (col) => !results.meta.fields!.includes(col),
    );
    if (missing.length > 0) {
      return { songs: [], errors: [`Missing required columns: ${missing.join(', ')}`] };
    }
  }

  if (results.errors.length > 0) {
    const shown = results.errors.slice(0, CSV_MAX_ERRORS_SHOWN);
    errors.push(...shown.map((e) => `Row ${e.row}: ${e.message}`));
    const remaining = results.errors.length - CSV_MAX_ERRORS_SHOWN;
    if (remaining > 0) {
      errors.push(`...and ${remaining} more errors`);
    }
  }

  const songs = results.data.map(mapRow);
  return { songs, errors };
}

export function exportToCSV(songs: Song[], filename: string): void {
  const csv = Papa.unparse(songs);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
