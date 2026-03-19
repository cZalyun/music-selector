import { useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import SwipeControls from './SwipeControls';
import { useSongStore } from '../../store/songStore';
import { useSelectionStore } from '../../store/selectionStore';
import { usePlayerStore } from '../../store/playerStore';
import { useToastStore } from '../../store/toastStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { SelectionStatus } from '../../types';

export default function CardStack() {
  const songs = useSongStore((s) => s.songs);
  const { selections, addSelection, undoLast } = useSelectionStore();
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);
  const addToast = useToastStore((s) => s.addToast);
  const autoplay = useSettingsStore((s) => s.autoplay);
  const hideExplicit = useSettingsStore((s) => s.hideExplicit);

  const unreviewed = useMemo(
    () => songs.filter((s) => !selections[s.index] && (!hideExplicit || !s.isExplicit)),
    [songs, selections, hideExplicit]
  );

  const currentSong = unreviewed[0] ?? null;
  const nextSong = unreviewed[1] ?? null;
  const totalReviewed = Object.keys(selections).length;

  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      if (!currentSong) return;
      const statusMap: Record<string, SelectionStatus> = {
        right: 'liked',
        left: 'disliked',
        up: 'skipped',
      };
      const status = statusMap[direction];
      addSelection(currentSong.index, status);

      if (navigator.vibrate) navigator.vibrate(30);

      if (status === 'liked') {
        addToast(`Liked "${currentSong.title}"`, 'success');
      }

      // Load next song
      const next = unreviewed[1];
      if (next) {
        setCurrentSong(next.videoId, next.index, autoplay);
      }
    },
    [currentSong, unreviewed, addSelection, setCurrentSong, addToast, autoplay]
  );

  const handleUndo = useCallback(() => {
    const undone = undoLast();
    if (undone) {
      const song = songs.find((s) => s.index === undone.songIndex);
      if (song) {
        setCurrentSong(song.videoId, song.index);
        addToast('Undid last selection', 'info');
      }
    }
  }, [undoLast, songs, setCurrentSong, addToast]);

  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentVideoId = usePlayerStore((s) => s.currentVideoId);
  const setPlaying = usePlayerStore((s) => s.setPlaying);

  const handlePlay = useCallback(() => {
    if (!currentSong) return;
    if (currentVideoId === currentSong.videoId) {
      setPlaying(!isPlaying);
    } else {
      setCurrentSong(currentSong.videoId, currentSong.index);
    }
  }, [currentSong, currentVideoId, isPlaying, setCurrentSong, setPlaying]);

  const isCurrentSongPlaying = currentVideoId === currentSong?.videoId && isPlaying;

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
        <div className="w-20 h-20 rounded-3xl bg-surface-800 flex items-center justify-center mb-4">
          <span className="text-4xl">🎵</span>
        </div>
        <h2 className="text-xl font-bold text-surface-200 mb-2">No songs loaded</h2>
        <p className="text-surface-500 text-sm">Upload a CSV file first to start reviewing</p>
      </div>
    );
  }

  if (unreviewed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
        <div className="w-20 h-20 rounded-3xl bg-surface-800 flex items-center justify-center mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-xl font-bold text-surface-200 mb-2">All done!</h2>
        <p className="text-surface-500 text-sm mb-2">
          You&apos;ve reviewed all {songs.length} songs
        </p>
        <p className="text-surface-500 text-xs">
          Check the Library tab to see your selections, or undo to review again.
        </p>
        <button
          onClick={handleUndo}
          className="mt-4 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 text-sm rounded-xl transition-colors"
        >
          Undo Last
        </button>
      </div>
    );
  }

  const progress = songs.length > 0 ? (totalReviewed / songs.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center justify-between text-xs text-surface-400 mb-1.5">
          <span>{totalReviewed} of {songs.length} reviewed</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 relative mx-4 mb-1" style={{ minHeight: '280px' }}>
        <AnimatePresence mode="popLayout">
          {nextSong && (
            <SwipeCard key={nextSong.index} song={nextSong} onSwipe={() => {}} isTop={false} />
          )}
          {currentSong && (
            <SwipeCard key={currentSong.index} song={currentSong} onSwipe={handleSwipe} isTop={true} />
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <SwipeControls
        onDislike={() => handleSwipe('left')}
        onSkip={() => handleSwipe('up')}
        onLike={() => handleSwipe('right')}
        onUndo={handleUndo}
        onPlay={handlePlay}
        canUndo={totalReviewed > 0}
        isPlaying={isCurrentSongPlaying}
      />
    </div>
  );
}
