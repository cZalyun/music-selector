import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useBackButton(): void {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/swipe') return;

    const handler = (e: PopStateEvent) => {
      // On swipe page, push state back to prevent accidental navigation
      const shouldLeave = window.confirm('Leave review? Your progress is saved.');
      if (!shouldLeave) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      }
    };

    // Push an extra state so popstate fires before actually navigating
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    };
  }, [location.pathname]);
}
