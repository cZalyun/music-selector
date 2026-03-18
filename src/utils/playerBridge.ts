/**
 * Bridge to call YouTube player methods directly from user gestures,
 * bypassing the React state → useEffect indirection that breaks
 * mobile autoplay policies.
 */

let ytPlayer: YT.Player | null = null;
let gestureVideoId: string | null = null;

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
export function loadVideoFromGesture(videoId: string): boolean {
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById(videoId);
      gestureVideoId = videoId;
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Check (and consume) whether a video was already loaded via a gesture.
 * MiniPlayer calls this to avoid a redundant loadVideoById from useEffect.
 */
export function consumeGestureLoad(videoId: string): boolean {
  if (gestureVideoId === videoId) {
    gestureVideoId = null;
    return true;
  }
  return false;
}
