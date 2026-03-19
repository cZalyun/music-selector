import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Play,
  Pause,
  X,
  Repeat,
  Repeat1,
  Shuffle,
  SkipForward,
  Volume2,
  VolumeX,
  ExternalLink,
  Music,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlayerStore } from '@/store/playerStore';
import { useSongStore } from '@/store/songStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useToastStore } from '@/store/toastStore';
import { getThumbnailUrl, getFallbackThumbnail } from '@/utils/thumbnail';
import { formatTime } from '@/utils/format';
import {
  registerPlayer,
  unregisterPlayer,
  consumeGestureLoad,
  isGestureLoadPending,
  loadVideoFromGesture,
  setPreWarmed,
} from '@/utils/playerBridge';
import {
  PROGRESS_POLL_MS,
  AUTOPLAY_TIMEOUT_MS,
  DEFAULT_VOLUME,
} from '@/constants';
import { startSilentAudio, stopSilentAudio, resumeSilentAudio } from '@/utils/silentAudio';
import { useLocation } from 'react-router-dom';

let ytApiLoaded = false;
let ytApiLoading = false;

function loadYTApi(): Promise<void> {
  if (ytApiLoaded) return Promise.resolve();
  if (ytApiLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (ytApiLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }
  ytApiLoading = true;
  return new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);
    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      ytApiLoading = false;
      resolve();
    };
  });
}

