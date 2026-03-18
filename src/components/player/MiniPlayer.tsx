import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useSongStore } from '../../store/songStore';

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

let apiLoaded = false;
let apiReady = false;

function loadYouTubeAPI(): Promise<void> {
  if (apiReady) return Promise.resolve();
  if (apiLoaded) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (apiReady) { clearInterval(check); resolve(); }
      }, 100);
    });
  }
  apiLoaded = true;
  return new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      resolve();
    };
  });
}

export default function MiniPlayer() {
  const { currentVideoId, currentSongIndex, isPlaying, volume, setPlaying, setVolume, stop } = usePlayerStore();
  const songs = useSongStore((s) => s.songs);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeVideoRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  const currentSong = songs.find((s) => s.index === currentSongIndex);

  const initPlayer = useCallback(async (videoId: string, shouldPlay: boolean) => {
    activeVideoRef.current = videoId;
    loadingRef.current = true;

    await loadYouTubeAPI();

    // If the video changed while we were loading the API, bail out
    if (activeVideoRef.current !== videoId) return;

    if (playerRef.current) {
      if (shouldPlay) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.cueVideoById(videoId);
      }
      // loadingRef stays true — cleared by onStateChange when PLAYING/CUED fires
      return;
    }

    playerRef.current = new window.YT.Player('yt-player', {
      height: '0',
      width: '0',
      videoId,
      playerVars: {
        autoplay: shouldPlay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          loadingRef.current = false;
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          // PLAYING / CUED mark the end of a video transition
          if (event.data === window.YT.PlayerState.PLAYING) {
            loadingRef.current = false;
            setPlaying(true);
            return;
          }
          if (event.data === window.YT.PlayerState.CUED) {
            loadingRef.current = false;
            return;
          }
          // Ignore stale events (e.g. old video's PAUSED) during transitions
          if (loadingRef.current) return;
          if (event.data === window.YT.PlayerState.ENDED) {
            setPlaying(false);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setPlaying(false);
          }
        },
      },
    });
  }, [setPlaying]);

  useEffect(() => {
    if (currentVideoId) {
      initPlayer(currentVideoId, isPlaying);
    }
    // Only react to videoId changes — isPlaying is handled by the separate effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoId]);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      } else if (!isPlaying && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    } catch { /* player not ready yet */ }
  }, [isPlaying]);

  const handleStop = () => {
    if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
      playerRef.current.stopVideo();
    }
    stop();
  };

  if (!currentVideoId) return <div id="yt-player" className="hidden" />;

  return (
    <>
      <div id="yt-player" className="hidden" />
      <AnimatePresence>
        <motion.div
          ref={containerRef}
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          className="fixed bottom-16 left-0 right-0 z-30 px-2"
        >
          <div className="max-w-lg mx-auto bg-surface-800/95 backdrop-blur-md border border-surface-700/50 rounded-2xl p-3 flex items-center gap-2 shadow-2xl touch-none">
            <button
              onClick={handleStop}
              className="p-1.5 text-surface-400 hover:text-surface-200 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
            {currentSong?.thumbnail && (
              <img
                src={currentSong.thumbnail}
                alt=""
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-100 truncate">
                {currentSong?.title ?? 'Playing...'}
              </p>
              <p className="text-xs text-surface-400 truncate">
                {currentSong?.primaryArtist}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setVolume(volume === 0 ? 70 : 0)}
                className="p-1.5 text-surface-400 hover:text-surface-200 transition-colors"
              >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="w-16 accent-accent-500 touch-none"
              />
              <button
                onClick={() => setPlaying(!isPlaying)}
                className="p-2 bg-accent-600 hover:bg-accent-500 rounded-full text-white transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
