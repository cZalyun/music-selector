import { useEffect, useState } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubeIframeAPI() {
  const [isReady, setIsReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(window.YT && window.YT.Player);
  });

  useEffect(() => {
    if (isReady) return;

    const existingScript = document.getElementById('youtube-iframe-api');

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      setIsReady(true);
      if (previousCallback) previousCallback();
    };
  }, [isReady]);

  return isReady;
}
