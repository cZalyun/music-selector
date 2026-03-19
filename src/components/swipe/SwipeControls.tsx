import { motion } from 'framer-motion';
import { Play, Pause, Heart, ThumbsDown, SkipForward, Undo2 } from 'lucide-react';
import { SelectionStatus } from '../../types';

interface SwipeControlsProps {
  onSwipe: (status: SelectionStatus) => void;
  onUndo: () => void;
  canUndo: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function SwipeControls({ onSwipe, onUndo, canUndo, isPlaying, onTogglePlay }: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 w-full py-4 px-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onUndo}
        disabled={!canUndo}
        className="p-3 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors"
        aria-label="Undo last selection"
      >
        <Undo2 size={24} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onSwipe('disliked')}
        className="p-4 rounded-full bg-surface-200 dark:bg-surface-800 text-brand-500 hover:bg-brand-500/10 hover:text-brand-600 transition-colors"
        aria-label="Dislike"
      >
        <ThumbsDown size={32} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onTogglePlay}
        className="p-5 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 hover:shadow-brand-500/25 transition-all"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onSwipe('liked')}
        className="p-4 rounded-full bg-surface-200 dark:bg-surface-800 text-accent-500 hover:bg-accent-500/10 hover:text-accent-600 transition-colors"
        aria-label="Like"
      >
        <Heart size={32} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onSwipe('skipped')}
        className="p-3 rounded-full bg-surface-200 dark:bg-surface-800 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
        aria-label="Skip"
      >
        <SkipForward size={24} />
      </motion.button>
    </div>
  );
}
