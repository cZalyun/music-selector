import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSongStore } from '../store/songStore';

export function useBackHandler() {
  const location = useLocation();
  const { songs } = useSongStore();

  useEffect(() => {
    // Only intercept if we are on the swipe page and have songs loaded
    if (location.pathname === '/swipe' && songs.length > 0) {
      const handlePopState = () => {
        const confirmLeave = window.confirm('Leave review session? Your progress is saved, but you will exit the swipe view.');
        if (!confirmLeave) {
          // Push state again to stay on the page
          window.history.pushState(null, '', window.location.href);
        } else {
          // Allow navigation to proceed, we are technically already popped but we might need to go back properly
          // However, popstate means we already popped, so if they say yes, they just go to previous page.
        }
      };

      // Push an artificial state so we have something to pop
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [location.pathname, songs.length]);
}
