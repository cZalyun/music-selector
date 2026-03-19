import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSongStore } from '../../store/songStore';
import { useSelectionStore } from '../../store/selectionStore';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { loadVideoFromGesture, preWarmPlayer } from '../../utils/playerBridge';
import SwipeCard from './SwipeCard';
import SwipeControls from './SwipeControls';
import type { SelectionStatus } from '../../types';

export default function CardStack() {
  const { songs } = useSongStore();
  const { selections, addSelection, undoLast, history } = useSelectionStore();
  const { isPlaying, setPlaying, setCurrentSong, currentVideoId } = usePlayerStore();
  const { autoplay, hideExplicit } = useSettingsStore();

  const [hasInteracted, setHasInteracted] = useState(false);

  // Filter unreviewed songs
  const unreviewedSongs = useMemo(() => {
    return songs.filter((song, index) => {
      const isReviewed = !!selections[index];
      const isHiddenExplicit = hideExplicit && song.isExplicit;
      return !isReviewed && !isHiddenExplicit;
    });
  }, [songs, selections, hideExplicit]);

  const currentSong = unreviewedSongs[0];
  const nextSong = unreviewedSongs[1];

  // Auto-play the first song when it appears
  useEffect(() => {
    if (currentSong && currentSong.videoId !== currentVideoId && autoplay && hasInteracted) {
      loadVideoFromGesture(currentSong.videoId, true);
      setCurrentSong(currentSong.videoId, currentSong.index, true);
    }
  }, [currentSong, currentVideoId, autoplay, hasInteracted, setCurrentSong]);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      preWarmPlayer();
    }
  };

  const handleSwipe = (status: SelectionStatus) => {
    handleInteraction();
    
    if (!currentSong) return;
    
    // Haptic feedback
    if (navigator.vibrate) {
      if (status === 'liked') navigator.vibrate(30);
      else if (status === 'disliked') navigator.vibrate([15, 20, 15]);
      else navigator.vibrate(50);
    }

    addSelection(currentSong.index, status);

    // Pre-load next song
    if (nextSong) {
      loadVideoFromGesture(nextSong.videoId, autoplay);
      setCurrentSong(nextSong.videoId, nextSong.index, autoplay);
    } else {
      usePlayerStore.getState().stop();
    }
  };

  const handleUndo = () => {
    handleInteraction();
    const undone = undoLast();
    if (undone) {
      const restoredSong = songs[undone.songIndex];
      if (restoredSong) {
        loadVideoFromGesture(restoredSong.videoId, autoplay);
        setCurrentSong(restoredSong.videoId, restoredSong.index, autoplay);
      }
    }
  };

  const handleTogglePlay = () => {
    handleInteraction();
    if (!currentSong) return;
    
    if (currentVideoId !== currentSong.videoId) {
      loadVideoFromGesture(currentSong.videoId, true);
      setCurrentSong(currentSong.videoId, currentSong.index, true);
    } else {
      setPlaying(!isPlaying);
    }
  };

  const totalReviewed = Object.keys(selections).length;
  const totalSongs = songs.length;
  const progressPercent = totalSongs > 0 ? Math.round((totalReviewed / totalSongs) * 100) : 0;

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center" onClick={handleInteraction}>
        <div className="w-20 h-20 bg-surface-200 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🎵</span>
        </div>
        <h2 className="text-xl font-bold mb-2">No Songs Loaded</h2>
        <p className="text-surface-500 max-w-xs mx-auto">
          Upload a CSV file on the Home tab to start reviewing your library.
        </p>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center" onClick={handleInteraction}>
        <div className="w-20 h-20 bg-brand-500/20 text-brand-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="text-xl font-bold mb-2">All Caught Up!</h2>
        <p className="text-surface-500 max-w-xs mx-auto mb-6">
          You've reviewed all available songs. Check your library or stats!
        </p>
        <button 
          onClick={handleUndo}
          disabled={history.length === 0}
          className="px-6 py-2 bg-surface-200 dark:bg-surface-800 rounded-full font-medium disabled:opacity-50 hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors"
        >
          Undo Last Swipe
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative pt-4 pb-2 px-4" onClick={handleInteraction}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-surface-500">
          <span className="text-brand-500">{totalReviewed}</span> / {totalSongs} reviewed
        </div>
        <div className="flex-1 mx-4 h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-sm font-medium text-surface-500">
          {progressPercent}%
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 relative mb-4">
        <AnimatePresence mode="popLayout">
          {nextSong && (
            <SwipeCard
              key={nextSong.index}
              song={nextSong}
              onSwipe={() => {}} // Disabled for background card
              isTop={false}
              isActive={false}
            />
          )}
          <SwipeCard
            key={currentSong.index}
            song={currentSong}
            onSwipe={handleSwipe}
            isTop={true}
            isActive={true}
          />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <SwipeControls
        onSwipe={handleSwipe}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        isPlaying={isPlaying && currentVideoId === currentSong.videoId}
        onTogglePlay={handleTogglePlay}
      />
    </div>
  );
}
