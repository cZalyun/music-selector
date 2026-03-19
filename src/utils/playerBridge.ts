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
 * Call from a direct user gesture (click/swipe) to unmute the player.
 * Safe to call even if player doesn't exist yet - it's a no-op in that case.
 * Returns true if unmute was performed.
 */
export function unmutePlayer(): boolean {
  if (ytPlayer) {
    try {
      (ytPlayer as any).unMute();
      ytPlayer.setVolume(100);
      console.log('[playerBridge] Player unmuted via user gesture');
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Call from a direct user gesture (click / swipe) to load a video.
 * Returns true if the player was available and the call was made.
 */
export function loadVideoFromGesture(videoId: string, shouldPlay: boolean = true): boolean {
  const isMobile = window.matchMedia('(max-width: 639px)').matches;
  console.log('[playerBridge] loadVideoFromGesture called:', { videoId, shouldPlay, isMobile });
  
  // On desktop, don't use gesture bridge - let normal flow handle it
  if (!isMobile) {
    console.log('[playerBridge] Desktop detected, skipping gesture bridge');
    return false;
  }
  
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById(videoId);
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
