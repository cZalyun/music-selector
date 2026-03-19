import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { AlertTriangle, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Song } from '@/types';
import { getThumbnailUrl, getFallbackThumbnail } from '@/utils/thumbnail';
import {
  SWIPE_THRESHOLD_X,
  SWIPE_THRESHOLD_Y,
  SWIPE_ROTATION_RANGE,
  CARD_DRAG_ELASTIC,
  CARD_SCALE_ON_DRAG,
} from '@/constants';

interface SwipeCardProps {
  song: Song;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isTop: boolean;
  exitDirection?: 'left' | 'right' | 'up' | null;
}

export function SwipeCard({ song, onSwipe, isTop, exitDirection }: SwipeCardProps) {
  const { t } = useTranslation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-SWIPE_ROTATION_RANGE, 0, SWIPE_ROTATION_RANGE]);

  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD_X], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD_X, 0], [1, 0]);
  const skipOpacity = useTransform(y, [SWIPE_THRESHOLD_Y, 0], [1, 0]);

  function handleDragEnd(
    _: unknown,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } },
  ) {
    const { offset, velocity } = info;

    if (offset.x > SWIPE_THRESHOLD_X || velocity.x > 500) {
      onSwipe('right');
    } else if (offset.x < -SWIPE_THRESHOLD_X || velocity.x < -500) {
      onSwipe('left');
    } else if (offset.y < SWIPE_THRESHOLD_Y || velocity.y < -500) {
      onSwipe('up');
    }
  }

  const exitVariants = {
    left: { x: -400, opacity: 0, rotate: -30, transition: { duration: 0.3 } },
    right: { x: 400, opacity: 0, rotate: 30, transition: { duration: 0.3 } },
    up: { y: -400, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing will-change-transform"
      style={{ x, y, rotate, zIndex: isTop ? 2 : 1 }}
      drag={isTop}
      dragElastic={CARD_DRAG_ELASTIC}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: CARD_SCALE_ON_DRAG }}
      animate={exitDirection ? exitVariants[exitDirection] : { scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.6 }}
      exit={exitDirection ? exitVariants[exitDirection] : { opacity: 0 }}
      role={isTop ? 'article' : 'presentation'}
      aria-label={isTop ? t('a11y.songCard', { title: song.title, artist: song.primaryArtist }) : undefined}
      aria-hidden={!isTop}
    >
      <div className="h-full bg-surface-800 rounded-3xl border border-surface-700 overflow-hidden flex flex-col shadow-2xl">
        {/* Thumbnail */}
        <div className="relative flex-1 min-h-0 bg-surface-900">
          <ThumbnailImage
            src={getThumbnailUrl(song.thumbnail, 'large')}
            fallback={getFallbackThumbnail(song.videoId, 'large')}
            alt={song.title}
            className="w-full h-full object-cover"
          />

          {/* Swipe overlays */}
          {isTop && (
            <>
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-like/20"
                style={{ opacity: likeOpacity }}
              >
                <span className="text-5xl font-black text-like border-4 border-like rounded-xl px-6 py-2 rotate-[-12deg]">
                  {t('swipe.overlays.like')}
                </span>
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-dislike/20"
                style={{ opacity: nopeOpacity }}
              >
                <span className="text-5xl font-black text-dislike border-4 border-dislike rounded-xl px-6 py-2 rotate-[12deg]">
                  {t('swipe.overlays.nope')}
                </span>
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-skip/20"
                style={{ opacity: skipOpacity }}
              >
                <span className="text-5xl font-black text-skip border-4 border-skip rounded-xl px-6 py-2">
                  {t('swipe.overlays.skip')}
                </span>
              </motion.div>
            </>
          )}

          {/* Explicit badge */}
          {song.isExplicit && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-surface-900/80 px-2 py-1 rounded-lg">
              <AlertTriangle size={12} className="text-skip" />
              <span className="text-xs font-bold text-skip">E</span>
            </div>
          )}
        </div>

        {/* Song info */}
        <div className="p-4 space-y-1">
          <h2 className="text-lg font-bold text-surface-100 truncate">{song.title}</h2>
          <p className="text-sm text-surface-400 truncate">{song.primaryArtist}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-surface-500 truncate flex-1">{song.album}</p>
            <span className="text-xs text-surface-500 tabular-nums ml-2">{song.duration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ThumbnailImage({
  src,
  fallback,
  alt,
  className,
}: {
  src: string;
  fallback: string;
  alt: string;
  className: string;
}) {
  const [stage, setStage] = useState(0);

  const imgSrc = stage === 0 ? (src || fallback) : stage === 1 ? fallback : '';

  const handleError = () => {
    setStage((prev) => {
      if (prev === 0 && fallback && src !== fallback) return 1;
      return 2;
    });
  };

  if (stage >= 2) {
    return (
      <div className={`${className} flex items-center justify-center bg-surface-700`}>
        <Music size={64} className="text-surface-500" />
      </div>
    );
  }

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} loading="eager" draggable={false} />;
}
