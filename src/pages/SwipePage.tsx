import { useEffect } from 'react';
import { CardStack } from '@/components/swipe/CardStack';
import { usePlayerStore } from '@/store/playerStore';

export default function SwipePage() {
  const hasPlayer = usePlayerStore((s) => s.currentVideoId !== null);

  // Attempt to lock orientation to portrait
  useEffect(() => {
    try {
      const orientation = screen.orientation as ScreenOrientation & { lock?: (type: string) => Promise<void> };
      orientation.lock?.('portrait').catch(() => {
        // API not supported or not allowed, ignore
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div
      className="max-w-lg mx-auto w-full"
      style={{
        height: hasPlayer
          ? 'calc(100dvh - 10.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
          : 'calc(100dvh - 4.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
      }}
    >
      <CardStack />
    </div>
  );
}
