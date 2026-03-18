import { motion } from 'framer-motion';
import { ThumbsDown, SkipForward, Heart, Undo2, Play, Pause } from 'lucide-react';

interface SwipeControlsProps {
  onDislike: () => void;
  onSkip: () => void;
  onLike: () => void;
  onUndo: () => void;
  onPlay: () => void;
  canUndo: boolean;
  isPlaying?: boolean;
}

export default function SwipeControls({ onDislike, onSkip, onLike, onUndo, onPlay, canUndo, isPlaying }: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-4 py-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onUndo}
        disabled={!canUndo}
        className="p-2.5 rounded-full bg-surface-800 text-surface-400 hover:text-surface-200 disabled:opacity-30 transition-colors"
      >
        <Undo2 size={18} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onDislike}
        className="p-4 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-400 hover:bg-rose-900/60 transition-colors"
      >
        <ThumbsDown size={24} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onPlay}
        className="p-3 rounded-full bg-surface-800 text-accent-400 hover:bg-surface-700 transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onLike}
        className="p-4 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
      >
        <Heart size={24} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSkip}
        className="p-2.5 rounded-full bg-surface-800 text-amber-400 hover:bg-surface-700 transition-colors"
      >
        <SkipForward size={18} />
      </motion.button>
    </div>
  );
}
