import Papa from 'papaparse';
import { Song, Selection } from '../types';

export interface ParseResult {
  songs: Song[];
  errors: string[];
}

// Helper to normalize keys from CSV headers
const getField = (row: Record<string, string>, ...possibleKeys: string[]): string | undefined => {
  for (const key of possibleKeys) {
    if (row[key] !== undefined) return row[key];
    // Try lowercase variants
    const lowerRow = Object.keys(row).reduce((acc, k) => {
      acc[k.toLowerCase()] = row[k];
      return acc;
    }, {} as Record<string, string>);
    if (lowerRow[key.toLowerCase()] !== undefined) return lowerRow[key.toLowerCase()];
  }
  return undefined;
};

export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const songs: Song[] = [];

        results.data.forEach((row: unknown, i: number) => {
          try {
            const r = row as Record<string, string>;
            
            const index = getField(r, 'Index', 'index');
            const title = getField(r, 'Title', 'title');
            const primaryArtist = getField(r, 'Primary Artist', 'primaryArtist');
            const videoId = getField(r, 'Video ID', 'videoId');

            // Required fields check
            if (!index && index !== '0') throw new Error('Missing Index');
            if (!title) throw new Error('Missing Title');
            if (!primaryArtist) throw new Error('Missing Primary Artist');
            if (!videoId) throw new Error('Missing Video ID');

            const song: Song = {
              index: parseInt(index, 10),
              title: title,
              titleNormalized: getField(r, 'Title (Normalized)', 'titleNormalized') || title.toLowerCase(),
              primaryArtist: primaryArtist,
              allArtists: getField(r, 'All Artists', 'allArtists') || primaryArtist,
              artistCount: parseInt(getField(r, 'Artist Count', 'artistCount') || '1', 10),
              album: getField(r, 'Album', 'album') || '',
              duration: getField(r, 'Duration', 'duration') || '0:00',
              durationSeconds: parseInt(getField(r, 'Duration (Seconds)', 'durationSeconds') || '0', 10),
              videoId: videoId,
              url: getField(r, 'URL', 'url') || '',
              youtubeWatchUrl: getField(r, 'YouTube Watch URL', 'youtubeWatchUrl') || `https://www.youtube.com/watch?v=${videoId}`,
              youtubeMusicUrl: getField(r, 'YouTube Music URL', 'youtubeMusicUrl') || `https://music.youtube.com/watch?v=${videoId}`,
              thumbnail: getField(r, 'Thumbnail', 'thumbnail') || '',
              isExplicit: getField(r, 'Is Explicit', 'isExplicit')?.toLowerCase() === 'true',
            };
            
            songs.push(song);
          } catch (e: unknown) {
            if (e instanceof Error) {
              errors.push(`Row ${i + 2}: ${e.message}`);
            }
          }
        });

        // Surface up to 20 errors instead of just 5
        if (results.errors && results.errors.length > 0) {
           results.errors.slice(0, 20).forEach(e => errors.push(`CSV Error (Row ${e.row}): ${e.message}`));
        }

        resolve({ songs, errors });
      },
      error: (error: Error) => {
        resolve({ songs: [], errors: [error.message] });
      }
    });
  });
}

export function parseCSVString(csvText: string): ParseResult {
  const errors: string[] = [];
  const songs: Song[] = [];

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  results.data.forEach((row: unknown, i: number) => {
    try {
      const r = row as Record<string, string>;
      
      const index = getField(r, 'Index', 'index');
      const title = getField(r, 'Title', 'title');
      const primaryArtist = getField(r, 'Primary Artist', 'primaryArtist');
      const videoId = getField(r, 'Video ID', 'videoId');

      if (!index && index !== '0') throw new Error('Missing Index');
      if (!title) throw new Error('Missing Title');
      if (!primaryArtist) throw new Error('Missing Primary Artist');
      if (!videoId) throw new Error('Missing Video ID');

      const song: Song = {
        index: parseInt(index, 10),
        title: title,
        titleNormalized: getField(r, 'Title (Normalized)', 'titleNormalized') || title.toLowerCase(),
        primaryArtist: primaryArtist,
        allArtists: getField(r, 'All Artists', 'allArtists') || primaryArtist,
        artistCount: parseInt(getField(r, 'Artist Count', 'artistCount') || '1', 10),
        album: getField(r, 'Album', 'album') || '',
        duration: getField(r, 'Duration', 'duration') || '0:00',
        durationSeconds: parseInt(getField(r, 'Duration (Seconds)', 'durationSeconds') || '0', 10),
        videoId: videoId,
        url: getField(r, 'URL', 'url') || '',
        youtubeWatchUrl: getField(r, 'YouTube Watch URL', 'youtubeWatchUrl') || `https://www.youtube.com/watch?v=${videoId}`,
        youtubeMusicUrl: getField(r, 'YouTube Music URL', 'youtubeMusicUrl') || `https://music.youtube.com/watch?v=${videoId}`,
        thumbnail: getField(r, 'Thumbnail', 'thumbnail') || '',
        isExplicit: getField(r, 'Is Explicit', 'isExplicit')?.toLowerCase() === 'true',
      };
      
      songs.push(song);
    } catch (e: unknown) {
      if (e instanceof Error) {
        errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }
  });

  if (results.errors && results.errors.length > 0) {
     results.errors.slice(0, 20).forEach(e => errors.push(`CSV Error (Row ${e.row}): ${e.message}`));
  }

  return { songs, errors };
}

export function exportToCSV(songs: Song[], filename: string) {
  const csv = Papa.unparse(songs.map(song => ({
    'Index': song.index,
    'Title': song.title,
    'Title (Normalized)': song.titleNormalized,
    'Primary Artist': song.primaryArtist,
    'All Artists': song.allArtists,
    'Artist Count': song.artistCount,
    'Album': song.album,
    'Duration': song.duration,
    'Duration (Seconds)': song.durationSeconds,
    'Video ID': song.videoId,
    'URL': song.url,
    'YouTube Watch URL': song.youtubeWatchUrl,
    'YouTube Music URL': song.youtubeMusicUrl,
    'Thumbnail': song.thumbnail,
    'Is Explicit': song.isExplicit ? 'TRUE' : 'FALSE'
  })));
  
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportJSON(data: { songs: Song[], selections: Record<number, Selection> }, filename: string) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

function downloadFile(content: string, filename: string, type: string) {
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
