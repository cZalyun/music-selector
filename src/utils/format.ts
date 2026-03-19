export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? navigator.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDateISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale ?? navigator.language).format(value);
}

export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
