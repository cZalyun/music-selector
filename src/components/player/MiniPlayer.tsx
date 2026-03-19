import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X, Repeat, Repeat1, ListMusic, Shuffle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePlayerStore } from '../../store/playerStore';
import { useSongStore } from '../../store/songStore';
import { useSettingsStore } from '../../store/settingsStore';
import { registerPlayer, unregisterPlayer } from '../../utils/playerBridge';
import { getThumbnailUrl } from '../../utils/thumbnail';

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

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MiniPlayer() {
  const { currentVideoId, currentSongIndex, isPlaying, volume, setPlaying, setVolume, setCurrentSong, stop } = usePlayerStore();
  const songs = useSongStore((s) => s.songs);
  const { loopMode: _loopMode, autoContinue: _autoContinue, shufflePlayback: _shufflePlayback, cycleLoopMode, toggleAutoContinue, toggleShufflePlayback } = useSettingsStore();
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeVideoRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  // True once the player has EVER reached PLAYING state (iOS is then unlocked)
  const playerActivatedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSongEndRef = useRef<() => void>(() => {});

  const location = useLocation();
  const isSwipePage = location.pathname === '/swipe';
  const currentSong = songs.find((s) => s.index === currentSongIndex);

  // Media Session API for lock screen controls and background playback
  const updateMediaSession = useCallback(() => {
    if (!navigator.mediaSession || !currentSong) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.primaryArtist,
      album: currentSong.album || undefined,
      artwork: [
        { src: getThumbnailUrl(currentSong.thumbnail, 'small'), sizes: '96x96', type: 'image/jpeg' },
        { src: getThumbnailUrl(currentSong.thumbnail, 'small'), sizes: '192x192', type: 'image/jpeg' },
        { src: getThumbnailUrl(currentSong.thumbnail, 'large'), sizes: '512x512', type: 'image/jpeg' },
      ],
    });
  }, [currentSong]);

  useEffect(() => {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      // Find next song in library order
      const nextIndex = (currentSongIndex ?? -1) + 1;
      const nextSong = songs.find((s) => s.index === nextIndex);
      if (nextSong) {
        setCurrentSong(nextSong.videoId, nextSong.index);
      }
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const prevIndex = (currentSongIndex ?? 0) - 1;
      const prevSong = songs.find((s) => s.index === prevIndex);
      if (prevSong) {
        setCurrentSong(prevSong.videoId, prevSong.index);
      }
    });
    return () => {
      if (navigator.mediaSession) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
      }
    };
  }, [currentSongIndex, songs, setCurrentSong, setPlaying]);

  // On swipe page, force these off programmatically
  const loopMode = isSwipePage ? 'off' as const : _loopMode;
  const autoContinue = isSwipePage ? false : _autoContinue;
  const shufflePlayback = isSwipePage ? false : _shufflePlayback;

  // Progress polling
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (isPlaying && playerRef.current) {
      progressInterval.current = setInterval(() => {
        if (!playerRef.current || seeking) return;
        try {
          const t = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration();
          setProgress(t);
          if (d > 0) setDuration(d);
        } catch { /* player not ready */ }
      }, 500);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, currentVideoId, seeking]);

  const handleSongEnd = useCallback(() => {
    // Loop one: replay the same song
    if (loopMode === 'one') {
      try { playerRef.current?.seekTo(0, true); playerRef.current?.playVideo(); } catch { /* */ }
      return;
    }

    // Auto-continue or loop all: go to next song
    if (autoContinue || loopMode === 'all') {
      const playableSongs = songs.filter((s) => s.videoId);
      if (playableSongs.length === 0) { setPlaying(false); return; }

      const currentIdx = playableSongs.findIndex((s) => s.index === currentSongIndex);
      let nextSong;

      if (shufflePlayback) {
        const others = playableSongs.filter((_, i) => i !== currentIdx);
        nextSong = others.length > 0
          ? others[Math.floor(Math.random() * others.length)]
          : playableSongs[0];
      } else {
        const nextIdx = currentIdx + 1;
        if (nextIdx < playableSongs.length) {
          nextSong = playableSongs[nextIdx];
        } else if (loopMode === 'all') {
          nextSong = playableSongs[0]; // wrap around
        }
      }

      if (nextSong) {
        setCurrentSong(nextSong.videoId, nextSong.index, true);
      } else {
        setPlaying(false);
      }
      return;
    }

    setPlaying(false);
  }, [loopMode, autoContinue, shufflePlayback, songs, currentSongIndex, setPlaying, setCurrentSong]);

  // Keep ref in sync so the YT player callback always calls the latest version
  useEffect(() => {
    handleSongEndRef.current = handleSongEnd;
  }, [handleSongEnd]);

  const initPlayer = useCallback(async (videoId: string, shouldPlay: boolean) => {
    activeVideoRef.current = videoId;
    loadingRef.current = true;
    setProgress(0);
    setDuration(0);

    await loadYouTubeAPI();

    // If the video changed while we were loading the API, bail out
    if (activeVideoRef.current !== videoId) return;

    if (playerRef.current) {
      console.log('[MiniPlayer] Loading new video:', { videoId, shouldPlay });
      if (shouldPlay) {
        // On desktop, loadVideoById works fine
        // On mobile, this might be blocked but that's OK - the user will tap play
        console.log('[MiniPlayer] Calling loadVideoById for autoplay');
        playerRef.current.loadVideoById(videoId);
      } else {
        console.log('[MiniPlayer] Calling cueVideoById (no autoplay)');
        playerRef.current.cueVideoById(videoId);
      }
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
          registerPlayer(playerRef.current!);
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          console.log('[MiniPlayer] YT state change:', { state: event.data, videoId: activeVideoRef.current });
          if (event.data === window.YT.PlayerState.PLAYING) {
            loadingRef.current = false;
            playerActivatedRef.current = true;
            console.log('[MiniPlayer] YT is PLAYING, calling setPlaying(true)');
            setPlaying(true);
            updateMediaSession();
            if (navigator.mediaSession) {
              navigator.mediaSession.playbackState = 'playing';
            }
            try {
              const d = playerRef.current?.getDuration();
              if (d && d > 0) setDuration(d);
            } catch { /* */ }
            return;
          }
          if (event.data === window.YT.PlayerState.CUED) {
            loadingRef.current = false;
            try {
              const d = playerRef.current?.getDuration();
              if (d && d > 0) setDuration(d);
            } catch { /* */ }
            return;
          }
          if (loadingRef.current) {
            if (event.data === window.YT.PlayerState.PAUSED) {
              if (playerActivatedRef.current) {
                // Player already unlocked by a prior user gesture.
                // iOS pauses after loadVideoById — just resume, it will work.
                try { playerRef.current?.playVideo(); } catch { /* */ }
              } else {
                // First-ever load: detect if autoplay was blocked
                setTimeout(() => {
                  if (!playerRef.current) return;
                  try {
                    const s = playerRef.current.getPlayerState();
                    if (s !== window.YT.PlayerState.PLAYING && s !== window.YT.PlayerState.BUFFERING) {
                      loadingRef.current = false;
                      setPlaying(false);
                    }
                  } catch { /* */ }
                }, 600);
              }
            }
            return;
          }
          if (event.data === window.YT.PlayerState.ENDED) {
            handleSongEndRef.current();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            console.log('[MiniPlayer] YT is PAUSED, calling setPlaying(false)');
            setPlaying(false);
            if (navigator.mediaSession) {
              navigator.mediaSession.playbackState = 'paused';
            }
          }
        },
      },
    });
  }, [setPlaying, handleSongEnd]);

  useEffect(() => {
    if (currentVideoId) {
      // Read isPlaying directly from store to avoid stale closure
      const currentPlayState = usePlayerStore.getState().isPlaying;
      console.log('[MiniPlayer] useEffect triggered:', { currentVideoId, currentPlayState });
      initPlayer(currentVideoId, currentPlayState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoId]);

  useEffect(() => {
    console.log('[MiniPlayer] isPlaying effect triggered:', { isPlaying, currentVideoId });
    if (!playerRef.current) return;
    try {
      if (isPlaying && typeof playerRef.current.playVideo === 'function') {
        console.log('[MiniPlayer] Calling playVideo()');
        playerRef.current.playVideo();
      } else if (!isPlaying && typeof playerRef.current.pauseVideo === 'function') {
        console.log('[MiniPlayer] Calling pauseVideo()');
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error('[MiniPlayer] Error calling play/pause:', e);
    }
  }, [isPlaying]);

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
    unregisterPlayer();
    stop();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setProgress(t);
  };

  const commitSeek = () => {
    setSeeking(false);
    if (playerRef.current) {
      try { playerRef.current.seekTo(progress, true); } catch { /* */ }
    }
  };

  if (!currentVideoId) return <div id="yt-player" className="hidden" />;

  const loopIcon = loopMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />;
  const loopActive = loopMode !== 'off';

  return (
    <>
      <div id="yt-player" className="hidden" />
      <AnimatePresence>
        <motion.div
          ref={containerRef}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed left-0 right-0 z-30 px-2"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-lg mx-auto bg-surface-800/95 backdrop-blur-md border border-surface-700/50 rounded-2xl shadow-2xl touch-none overflow-hidden">
            {/* Seek bar */}
            <div className="px-3 pt-2 pb-0">
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.5}
                value={progress}
                onChange={handleSeek}
                onMouseDown={() => setSeeking(true)}
                onMouseUp={() => commitSeek()}
                onTouchStart={(e) => { e.stopPropagation(); setSeeking(true); }}
                onTouchEnd={() => commitSeek()}
                className="w-full h-1 accent-accent-500 touch-none cursor-pointer"
                style={{ WebkitAppearance: 'none', appearance: 'none' }}
              />
              <div className="flex justify-between text-[9px] text-surface-500 mt-0.5">
                <span>{formatTime(progress)}</span>
                <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
              </div>
            </div>

            {/* Main controls row */}
            <div className="px-3 pb-2.5 pt-1 flex items-center gap-2">
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
              <div className="flex items-center gap-1 shrink-0">
                {!isSwipePage && (
                  <>
                    <button
                      onClick={cycleLoopMode}
                      className={`p-1.5 rounded transition-colors ${loopActive ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'}`}
                      title={`Loop: ${loopMode}`}
                    >
                      {loopIcon}
                    </button>
                    <button
                      onClick={toggleAutoContinue}
                      className={`p-1.5 rounded transition-colors ${autoContinue ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'}`}
                      title={`Auto-continue: ${autoContinue ? 'on' : 'off'}`}
                    >
                      <ListMusic size={14} />
                    </button>
                    <button
                      onClick={toggleShufflePlayback}
                      className={`p-1.5 rounded transition-colors ${shufflePlayback ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'}`}
                      title={`Shuffle: ${shufflePlayback ? 'on' : 'off'}`}
                    >
                      <Shuffle size={14} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setVolume(volume === 0 ? 70 : 0)}
                  className="hidden sm:block p-1.5 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  className="hidden sm:block w-14 accent-accent-500 touch-none"
                />
                <button
                  onClick={() => setPlaying(!isPlaying)}
                  className="p-2 bg-accent-600 hover:bg-accent-500 rounded-full text-white transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
