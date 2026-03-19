/**
 * iOS PWA Background Audio Keep-Alive
 *
 * Problem: iOS WebKit suspends standalone PWA processes on lock/background,
 * stopping audio playback. The YouTube iframe (cross-origin, sandboxed)
 * gets suspended along with the main process.
 *
 * Solution: A native <audio> element playing looped silence at volume 0.
 * iOS grants "active audio hardware session" status to apps with a playing
 * <audio> element, which prevents full process suspension on iOS 15.4+.
 * This is the maximum achievable from web code — it significantly improves
 * background/lock-screen playback continuity.
 *
 * Must be started from a user gesture (play button tap) to work on iOS.
 */

let audioCtx: AudioContext | null = null;
let sourceNode: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let audioElement: HTMLAudioElement | null = null;
let objectUrl: string | null = null;

/** Build a 1-second silent WAV blob using Web Audio API's OfflineAudioContext */
async function buildSilentBlob(): Promise<Blob> {
  const sampleRate = 22050;
  const duration = 1; // seconds
  const offline = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
  const buffer = offline.createBuffer(1, sampleRate * duration, sampleRate);
  // Buffer is already all zeros (silence)
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);
  const rendered = await offline.startRendering();
  // Convert AudioBuffer to WAV blob
  return audioBufferToWavBlob(rendered);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const byteRate = sampleRate * numChannels * 2; // 16-bit
  const blockAlign = numChannels * 2;
  const dataSize = samples.length * 2;
  const fileSize = 36 + dataSize;

  const arrayBuf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuf);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  // PCM samples (all zeros = silence)
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, 0, true);
  }

  return new Blob([arrayBuf], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Start the silent audio keep-alive.
 * Must be called from within a user gesture handler (e.g. play button click).
 */
export async function startSilentAudio(): Promise<void> {
  if (audioElement && !audioElement.paused) return; // already running

  try {
    // Build silent blob if needed
    if (!objectUrl) {
      const blob = await buildSilentBlob();
      objectUrl = URL.createObjectURL(blob);
    }

    if (!audioElement) {
      audioElement = new Audio();
      audioElement.src = objectUrl;
      audioElement.loop = true;
      audioElement.volume = 0;
      // NOT muted — muted audio doesn't claim iOS audio session
      // Volume 0 is different from muted and still claims the session
    }

    await audioElement.play();
  } catch {
    // Silently ignore — best effort only
  }
}

/**
 * Stop the silent audio keep-alive (when user explicitly stops playback).
 */
export function stopSilentAudio(): void {
  if (audioElement && !audioElement.paused) {
    audioElement.pause();
  }
}

/**
 * Resume silent audio after coming back from background/lock screen.
 * iOS may have paused the element even while it was "active".
 */
export async function resumeSilentAudio(): Promise<void> {
  if (!audioElement) return;
  if (audioElement.paused) {
    try {
      await audioElement.play();
    } catch {
      // ignore
    }
  }
}
