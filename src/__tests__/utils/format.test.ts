import { describe, it, expect } from 'vitest';
import { formatTime, formatPercent, formatDateISO } from '@/utils/format';

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds less than a minute', () => {
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats exact minutes', () => {
    expect(formatTime(120)).toBe('2:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(195)).toBe('3:15');
  });

  it('pads single-digit seconds', () => {
    expect(formatTime(61)).toBe('1:01');
  });

  it('handles NaN', () => {
    expect(formatTime(NaN)).toBe('0:00');
  });

  it('handles negative values', () => {
    expect(formatTime(-10)).toBe('0:00');
  });

  it('handles Infinity', () => {
    expect(formatTime(Infinity)).toBe('0:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(61.9)).toBe('1:01');
  });
});

describe('formatPercent', () => {
  it('returns 0 for 0 total', () => {
    expect(formatPercent(5, 0)).toBe(0);
  });

  it('calculates correct percentage', () => {
    expect(formatPercent(50, 200)).toBe(25);
  });

  it('rounds to nearest integer', () => {
    expect(formatPercent(1, 3)).toBe(33);
  });

  it('returns 100 for equal values', () => {
    expect(formatPercent(100, 100)).toBe(100);
  });
});

describe('formatDateISO', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = formatDateISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
