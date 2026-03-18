import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, ThumbsDown, SkipForward } from 'lucide-react';
import type { SongWithSelection } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { getThumbnailUrl, getFallbackThumbnail } from '../../utils/thumbnail';
import { acquireSlot } from '../../utils/imageQueue';

interface SongRowProps {
  song: SongWithSelection;
  index: number;
}

const statusConfig = {
  liked: { icon: Heart, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  disliked: { icon: ThumbsDown, color: 'text-rose-400', bg: 'bg-rose-900/30' },
  skipped: { icon: SkipForward, color: 'text-amber-400', bg: 'bg-amber-900/30' },
};

export default function SongRow({ song, index }: SongRowProps) {
  const { setCurrentSong, currentSongIndex } = usePlayerStore();
  const isActive = currentSongIndex === song.index;

  const handlePlay = () => {
    setCurrentSong(song.videoId, song.index);
  };

  const status = song.selection?.status;
  const StatusIcon = status ? statusConfig[status].icon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      onClick={handlePlay}
      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
        isActive
          ? 'bg-accent-600/10 border border-accent-600/30'
          : 'hover:bg-surface-800/60 border border-transparent'
      }`}
    >
      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-800">
        <RowThumbnail
          src={getThumbnailUrl(song.thumbnail, 'small')}
          fallback={getFallbackThumbnail(song.videoId, 'small')}
        />
        {isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex gap-0.5">
              <span className="w-0.5 h-3 bg-accent-400 animate-pulse rounded-full" />
              <span className="w-0.5 h-4 bg-accent-400 animate-pulse rounded-full" style={{ animationDelay: '0.15s' }} />
              <span className="w-0.5 h-2 bg-accent-400 animate-pulse rounded-full" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-accent-400' : 'text-surface-200'}`}>
          {song.title}
        </p>
        <p className="text-xs text-surface-500 truncate">
          {song.primaryArtist}{song.album ? ` · ${song.album}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-surface-600">{song.duration}</span>
        {status && StatusIcon && (
          <div className={`p-1 rounded-md ${statusConfig[status].bg}`}>
            <StatusIcon size={12} className={statusConfig[status].color} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RowThumbnail({ src, fallback }: { src: string; fallback: string }) {
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);
  const releaseRef = useRef<(() => void) | null>(null);

  const imgSrc = stage === 0 ? (src || fallback) : stage === 1 ? fallback : '';

  useEffect(() => {
    // No src to load — skip acquiring a slot
    if (!imgSrc) { setReady(false); return; }

    let cancelled = false;
    setReady(false);

    acquireSlot().then((release) => {
      if (cancelled) { release(); return; }
      releaseRef.current = release;
      setReady(true);
    });

    return () => {
      cancelled = true;
      if (releaseRef.current) { releaseRef.current(); releaseRef.current = null; }
    };
  }, [imgSrc]);

  const done = () => {
    if (releaseRef.current) { releaseRef.current(); releaseRef.current = null; }
  };

  const advance = () => {
    done();
    setStage((prev) => {
      if (prev === 0 && fallback && src !== fallback) return 1;
      return 2;
    });
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth < 2 || img.naturalHeight < 2) { advance(); return; }
    done();
  };

  if (!imgSrc || stage === 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-surface-600">
        <Play size={16} />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="w-full h-full flex items-center justify-center text-surface-600 animate-pulse bg-surface-700">
        <Play size={16} />
      </div>
    );
  }

  return <img src={imgSrc} alt="" className="w-full h-full object-cover" onError={advance} onLoad={handleLoad} loading="lazy" />;
}
