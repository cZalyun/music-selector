import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Music } from 'lucide-react';
import { SwipeCard } from './SwipeCard';
import { SwipeControls } from './SwipeControls';
import { useSongStore } from '@/store/songStore';
import { useSelectionStore } from '@/store/selectionStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useToastStore } from '@/store/toastStore';
import { loadVideoFromGesture } from '@/utils/playerBridge';
import { HAPTIC_LIKE, HAPTIC_DISLIKE, HAPTIC_SKIP } from '@/constants';
import type { SelectionStatus } from '@/types';

export function CardStack() {
  const { t } = useTranslation();
  const songs = useSongStore((s) => s.songs);
  const selections = useSelectionStore((s) => s.selections);
  const addSelection = useSelectionStore((s) => s.addSelection);
  const undoLast = useSelectionStore((s) => s.undoLast);
  const history = useSelectionStore((s) => s.history);
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentVideoId = usePlayerStore((s) => s.currentVideoId);
  const autoplay = useSettingsStore((s) => s.autoplay);
  const hideExplicit = useSettingsStore((s) => s.hideExplicit);
  const addToast = useToastStore((s) => s.addToast);

  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const queue = useMemo(() => {
    return songs.filter((song) => {
      if (selections[song.index]) return false;
      if (hideExplicit && song.isExplicit) return false;
      return true;
    });
  }, [songs, selections, hideExplicit]);

  const currentSong = queue[0];
  const nextSong = queue[1];
  const reviewed = Object.keys(selections).length;
  const total = songs.length;
  const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  // Load first song into player on mount
  useEffect(() => {
    if (currentSong && !currentVideoId) {
      setCurrentSong(currentSong.videoId, currentSong.index, false);
    }
  }, [currentSong, currentVideoId, setCurrentSong]);

  const triggerHaptic = useCallback((pattern: number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (!currentSong) return;

    let status: SelectionStatus;
    if (direction === 'right') {
      status = 'liked';
      triggerHaptic(HAPTIC_LIKE);
      addToast(t('toast.liked'), 'success');
    } else if (direction === 'left') {
      status = 'disliked';
      triggerHaptic(HAPTIC_DISLIKE);
    } else {
      status = 'skipped';
      triggerHaptic(HAPTIC_SKIP);
    }

    setExitDirection(direction);

    // Small delay for exit animation
    setTimeout(() => {
      addSelection(currentSong.index, status);
      setExitDirection(null);

      // Load next song
      const next = queue[1];
      if (next) {
        loadVideoFromGesture(next.videoId, autoplay);
        setCurrentSong(next.videoId, next.index, autoplay);
      }
    }, 150);
  }, [currentSong, queue, addSelection, setCurrentSong, autoplay, addToast, t, triggerHaptic]);

  const handleUndo = useCallback(() => {
    const undone = undoLast();
    if (undone) {
      const song = songs.find((s) => s.index === undone.songIndex);
      if (song) {
        loadVideoFromGesture(song.videoId, autoplay);
        setCurrentSong(song.videoId, song.index, autoplay);
      }
    }
  }, [undoLast, songs, autoplay, setCurrentSong]);

  const handlePlayPause = useCallback(() => {
    if (!currentSong) return;
    const { isPlaying: playing, setPlaying } = usePlayerStore.getState();
    if (playing) {
      setPlaying(false);
    } else {
      loadVideoFromGesture(currentSong.videoId, true);
      setPlaying(true);
    }
  }, [currentSong]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleSwipe('right');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSwipe('left');
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleSwipe('up');
          break;
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          handleUndo();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSwipe, handlePlayPause, handleUndo]);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Music size={48} className="text-surface-500 mb-4" />
        <h2 className="text-xl font-bold text-surface-200 mb-2">{t('swipe.noSongs.title')}</h2>
        <p className="text-surface-400">{t('swipe.noSongs.subtitle')}</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <CheckCircle size={48} className="text-like mb-4" />
        <h2 className="text-xl font-bold text-surface-200 mb-2">{t('swipe.allDone.title')}</h2>
        <p className="text-surface-400">{t('swipe.allDone.subtitle')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs text-surface-400 mb-1.5">
          <span>{t('swipe.progress', { reviewed, total, percent })}</span>
          <span>{t('swipe.remaining', { count: queue.length })}</span>
        </div>
        <div
          className="h-1.5 bg-surface-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={reviewed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={t('a11y.progressBar', { reviewed, total })}
        >
          <div
            className="h-full bg-accent-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 relative mx-4 my-2 min-h-0">
        <AnimatePresence>
          {nextSong && (
            <SwipeCard
              key={nextSong.index}
              song={nextSong}
              onSwipe={() => {}}
              isTop={false}
            />
          )}
          {currentSong && (
            <SwipeCard
              key={currentSong.index}
              song={currentSong}
              onSwipe={handleSwipe}
              isTop={true}
              exitDirection={exitDirection}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <SwipeControls
        onLike={() => handleSwipe('right')}
        onDislike={() => handleSwipe('left')}
        onSkip={() => handleSwipe('up')}
        onPlayPause={handlePlayPause}
        onUndo={handleUndo}
        isPlaying={isPlaying}
        canUndo={history.length > 0}
      />
    </div>
  );
}
