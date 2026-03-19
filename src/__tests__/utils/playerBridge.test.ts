import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerPlayer,
  unregisterPlayer,
  getPlayer,
  loadVideoFromGesture,
  isGestureLoadPending,
  consumeGestureLoad,
  clearGestureLoad,
} from '@/utils/playerBridge';

// Mock YT.Player
function createMockPlayer(): YT.Player {
  return {
    loadVideoById: () => {},
    cueVideoById: () => {},
    playVideo: () => {},
    pauseVideo: () => {},
    stopVideo: () => {},
    seekTo: () => {},
    setVolume: () => {},
    getVolume: () => 70,
    mute: () => {},
    unMute: () => {},
    isMuted: () => false,
    getCurrentTime: () => 0,
    getDuration: () => 0,
    getPlayerState: () => -1,
    destroy: () => {},
  } as unknown as YT.Player;
}

describe('playerBridge', () => {
  beforeEach(() => {
    unregisterPlayer();
    clearGestureLoad();
  });

  describe('registerPlayer / unregisterPlayer / getPlayer', () => {
    it('starts with null player', () => {
      expect(getPlayer()).toBeNull();
    });

    it('registers a player', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      expect(getPlayer()).toBe(player);
    });

    it('unregisters a player', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      unregisterPlayer();
      expect(getPlayer()).toBeNull();
    });
  });

  describe('loadVideoFromGesture', () => {
    it('returns false when no player registered', () => {
      expect(loadVideoFromGesture('video123')).toBe(false);
    });

    it('returns true when player is registered', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      expect(loadVideoFromGesture('video123')).toBe(true);
    });

    it('sets gesture load pending', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      loadVideoFromGesture('video123');
      expect(isGestureLoadPending()).toBe(true);
    });

    it('calls loadVideoById when shouldPlay is true', () => {
      const player = createMockPlayer();
      const loadSpy = { called: false };
      const cueSpy = { called: false };
      player.loadVideoById = (() => { loadSpy.called = true; }) as unknown as typeof player.loadVideoById;
      player.cueVideoById = (() => { cueSpy.called = true; }) as unknown as typeof player.cueVideoById;
      registerPlayer(player);
      loadVideoFromGesture('video123', true);
      expect(loadSpy.called).toBe(true);
      expect(cueSpy.called).toBe(false);
    });

    it('calls cueVideoById when shouldPlay is false', () => {
      const player = createMockPlayer();
      const loadSpy = { called: false };
      const cueSpy = { called: false };
      player.loadVideoById = (() => { loadSpy.called = true; }) as unknown as typeof player.loadVideoById;
      player.cueVideoById = (() => { cueSpy.called = true; }) as unknown as typeof player.cueVideoById;
      registerPlayer(player);
      loadVideoFromGesture('video123', false);
      expect(loadSpy.called).toBe(false);
      expect(cueSpy.called).toBe(true);
    });
  });

  describe('consumeGestureLoad', () => {
    it('returns consumed: false when no pending load', () => {
      const result = consumeGestureLoad('video123');
      expect(result.consumed).toBe(false);
    });

    it('returns consumed: true when matching video', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      loadVideoFromGesture('video123', true);

      const result = consumeGestureLoad('video123');
      expect(result.consumed).toBe(true);
      expect(result.shouldPlay).toBe(true);
    });

    it('returns consumed: false when non-matching video', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      loadVideoFromGesture('video123');

      const result = consumeGestureLoad('different');
      expect(result.consumed).toBe(false);
    });

    it('clears pending state after consumption', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      loadVideoFromGesture('video123');
      consumeGestureLoad('video123');
      expect(isGestureLoadPending()).toBe(false);
    });
  });

  describe('clearGestureLoad', () => {
    it('clears pending gesture load', () => {
      const player = createMockPlayer();
      registerPlayer(player);
      loadVideoFromGesture('video123');
      expect(isGestureLoadPending()).toBe(true);
      clearGestureLoad();
      expect(isGestureLoadPending()).toBe(false);
    });
  });
});
