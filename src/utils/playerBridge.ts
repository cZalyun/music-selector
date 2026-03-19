let ytPlayer: YT.Player | null = null;
let gestureVideoId: string | null = null;
let gestureShouldPlay = true;
let preWarmed = false;

export function registerPlayer(player: YT.Player): void {
  ytPlayer = player;
}

export function unregisterPlayer(): void {
  ytPlayer = null;
}

export function getPlayer(): YT.Player | null {
  return ytPlayer;
}

export function loadVideoFromGesture(
  videoId: string,
  shouldPlay: boolean = true,
): boolean {
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      if (shouldPlay) {
        ytPlayer.loadVideoById(videoId);
      } else {
        ytPlayer.cueVideoById(videoId);
      }
      gestureVideoId = videoId;
      gestureShouldPlay = shouldPlay;
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function isGestureLoadPending(): boolean {
  return gestureVideoId !== null;
}

export function consumeGestureLoad(
  videoId: string,
): { consumed: boolean; shouldPlay: boolean } {
  if (gestureVideoId === videoId) {
    const shouldPlay = gestureShouldPlay;
    gestureVideoId = null;
    return { consumed: true, shouldPlay };
  }
  return { consumed: false, shouldPlay: true };
}

export function clearGestureLoad(): void {
  gestureVideoId = null;
}

export function isPreWarmed(): boolean {
  return preWarmed;
}

export function setPreWarmed(): void {
  preWarmed = true;
}

export function preWarmPlayer(): boolean {
  if (preWarmed || !ytPlayer) return false;
  try {
    ytPlayer.setVolume(0);
    ytPlayer.cueVideoById('dQw4w9WgXcQ');
    preWarmed = true;
    return true;
  } catch {
    return false;
  }
}
