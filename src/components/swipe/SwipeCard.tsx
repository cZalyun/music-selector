import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { AlertTriangle, Play } from 'lucide-react';
import type { Song, SelectionStatus } from '../../types';
import { getThumbnailUrl, getFallbackThumbnail } from '../../utils/thumbnail';

interface SwipeCardProps {
  song: Song;
  onSwipe: (status: SelectionStatus) => void;
  isTop: boolean;
  isActive: boolean; // if it's currently the one being shown (not preloaded behind)
}

function ThumbnailImage({ src, fallback, alt, className }: { src: string; fallback: string; alt: string; className: string }) {
  const [stage, setStage] = useState(0);
  const imgSrc = stage === 0 ? (src || fallback) : stage === 1 ? fallback : '';

  const handleError = () => {
    setStage((prev) => {
      if (prev === 0 && fallback && src !== fallback) return 1;
      return 2;
    });
  };

  if (stage === 2) {
    return (
      <div className={`flex items-center justify-center bg-surface-800 text-surface-500 ${className}`}>
        <Play size={48} />
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      onError={handleError} 
      loading="eager" 
    />
  );
}

export default function SwipeCard({ song, onSwipe, isTop, isActive }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transforms for animations based on drag
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);
  const skipOpacity = useTransform(y, [-50, -150], [0, 1]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThresholdX = 100;
    const swipeThresholdY = -80; // Negative y is up
    
    if (info.offset.x > swipeThresholdX) {
      onSwipe('liked');
    } else if (info.offset.x < -swipeThresholdX) {
      onSwipe('disliked');
    } else if (info.offset.y < swipeThresholdY) {
      onSwipe('skipped');
    }
  };

  // Keyboard controls
  useEffect(() => {
    if (!isActive || !isTop) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onSwipe('liked');
      } else if (e.key === 'ArrowLeft') {
        onSwipe('disliked');
      } else if (e.key === 'ArrowUp') {
        onSwipe('skipped');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isTop, onSwipe]);

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        zIndex: isTop ? 10 : 0,
        willChange: 'transform' // Performance optimization
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      initial={isTop ? { scale: 1 } : { scale: 0.95, opacity: 0.6 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.6 }}
      exit={
        // Type casting to any to satisfy framer-motion's complex types for custom exit functions
        ((custom: string) => ({
          x: custom === 'liked' ? 500 : custom === 'disliked' ? -500 : 0,
          y: custom === 'skipped' ? -500 : 0,
          opacity: 0,
          transition: { duration: 0.2 }
        })) as any
      }
      className={`absolute inset-0 w-full h-full rounded-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}
      role="article"
      aria-label={`${song.title} by ${song.primaryArtist}`}
      tabIndex={isTop ? 0 : -1} // Ensure focusable for keyboard users
    >
      {/* Background Thumbnail */}
      <div className="absolute inset-0 w-full h-full">
         <ThumbnailImage 
           src={getThumbnailUrl(song.thumbnail, 'large')} 
           fallback={getFallbackThumbnail(song.videoId, 'large')}
           alt={song.title}
           className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
      </div>

      {/* Swipe Indicators */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20">
        <div className="border-4 border-brand-500 text-brand-500 text-4xl font-black px-4 py-2 rounded-lg transform -rotate-12 uppercase tracking-widest bg-black/20 backdrop-blur-sm">
          Like
        </div>
      </motion.div>

      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-20">
        <div className="border-4 border-brand-500 text-brand-500 text-4xl font-black px-4 py-2 rounded-lg transform rotate-12 uppercase tracking-widest bg-black/20 backdrop-blur-sm">
          Nope
        </div>
      </motion.div>

      <motion.div style={{ opacity: skipOpacity }} className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
        <div className="border-4 border-amber-500 text-amber-500 text-3xl font-black px-4 py-2 rounded-lg uppercase tracking-widest bg-black/20 backdrop-blur-sm">
          Skip
        </div>
      </motion.div>

      {/* Song Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-white">
        <div className="flex items-center gap-2 mb-2">
          {song.isExplicit && (
            <span className="flex items-center gap-1 bg-surface-800/80 backdrop-blur text-xs font-bold px-1.5 py-0.5 rounded text-surface-200">
              <AlertTriangle size={12} /> E
            </span>
          )}
          <span className="text-sm font-medium opacity-80">{song.duration}</span>
        </div>
        
        <h2 className="text-3xl font-bold mb-1 leading-tight drop-shadow-md">
          {song.title}
        </h2>
        
        <p className="text-lg font-medium opacity-90 drop-shadow-md mb-1">
          {song.primaryArtist}
        </p>
        
        {song.album && (
          <p className="text-sm opacity-70 drop-shadow-md truncate">
            {song.album}
          </p>
        )}
      </div>
    </motion.div>
  );
}
