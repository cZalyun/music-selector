import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { getThumbnailUrl, getFallbackThumbnail } from '../../utils/thumbnail';
import { usePlayerStore } from '../../store/playerStore';
import { loadVideoFromGesture } from '../../utils/playerBridge';
import { useSelectionStore } from '../../store/selectionStore';
import type { Song } from '../../types';

interface SongRowProps {
  song: Song;
  index: number;
}

export default function SongRow({ song, index }: SongRowProps) {
  const { currentVideoId, isPlaying, setCurrentSong } = usePlayerStore();
  const { selections } = useSelectionStore();
  
  const isActive = currentVideoId === song.videoId;
  const selection = selections[song.index];

  const handlePlay = () => {
    if (!isActive) {
      loadVideoFromGesture(song.videoId, true);
      setCurrentSong(song.videoId, index, true);
    }
  };

  return (
    <div 
      onClick={handlePlay}
      className={`group flex items-center gap-3 p-2 mx-2 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-brand-500/10 border border-brand-500/30' 
          : 'hover:bg-surface-100 dark:hover:bg-surface-800/50 border border-transparent'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlay(); }}
    >
      <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-surface-200 dark:bg-surface-800">
        <RowThumbnail videoId={song.videoId} thumbnail={song.thumbnail} alt={song.title} />
        
        {/* Play Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {isActive && isPlaying ? (
            <div className="flex gap-1 items-end h-4">
              <div className="w-1 bg-brand-500 animate-[bounce_1s_infinite] h-full" />
              <div className="w-1 bg-brand-500 animate-[bounce_1s_infinite_0.2s] h-full" />
              <div className="w-1 bg-brand-500 animate-[bounce_1s_infinite_0.4s] h-full" />
            </div>
          ) : (
            <Play size={20} className="text-white" fill="currentColor" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate ${isActive ? 'text-brand-500' : 'text-surface-900 dark:text-surface-50'}`}>
          {song.title}
        </h4>
        <p className="text-xs text-surface-500 truncate">
          {song.primaryArtist} {song.album ? `• ${song.album}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {selection && (
          <div className={`w-2 h-2 rounded-full ${
            selection.status === 'liked' ? 'bg-accent-500' : 
            selection.status === 'disliked' ? 'bg-brand-500' : 
            'bg-amber-500'
          }`} />
        )}
        <span className="text-xs text-surface-400 font-medium w-10 text-right">
          {song.duration}
        </span>
      </div>
    </div>
  );
}

function RowThumbnail({ videoId, thumbnail, alt }: { videoId: string; thumbnail: string; alt: string }) {
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const src = stage === 0 
    ? getThumbnailUrl(thumbnail, 'small') 
    : stage === 1 
      ? getFallbackThumbnail(videoId, 'small') 
      : '';

  const handleError = () => {
    setStage(s => Math.min(s + 1, 2));
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth < 2 || img.naturalHeight < 2) {
      handleError();
    }
  };

  if (!visible) {
    return <img ref={ref} className="w-full h-full object-cover" />;
  }

  if (stage === 2) {
    return <div className="w-full h-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center"><Play size={20} className="text-surface-400" /></div>;
  }

  return (
    <img 
      ref={ref}
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover"
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}
