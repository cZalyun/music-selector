/// <reference types="youtube" />

import { usePlayerStore } from '../store/playerStore';

// We keep a single global instance of the YouTube player
let ytPlayer: YT.Player | null = null;
let gestureVideoId: string | null = null;
let gestureShouldPlay: boolean = false;
let isPendingGestureLoad: boolean = false;
let safetyTimeout: number | null = null;

export function registerPlayer(player: YT.Player) {
  ytPlayer = player;
}

export function unregisterPlayer() {
  ytPlayer = null;
}

// Pre-warm the player on the first user interaction to unlock iOS Audio Context
export function preWarmPlayer() {
  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    // We attempt a silent play/pause cycle to initialize the audio context
    try {
      ytPlayer.playVideo();
      setTimeout(() => {
        if (usePlayerStore.getState().isPlaying === false) {
          ytPlayer?.pauseVideo();
        }
      }, 50);
    } catch (e) {
      console.warn('Failed to pre-warm player', e);
    }
  }
}

/**
 * Crucial for iOS: This MUST be called synchronously within a click/touch event handler.
 * It bypasses React state updates which would break the "user gesture" trust chain.
 */
export function loadVideoFromGesture(videoId: string, shouldPlay: boolean = true): boolean {
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById(videoId);
      
      if (shouldPlay) {
        ytPlayer.playVideo();
      } else {
        ytPlayer.cueVideoById(videoId);
      }
      
      gestureVideoId = videoId;
      gestureShouldPlay = shouldPlay;
      isPendingGestureLoad = true;
      
      // Safety timeout in case the video fails to load silently
      if (safetyTimeout) window.clearTimeout(safetyTimeout);
      safetyTimeout = window.setTimeout(() => {
        if (isPendingGestureLoad) {
          isPendingGestureLoad = false;
          usePlayerStore.getState().setPlaying(false);
        }
      }, 2000);
      
      return true;
    } catch (e) {
      console.error('Failed gesture load:', e);
      return false;
    }
  }
  return false;
}

export function isGestureLoadPending(): boolean {
  return isPendingGestureLoad;
}

export function consumeGestureLoad(videoId: string): { consumed: boolean; shouldPlay: boolean } {
  if (isPendingGestureLoad && gestureVideoId === videoId) {
    isPendingGestureLoad = false;
    if (safetyTimeout) window.clearTimeout(safetyTimeout);
    return { consumed: true, shouldPlay: gestureShouldPlay };
  }
  return { consumed: false, shouldPlay: false };
}
