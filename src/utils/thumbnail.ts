import {
  THUMBNAIL_LARGE_GOOGLE,
  THUMBNAIL_SMALL_GOOGLE,
  THUMBNAIL_LARGE_YT,
  THUMBNAIL_SMALL_YT,
} from '@/constants';

export function getThumbnailUrl(
  raw: string | undefined,
  size: 'small' | 'large' = 'large',
): string {
  if (!raw) return '';

  // Detect placeholder image and return empty to trigger fallback
  if (raw === 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
    return '';
  }

  if (raw.includes('googleusercontent.com')) {
    const dims = size === 'large' ? THUMBNAIL_LARGE_GOOGLE : THUMBNAIL_SMALL_GOOGLE;
    return raw.replace(/=w\d+-h\d+/, `=${dims}`);
  }

  if (raw.includes('i.ytimg.com')) {
    const match = raw.match(/\/vi\/([^/]+)\//);
    if (match?.[1]) {
      const quality = size === 'large' ? THUMBNAIL_LARGE_YT : THUMBNAIL_SMALL_YT;
      return `https://i.ytimg.com/vi/${match[1]}/${quality}.jpg`;
    }
  }

  return raw;
}

export function getFallbackThumbnail(
  videoId: string | undefined,
  size: 'small' | 'large' = 'large',
): string {
  if (!videoId) return '';
  const quality = size === 'large' ? THUMBNAIL_LARGE_YT : THUMBNAIL_SMALL_YT;
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