export function MiniPlayer() {
  const { t } = useTranslation();
  const location = useLocation();
  const isSwipePage = location.pathname === '/swipe';

  const currentVideoId = usePlayerStore((s) => s.currentVideoId);
  const currentSongIndex = usePlayerStore((s) => s.currentSongIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);
  const stop = usePlayerStore((s) => s.stop);

  const songs = useSongStore((s) => s.songs);
  const loopMode = useSettingsStore((s) => s.loopMode);
  const autoContinue = useSettingsStore((s) => s.autoContinue);
  const shufflePlayback = useSettingsStore((s) => s.shufflePlayback);
  const autoplay = useSettingsStore((s) => s.autoplay);
  const cycleLoopMode = useSettingsStore((s) => s.cycleLoopMode);
  const toggleAutoContinue = useSettingsStore((s) => s.toggleAutoContinue);
  const toggleShufflePlayback = useSettingsStore((s) => s.toggleShufflePlayback);
  const addToast = useToastStore((s) => s.addToast);

  const playerRef = useRef<YT.Player | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingRef = useRef(false);
  const autoplayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs to hold current settings so YT event callbacks always read fresh values
  const autoContinueRef = useRef(autoContinue);
  autoContinueRef.current = autoContinue;
  const loopModeRef = useRef(loopMode);
  loopModeRef.current = loopMode;
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;
  const isSwipePageRef = useRef(isSwipePage);
  isSwipePageRef.current = isSwipePage;
  const playAdjacentRef = useRef<(direction: 1 | -1) => void>(() => {});

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [showTapToPlay, setShowTapToPlay] = useState(false);

  const currentSong = currentSongIndex !== null ? songs.find((s) => s.index === currentSongIndex) ?? null : null;

  // Update media session metadata
  useEffect(() => {
    if (!currentSong || !('mediaSession' in navigator)) return;

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

  // Media session action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ['play', () => {
        playerRef.current?.playVideo();
        startSilentAudio();
        setPlaying(true);
      }],
      ['pause', () => {
        playerRef.current?.pauseVideo();
        stopSilentAudio();
        setPlaying(false);
      }],
      ['nexttrack', () => playAdjacentSong(1)],
      ['previoustrack', () => playAdjacentSong(-1)],
      ['seekto', (details) => {
        if (details.seekTime !== undefined && playerRef.current) {
          try {
            playerRef.current.seekTo(details.seekTime, true);
            setProgress(details.seekTime);
          } catch { /* ignore */ }
        }
      }],
    ];

    handlers.forEach(([action, handler]) => {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* unsupported */ }
    });

    return () => {
      handlers.forEach(([action]) => {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* unsupported */ }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongIndex, songs]);

  // Update media session playback state + position
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    if (duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(progress, duration),
        });
      } catch { /* unsupported on older browsers */ }
    }
  }, [isPlaying, progress, duration]);

  // Track whether we were playing before backgrounding so we can resume on unlock
  const wasPlayingRef = useRef(false);

  // Visibility change: resume audio after lock screen / background
  useEffect(() => {
    const handler = async () => {
      if (document.visibilityState === 'hidden') {
        // Snapshot playing state before iOS suspends
        wasPlayingRef.current = usePlayerStore.getState().isPlaying;
      } else {
        // Coming back to foreground / screen unlock
        await resumeSilentAudio();
        if (wasPlayingRef.current && playerRef.current) {
          try {
            const state = playerRef.current.getPlayerState();
            // iOS may have paused the YT player — resume it
            if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.UNSTARTED || state === -1) {
              playerRef.current.playVideo();
            }
            setProgress(playerRef.current.getCurrentTime());
            setDuration(playerRef.current.getDuration());
          } catch { /* player may be in bad state */ }
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const playAdjacentSong = useCallback((direction: 1 | -1): void => {
    if (currentSongIndex === null || songs.length === 0) return;

    let nextSong;
    if (shufflePlayback) {
      const randomPos = Math.floor(Math.random() * songs.length);
      nextSong = songs[randomPos];
    } else {
      const currentPos = songs.findIndex((s) => s.index === currentSongIndex);
      if (currentPos === -1) return;
      let nextPos = currentPos + direction;
      if (nextPos >= songs.length) nextPos = 0;
      if (nextPos < 0) nextPos = songs.length - 1;
      nextSong = songs[nextPos];
    }

    if (nextSong) {
      loadVideoFromGesture(nextSong.videoId, true);
      setCurrentSong(nextSong.videoId, nextSong.index, true);
    }
  }, [currentSongIndex, songs, shufflePlayback, setCurrentSong]);

  // Keep ref in sync so stale YT event closures read fresh function
  playAdjacentRef.current = playAdjacentSong;

  // Initialize/update YT player
  useEffect(() => {
    if (!currentVideoId) return;

    const gestureResult = consumeGestureLoad(currentVideoId);
    if (gestureResult.consumed) {
      loadingRef.current = false;
      setPreWarmed();
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    const initPlayer = async () => {
      await loadYTApi();

      if (playerRef.current) {
        try {
          if (autoplayRef.current) {
            playerRef.current.loadVideoById(currentVideoId);
          } else {
            playerRef.current.cueVideoById(currentVideoId);
          }
        } catch { /* ignore */ }
        loadingRef.current = false;
        return;
      }

      const player = new window.YT.Player('yt-player', {
        height: '1',
        width: '1',
        videoId: currentVideoId,
        playerVars: {
          autoplay: autoplayRef.current ? 1 : 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            playerRef.current = event.target;
            registerPlayer(event.target);
            event.target.setVolume(volume);
            setPreWarmed();
            loadingRef.current = false;
          },
          onStateChange: handleStateChange,
          onError: handleError,
        },
      });

      playerRef.current = player;
    };

    initPlayer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoId]);

  // Volume sync
  useEffect(() => {
    if (playerRef.current) {
      try { playerRef.current.setVolume(volume); } catch { /* ignore */ }
    }
  }, [volume]);

  // Progress polling
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (isPlaying && playerRef.current) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current && !seeking) {
          try {
            setProgress(playerRef.current.getCurrentTime());
            setDuration(playerRef.current.getDuration());
          } catch { /* ignore */ }
        }
      }, PROGRESS_POLL_MS);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isPlaying, seeking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (autoplayTimeoutRef.current) clearTimeout(autoplayTimeoutRef.current);
      if (playerRef.current) {
        unregisterPlayer();
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
  }, []);

  function handleStateChange(event: YT.PlayerEvent) {
    const state = event.data;

    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }

    if (state === YT.PlayerState.PLAYING) {
      setPlaying(true);
      setShowTapToPlay(false);
      startSilentAudio(); // claim iOS audio hardware session
      try {
        setDuration(event.target.getDuration());
      } catch { /* ignore */ }
    } else if (state === YT.PlayerState.PAUSED) {
      if (!isGestureLoadPending()) {
        setPlaying(false);
        stopSilentAudio();
      }
    } else if (state === YT.PlayerState.ENDED) {
      handleSongEnded();
    } else if (state === YT.PlayerState.UNSTARTED || state === YT.PlayerState.CUED) {
      // Autoplay may have been blocked
      autoplayTimeoutRef.current = setTimeout(() => {
        if (playerRef.current) {
          const playerState = playerRef.current.getPlayerState();
          if (playerState === YT.PlayerState.UNSTARTED || playerState === YT.PlayerState.CUED) {
            setPlaying(false);
            setShowTapToPlay(true);
          }
        }
      }, AUTOPLAY_TIMEOUT_MS);
    }
  }

  function handleError(event: YT.PlayerEvent) {
    const code = event.data;
    if (code === 100 || code === 101 || code === 150) {
      addToast(t('player.videoUnavailable'), 'error');
    } else {
      addToast(t('player.videoError'), 'error');
    }
    // On swipe page: never auto-advance, just stop
    if (isSwipePageRef.current) {
      setPlaying(false);
      return;
    }
    if (autoContinueRef.current) {
      setTimeout(() => playAdjacentRef.current(1), 500);
    }
  }

  function handleSongEnded() {
    // On swipe page: play the song once and stop, ignore all playback settings
    if (isSwipePageRef.current) {
      setPlaying(false);
      return;
    }
    // Other pages: respect playback settings
    const currentLoopMode = loopModeRef.current;
    const currentAutoContinue = autoContinueRef.current;
    if (currentLoopMode === 'one') {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
    } else if (currentAutoContinue || currentLoopMode === 'all') {
      playAdjacentRef.current(1);
    } else {
      setPlaying(false);
    }
  }

  function togglePlay() {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setPlaying(false);
    } else {
      playerRef.current.playVideo();
      setPlaying(true);
      setShowTapToPlay(false);
    }
  }

  function handleStop() {
    if (playerRef.current) {
      try { playerRef.current.stopVideo(); } catch { /* ignore */ }
    }
    stopSilentAudio();
    stop();
    setProgress(0);
    setDuration(0);
    setShowTapToPlay(false);
  }

  function handleSeekChange(value: number) {
    setSeeking(true);
    setSeekValue(value);
  }

  function commitSeek() {
    if (playerRef.current) {
      playerRef.current.seekTo(seekValue, true);
    }
    setProgress(seekValue);
    setSeeking(false);
  }

  const loopLabel = t(`player.loop.${loopMode}`);

  const isVisible = !!(currentVideoId && currentSong);

  return (
    <>
      <div id="yt-player" className="fixed -top-[9999px] -left-[9999px] w-px h-px overflow-hidden" />

      <AnimatePresence>
        {isVisible && <motion.div
          key="miniplayer"
          className="fixed left-0 right-0 z-30 bg-surface-900/95 backdrop-blur-sm border-t border-surface-700"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="max-w-lg mx-auto px-3 py-2">
            {/* Song info row */}
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleStop}
                className="p-2.5 -ml-1 text-surface-400 hover:text-surface-200 transition-colors"
                aria-label={t('player.stop')}
              >
                <X size={18} />
              </button>
              <MiniPlayerThumbnail
                thumbnail={currentSong.thumbnail}
                videoId={currentSong.videoId}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-100 truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-surface-400 truncate">
                  {currentSong.primaryArtist}
                </p>
              </div>

              {/* Tap to play overlay */}
              {showTapToPlay && (
                <button
                  onClick={togglePlay}
                  className="text-xs text-accent-400 font-medium animate-pulse"
                  aria-label={t('player.tapToPlay')}
                >
                  {t('player.tapToPlay')}
                </button>
              )}

              {/* Controls */}
              <button
                onClick={togglePlay}
                className="p-2 text-surface-200 hover:text-white transition-colors"
                aria-label={isPlaying ? t('player.pause') : t('player.play')}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </div>

            {/* Seek bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-surface-500 w-8 text-right tabular-nums">
                {formatTime(seeking ? seekValue : progress)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={seeking ? seekValue : progress}
                onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
                onMouseUp={commitSeek}
                onTouchStart={(e) => { e.stopPropagation(); setSeeking(true); }}
                onTouchEnd={commitSeek}
                className="flex-1 h-1 accent-accent-500 cursor-pointer touch-none"
                aria-label="Seek"
              />
              <span className="text-[10px] text-surface-500 w-8 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Extended controls (hidden on swipe page) */}
            {!isSwipePage && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={cycleLoopMode}
                    className={`p-1.5 transition-colors ${
                      loopMode !== 'off' ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'
                    }`}
                    aria-label={loopLabel}
                    title={loopLabel}
                  >
                    {loopMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                  </button>
                  <button
                    onClick={toggleAutoContinue}
                    className={`p-1.5 transition-colors ${
                      autoContinue ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'
                    }`}
                    aria-label={t('player.autoContinue')}
                    title={t('player.autoContinue')}
                  >
                    <SkipForward size={14} />
                  </button>
                  <button
                    onClick={toggleShufflePlayback}
                    className={`p-1.5 transition-colors ${
                      shufflePlayback ? 'text-accent-400' : 'text-surface-500 hover:text-surface-300'
                    }`}
                    aria-label={t('player.shuffle')}
                    title={t('player.shuffle')}
                  >
                    <Shuffle size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {/* YouTube link */}
                  {currentSong.youtubeWatchUrl && (
                    <a
                      href={currentSong.youtubeWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-surface-500 hover:text-surface-300 transition-colors"
                      aria-label={t('player.openOnYoutube')}
                      title={t('player.openOnYoutube')}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {/* Volume (desktop only) */}
                  <button
                    onClick={() => setVolume(volume === 0 ? DEFAULT_VOLUME : 0)}
                    className="hidden sm:block p-1.5 text-surface-500 hover:text-surface-300 transition-colors"
                    aria-label={volume === 0 ? t('player.unmute') : t('player.mute')}
                  >
                    {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="hidden sm:block w-14 h-1 accent-accent-500 cursor-pointer touch-none"
                    aria-label={t('player.volume')}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}

function MiniPlayerThumbnail({ thumbnail, videoId }: { thumbnail?: string; videoId: string }) {
  const [stage, setStage] = useState(0);
  const src = stage === 0
    ? getThumbnailUrl(thumbnail, 'small')
    : stage === 1
      ? getFallbackThumbnail(videoId, 'small')
      : '';

  if (!src || stage >= 2) {
    return (
      <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center shrink-0">
        <Music size={18} className="text-surface-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="w-10 h-10 rounded-lg object-cover bg-surface-700 shrink-0"
      loading="eager"
      onError={() => setStage((s) => s + 1)}
    />
  );
}
