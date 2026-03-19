import { motion } from 'framer-motion';
import { Heart, ThumbsDown, SkipForward, Play, Pause, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SwipeControlsProps {
  onLike: () => void;
  onDislike: () => void;
  onSkip: () => void;
  onPlayPause: () => void;
  onUndo: () => void;
  isPlaying: boolean;
  canUndo: boolean;
}

export function SwipeControls({
  onLike,
  onDislike,
  onSkip,
  onPlayPause,
  onUndo,
  isPlaying,
  canUndo,
}: SwipeControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-3 py-3">
      <ControlButton
        onClick={onDislike}
        color="bg-dislike/10 text-dislike hover:bg-dislike/20"
        label={t('a11y.dislikeButton')}
        size="lg"
      >
        <ThumbsDown size={24} />
      </ControlButton>

      <ControlButton
        onClick={onSkip}
        color="bg-skip/10 text-skip hover:bg-skip/20"
        label={t('a11y.skipButton')}
        size="md"
      >
        <SkipForward size={20} />
      </ControlButton>

      <ControlButton
        onClick={onLike}
        color="bg-like/10 text-like hover:bg-like/20"
        label={t('a11y.likeButton')}
        size="lg"
      >
        <Heart size={24} />
      </ControlButton>

      <ControlButton
        onClick={onPlayPause}
        color="bg-surface-700 text-surface-200 hover:bg-surface-600"
        label={t('a11y.playPauseButton')}
        size="sm"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </ControlButton>

      <ControlButton
        onClick={onUndo}
        color="bg-surface-700 text-surface-200 hover:bg-surface-600"
        label={t('a11y.undoButton')}
        size="sm"
        disabled={!canUndo}
      >
        <Undo2 size={16} />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  onClick,
  color,
  label,
  size,
  disabled = false,
  children,
}: {
  onClick: () => void;
  color: string;
  label: string;
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const sizeClass = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }[size];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-colors ${color} ${
        disabled ? 'opacity-30 cursor-not-allowed' : ''
      }`}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}
