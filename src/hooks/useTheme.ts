import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import type { Theme } from '@/types';

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme): void {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolved === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
  }

  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'light' ? '#f8fafc' : '#0f172a');
  }
}

export function useTheme(): void {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);
}
