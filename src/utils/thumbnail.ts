/**
 * Upgrade thumbnail URL to a larger size.
 * Google user content URLs use `=wN-hN-...` suffix — we replace with the target size.
 * YouTube img URLs (i.ytimg.com) use path-based sizes — swap to mqdefault/hqdefault.
 */
export function getThumbnailUrl(raw: string | undefined, size: 'small' | 'large' = 'large'): string {
  if (!raw) return '';

  // Google user-content thumbnails (lh3.googleusercontent.com)
  if (raw.includes('googleusercontent.com')) {
    const dims = size === 'large' ? 'w544-h544' : 'w120-h120';
    return raw.replace(/=w\d+-h\d+[^"]*/, `=${dims}-l90-rj`);
  }

  // YouTube thumbnail URLs (i.ytimg.com)
  if (raw.includes('i.ytimg.com')) {
    // Strip query params that may expire and use a reliable path
    const match = raw.match(/\/vi\/([^/]+)\//);
    if (match) {
      const videoId = match[1];
      const quality = size === 'large' ? 'hqdefault' : 'mqdefault';
      return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
    }
  }

  return raw;
}

/**
 * Build a fallback thumbnail URL from a videoId.
 * Uses YouTube's standard thumbnail endpoint which is always available.
 */
export function getFallbackThumbnail(videoId: string | undefined, size: 'small' | 'large' = 'large'): string {
  if (!videoId) return '';
  const quality = size === 'large' ? 'hqdefault' : 'mqdefault';
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
