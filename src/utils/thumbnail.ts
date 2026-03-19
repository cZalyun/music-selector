export function getThumbnailUrl(raw: string | undefined, size: 'small' | 'large' = 'large'): string {
  if (!raw) return '';

  // Google user-content thumbnails (lh3.googleusercontent.com)
  if (raw.includes('googleusercontent.com')) {
    const dims = size === 'large' ? 'w544-h544' : 'w120-h120';
    return raw.replace(/=w\d+-h\d+/, `=${dims}`);
  }

  // YouTube thumbnail URLs (i.ytimg.com)
  if (raw.includes('i.ytimg.com')) {
    const match = raw.match(/\/vi\/([^/]+)\//);
    if (match) {
      const videoId = match[1];
      const quality = size === 'large' ? 'hqdefault' : 'default';
      return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
    }
  }

  return raw;
}

export function getFallbackThumbnail(videoId: string | undefined, size: 'small' | 'large' = 'large'): string {
  if (!videoId) return '';
  const quality = size === 'large' ? 'hqdefault' : 'default';
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}
