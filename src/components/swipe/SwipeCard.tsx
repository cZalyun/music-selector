import { useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { Song } from '../../types';
import { getThumbnailUrl, getFallbackThumbnail } from '../../utils/thumbnail';

interface SwipeCardProps {
  song: Song;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isTop: boolean;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_UP_THRESHOLD = -80;

export default function SwipeCard({ song, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const skipOpacity = useTransform(y, [-80, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left');
    } else if (info.offset.y < SWIPE_UP_THRESHOLD) {
      onSwipe('up');
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, zIndex: isTop ? 10 : 1 }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      initial={isTop ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.6 }}
      animate={isTop ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.6 }}
      exit={{
        x: x.get() > 50 ? 400 : x.get() < -50 ? -400 : 0,
        y: y.get() < -40 ? -400 : 0,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-surface-800 border border-surface-700/50 shadow-2xl">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[4/3] max-h-[45%] overflow-hidden bg-surface-900">
          <ThumbnailImage
            src={getThumbnailUrl(song.thumbnail, 'large')}
            fallback={getFallbackThumbnail(song.videoId, 'large')}
            alt={song.title}
            className="w-full h-full object-cover"
          />

          {/* Swipe overlays */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"
          >
            <span className="text-5xl font-black text-emerald-400 rotate-[-12deg] border-4 border-emerald-400 px-6 py-2 rounded-xl">
              LIKE
            </span>
          </motion.div>
          <motion.div
            style={{ opacity: dislikeOpacity }}
            className="absolute inset-0 bg-rose-500/20 flex items-center justify-center"
          >
            <span className="text-5xl font-black text-rose-400 rotate-[12deg] border-4 border-rose-400 px-6 py-2 rounded-xl">
              NOPE
            </span>
          </motion.div>
          <motion.div
            style={{ opacity: skipOpacity }}
            className="absolute inset-0 bg-amber-500/20 flex items-center justify-center"
          >
            <span className="text-5xl font-black text-amber-400 border-4 border-amber-400 px-6 py-2 rounded-xl">
              SKIP
            </span>
          </motion.div>
        </div>

        {/* Song info */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <h2 className="text-base font-bold text-surface-50 leading-tight flex-1 line-clamp-2">
              {song.title}
            </h2>
            {song.isExplicit && (
              <span className="shrink-0 mt-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-surface-600 text-surface-200 rounded">
                E
              </span>
            )}
          </div>
          <p className="text-sm text-accent-400 font-medium truncate">{song.primaryArtist}</p>
          {song.album && (
            <p className="text-xs text-surface-400 truncate">{song.album}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
            <span>{song.duration}</span>
            {song.isExplicit && (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertTriangle size={10} /> Explicit
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Disc({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ThumbnailImage({ src, fallback, alt, className }: { src: string; fallback: string; alt: string; className: string }) {
  // 0 = trying primary, 1 = trying fallback, 2 = all failed
  const [stage, setStage] = useState(0);
  const imgSrc = stage === 0 ? (src || fallback) : stage === 1 ? fallback : '';

  const handleError = () => {
    setStage((prev) => {
      if (prev === 0 && fallback && src !== fallback) return 1;
      return 2;
    });
  };

  if (!imgSrc || stage === 2) {
    return (
      <div className={`${className} flex items-center justify-center text-surface-600 bg-surface-900`}>
        <Disc size={80} />
      </div>
    );
  }

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} loading="eager" />;
}
