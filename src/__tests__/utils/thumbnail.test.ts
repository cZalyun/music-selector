import { describe, it, expect } from 'vitest';
import { getThumbnailUrl, getFallbackThumbnail } from '@/utils/thumbnail';

describe('getThumbnailUrl', () => {
  it('returns empty string for undefined input', () => {
    expect(getThumbnailUrl(undefined)).toBe('');
  });

  it('returns empty string for empty string input', () => {
    expect(getThumbnailUrl('')).toBe('');
  });

  it('upgrades Google user-content URL to large size', () => {
    const raw = 'https://lh3.googleusercontent.com/abc=w60-h60-l90-rj';
    const result = getThumbnailUrl(raw, 'large');
    expect(result).toBe('https://lh3.googleusercontent.com/abc=w544-h544-l90-rj');
  });

  it('upgrades Google user-content URL to small size', () => {
    const raw = 'https://lh3.googleusercontent.com/abc=w60-h60-l90-rj';
    const result = getThumbnailUrl(raw, 'small');
    expect(result).toBe('https://lh3.googleusercontent.com/abc=w120-h120-l90-rj');
  });

  it('defaults to large size', () => {
    const raw = 'https://lh3.googleusercontent.com/abc=w60-h60-l90-rj';
    const result = getThumbnailUrl(raw);
    expect(result).toBe('https://lh3.googleusercontent.com/abc=w544-h544-l90-rj');
  });

  it('normalizes YouTube thumbnail URL to hqdefault for large', () => {
    const raw = 'https://i.ytimg.com/vi/abc123/sddefault.jpg?sqp=-oaymwE';
    const result = getThumbnailUrl(raw, 'large');
    expect(result).toBe('https://i.ytimg.com/vi/abc123/hqdefault.jpg');
  });

  it('normalizes YouTube thumbnail URL to default for small', () => {
    const raw = 'https://i.ytimg.com/vi/abc123/sddefault.jpg?sqp=-oaymwE';
    const result = getThumbnailUrl(raw, 'small');
    expect(result).toBe('https://i.ytimg.com/vi/abc123/default.jpg');
  });

  it('returns raw URL for non-Google/YouTube URLs', () => {
    const raw = 'https://example.com/image.jpg';
    expect(getThumbnailUrl(raw)).toBe(raw);
  });
});

describe('getFallbackThumbnail', () => {
  it('returns empty string for undefined videoId', () => {
    expect(getFallbackThumbnail(undefined)).toBe('');
  });

  it('returns empty string for empty videoId', () => {
    expect(getFallbackThumbnail('')).toBe('');
  });

  it('constructs hqdefault URL for large size', () => {
    expect(getFallbackThumbnail('abc123', 'large')).toBe(
      'https://i.ytimg.com/vi/abc123/hqdefault.jpg',
    );
  });

  it('constructs default URL for small size', () => {
    expect(getFallbackThumbnail('abc123', 'small')).toBe(
      'https://i.ytimg.com/vi/abc123/default.jpg',
    );
  });

  it('defaults to large size', () => {
    expect(getFallbackThumbnail('abc123')).toBe(
      'https://i.ytimg.com/vi/abc123/hqdefault.jpg',
    );
  });
});
