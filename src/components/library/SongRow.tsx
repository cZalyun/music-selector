import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Heart, ThumbsDown, SkipForward, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Song, SelectionStatus } from '@/types';
import { getThumbnailUrl, getFallbackThumbnail } from '@/utils/thumbnail';
import { getSearchHighlightRanges } from '@/utils/search';
import { acquireSlot } from '@/utils/imageQueue';
import { LAZY_LOAD_ROOT_MARGIN } from '@/constants';

interface SongRowProps {
  song: Song;
  selectionStatus?: SelectionStatus;
  isActive: boolean;
  searchQuery: string;
  onPlay: (song: Song) => void;
}

const STATUS_CONFIG: Record<SelectionStatus, { icon: typeof Heart; color: string; bg: string }> = {
  liked: { icon: Heart, color: 'text-like', bg: 'bg-like/10' },
  disliked: { icon: ThumbsDown, color: 'text-dislike', bg: 'bg-dislike/10' },
  skipped: { icon: SkipForward, color: 'text-skip', bg: 'bg-skip/10' },
};

export const SongRow = memo(function SongRow({
  song,
  selectionStatus,
  isActive,
  searchQuery,
  onPlay,
}: SongRowProps) {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    onPlay(song);
  }, [onPlay, song]);

  const statusConfig = selectionStatus ? STATUS_CONFIG[selectionStatus] : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        isActive
          ? 'bg-accent-500/10 border border-accent-500/30'
          : 'hover:bg-surface-800/70 border border-transparent'
      }`}
      aria-label={t('a11y.songCard', { title: song.title, artist: song.primaryArtist })}
      aria-current={isActive ? 'true' : undefined}
    >
      {/* Thumbnail */}
      <RowThumbnail
        src={getThumbnailUrl(song.thumbnail, 'small')}
        fallback={getFallbackThumbnail(song.videoId, 'small')}
      />

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-100 truncate">
          <HighlightedText text={song.title} query={searchQuery} />
        </p>
        <p className="text-xs text-surface-400 truncate">
          <HighlightedText text={song.primaryArtist} query={searchQuery} />
        </p>
      </div>

      {/* Now playing indicator */}
      {isActive && (
        <div className="flex items-end gap-0.5 h-4" aria-label={t('library.nowPlaying')}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-0.5 bg-accent-400 rounded-full animate-pulse"
              style={{
                height: `${8 + i * 4}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Status icon */}
      {StatusIcon && statusConfig && (
        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${statusConfig.bg}`}>
          <StatusIcon size={12} className={statusConfig.color} />
        </div>
      )}

      {/* Duration */}
      <span className="text-xs text-surface-400 tabular-nums shrink-0">
        {song.duration}
      </span>
    </button>
  );
});

function RowThumbnail({ src, fallback }: { src: string; fallback: string }) {
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [slotAcquired, setSlotAcquired] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: LAZY_LOAD_ROOT_MARGIN },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || slotAcquired) return;

    let cancelled = false;
    acquireSlot().then((release) => {
      if (cancelled) {
        release();
        return;
      }
      releaseRef.current = release;
      setSlotAcquired(true);
    });

    return () => { cancelled = true; };
  }, [visible, slotAcquired]);

  const advance = useCallback(() => {
    setStage((prev) => {
      if (prev === 0 && fallback && src !== fallback) return 1;
      return 2;
    });
  }, [fallback, src]);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth < 2 || img.naturalHeight < 2) {
      advance();
    }
    releaseRef.current?.();
    releaseRef.current = null;
  }, [advance]);

  const handleError = useCallback(() => {
    advance();
    releaseRef.current?.();
    releaseRef.current = null;
  }, [advance]);

  const imgSrc = stage === 0 ? (src || fallback) : stage === 1 ? fallback : '';

  return (
    <div ref={ref} className="w-10 h-10 rounded-lg overflow-hidden bg-surface-700 shrink-0">
      {visible && slotAcquired && stage < 2 ? (
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : stage >= 2 ? (
        <div className="w-full h-full flex items-center justify-center">
          <Play size={14} className="text-surface-500" />
        </div>
      ) : (
        <div className="w-full h-full bg-surface-700" />
      )}
    </div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const ranges = getSearchHighlightRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const range of ranges) {
    if (range.start > lastEnd) {
      parts.push(text.slice(lastEnd, range.start));
    }
    parts.push(
      <mark key={range.start} className="bg-accent-500/30 text-inherit rounded-sm px-0.5">
        {text.slice(range.start, range.end)}
      </mark>,
    );
    lastEnd = range.end;
  }

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return <>{parts}</>;
}
