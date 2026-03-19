/**
 * Bridge to call YouTube player methods directly from user gestures,
 * bypassing the React state → useEffect indirection that breaks
 * mobile autoplay policies.
 */

let ytPlayer: YT.Player | null = null;
let gestureVideoId: string | null = null;
let gestureShouldPlay: boolean = false;

export function registerPlayer(p: YT.Player) {
  ytPlayer = p;
}

export function unregisterPlayer() {
  ytPlayer = null;
}

/**
 * Call from a direct user gesture (click / swipe) to load a video.
 * Returns true if the player was available and the call was made.
 */
export function loadVideoFromGesture(videoId: string, shouldPlay: boolean = true): boolean {
  console.log('[playerBridge] loadVideoFromGesture called:', { videoId, shouldPlay });
  
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById(videoId);
      ytPlayer.playVideo(); // Force play to ensure audio context is active
      gestureVideoId = videoId;
      gestureShouldPlay = shouldPlay;
      console.log('[playerBridge] Gesture stored:', { gestureVideoId, gestureShouldPlay });
      return true;
    } catch {
      return false;
    }
  }
  console.log('[playerBridge] No player available');
  return false;
}

export function isGestureLoadPending(): boolean {
  return gestureVideoId !== null;
}

/**
 * Check (and consume) whether a video was already loaded via a gesture.
 * MiniPlayer calls this to avoid a redundant loadVideoById from useEffect.
 */
export function consumeGestureLoad(videoId: string): { consumed: boolean; shouldPlay: boolean } {
  console.log('[playerBridge] consumeGestureLoad called:', { videoId, gestureVideoId, gestureShouldPlay });
  if (gestureVideoId === videoId) {
    gestureVideoId = null;
    const shouldPlay = gestureShouldPlay;
    gestureShouldPlay = false;
    console.log('[playerBridge] Gesture consumed:', { consumed: true, shouldPlay });
    return { consumed: true, shouldPlay };
  }
  console.log('[playerBridge] No gesture to consume');
  return { consumed: false, shouldPlay: false };
}
