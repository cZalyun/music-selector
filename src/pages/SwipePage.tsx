import CardStack from '../components/swipe/CardStack';
import { usePlayerStore } from '../store/playerStore';

export default function SwipePage() {
  const hasPlayer = !!usePlayerStore((s) => s.currentVideoId);

  return (
    <div
      className="flex flex-col max-w-lg mx-auto w-full"
      style={{ height: hasPlayer ? 'calc(100dvh - 10.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' : 'calc(100dvh - 4.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' }}
    >
      <CardStack />
    </div>
  );
}
