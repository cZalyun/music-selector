import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useSongStore } from '../../store/songStore';
import { useSettingsStore } from '../../store/settingsStore';
import { registerPlayer, unregisterPlayer, consumeGestureLoad } from '../../utils/playerBridge';
import { Play, Pause, Volume2, VolumeX, Square } from 'lucide-react';
import { useYouTubeIframeAPI } from '../../hooks/useYouTubeIframeAPI';
import { AnimatePresence, motion } from 'framer-motion';

export default function MiniPlayer() {
  const isYouTubeAPIReady = useYouTubeIframeAPI();
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<number | null>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  
  const { currentVideoId, currentSongIndex, isPlaying, volume, setCurrentSong, setPlaying, setVolume, stop } = usePlayerStore();
  const { songs } = useSongStore();
  const { loopMode, autoContinue, shufflePlayback } = useSettingsStore();
  
  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null;

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Setup Player
  useEffect(() => {
    if (!isYouTubeAPIReady || !containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          registerPlayer(event.target);
          event.target.setVolume(volume);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setPlaying(true);
            setDuration(event.target.getDuration());
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            // Check if this pause is just a transition between songs triggered by gesture
            if (!currentVideoId) {
                setPlaying(false);
            }
          } else if (event.data === window.YT.PlayerState.ENDED) {
            handleSongEnd();
          }
        },
        onError: (event) => {
          console.error('YouTube Player Error:', event.data);
          // Auto-advance on error
          handleSongEnd();
        }
      }
    });

    return () => {
      unregisterPlayer();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isYouTubeAPIReady]); // Only run once when API is ready

  const handleSongEnd = useCallback(() => {
    if (!currentSong) return;

    if (loopMode === 'one') {
      playerRef.current?.seekTo(0, true);
      playerRef.current?.playVideo();
    } else if (autoContinue) {
      let nextIndex = currentSongIndex! + 1;
      
      if (shufflePlayback) {
        nextIndex = Math.floor(Math.random() * songs.length);
      } else if (nextIndex >= songs.length) {
        if (loopMode === 'all') {
          nextIndex = 0;
        } else {
          stop();
          return;
        }
      }
      
      const nextSong = songs[nextIndex];
      setCurrentSong(nextSong.videoId, nextIndex, true);
    } else {
      stop();
    }
  }, [currentSong, currentSongIndex, songs, loopMode, autoContinue, shufflePlayback, setCurrentSong, stop]);

  // Handle current video changes
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.loadVideoById !== 'function') return;
    
    if (currentVideoId) {
      const { consumed, shouldPlay } = consumeGestureLoad(currentVideoId);
      
      if (!consumed) {
         playerRef.current.loadVideoById(currentVideoId);
         if (isPlaying) {
             playerRef.current.playVideo();
         }
      } else {
          // If gesture load was consumed, state might need aligning
          if (shouldPlay && !isPlaying) {
              setPlaying(true);
          }
      }
    } else {
      playerRef.current.stopVideo();
    }
  }, [currentVideoId]);

  // Handle play/pause state
  useEffect(() => {
    if (!playerRef.current || !currentVideoId) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Progress polling
  useEffect(() => {
    const updateProgress = () => {
      if (playerRef.current && isPlaying && !isSeeking) {
        try {
          const time = playerRef.current.getCurrentTime();
          if (time !== undefined) {
             setCurrentTime(time);
          }
        } catch(e) {}
      }
    };

    if (isPlaying) {
      progressInterval.current = window.setInterval(updateProgress, 500);
    } else if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, isSeeking]);

  // Resync on visibility change (for background playback)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && playerRef.current) {
        try {
           setCurrentTime(playerRef.current.getCurrentTime() || 0);
           setDuration(playerRef.current.getDuration() || 0);
        } catch(e) {}
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Media Session API for lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.primaryArtist,
        album: currentSong.album || undefined,
        artwork: [
          { src: currentSong.thumbnail, sizes: '96x96', type: 'image/jpeg' },
          { src: currentSong.thumbnail, sizes: '192x192', type: 'image/jpeg' },
          { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
         let nextIndex = currentSongIndex! + 1;
         if (nextIndex >= songs.length) nextIndex = 0;
         setCurrentSong(songs[nextIndex].videoId, nextIndex, true);
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
         let prevIndex = currentSongIndex! - 1;
         if (prevIndex < 0) prevIndex = songs.length - 1;
         setCurrentSong(songs[prevIndex].videoId, prevIndex, true);
      });
    }
  }, [currentSong, currentSongIndex, songs, setCurrentSong, setPlaying]);

  useEffect(() => {
      if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      }
  }, [isPlaying]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSeekValue(Number(e.target.value));
  };

  const handleSeekCommit = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(seekValue, true);
      setCurrentTime(seekValue);
    }
    setIsSeeking(false);
  };

  if (!currentSong) {
      return <div ref={containerRef} className="hidden" />;
  }

  return (
    <>
      <div ref={containerRef} className="hidden" />
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-surface-100 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 shadow-lg"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }} // Above BottomNav
        >
          <div className="mx-auto max-w-lg p-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
              <span className="w-10 text-right">{formatTime(isSeeking ? seekValue : currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={isSeeking ? seekValue : currentTime}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="flex-1 h-1 bg-surface-300 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <span className="w-10">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              {/* Song Info */}
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <img 
                  src={currentSong.thumbnail} 
                  alt={currentSong.title} 
                  className="w-12 h-12 rounded object-cover flex-shrink-0 bg-surface-200 dark:bg-surface-800"
                />
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold truncate text-surface-900 dark:text-surface-50">
                    {currentSong.title}
                  </h3>
                  <p className="text-xs text-surface-500 truncate">
                    {currentSong.primaryArtist}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={() => setPlaying(!isPlaying)}
                  className="p-2 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors"
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>
                <button 
                  onClick={stop}
                  className="p-2 text-surface-500 hover:text-brand-500 transition-colors"
                >
                  <Square size={18} />
                </button>
                
                {/* Desktop Volume */}
                <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-surface-200 dark:border-surface-700">
                  <button onClick={() => setVolume(volume === 0 ? 70 : 0)} className="text-surface-500 hover:text-brand-500">
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-16 h-1 bg-surface-300 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
