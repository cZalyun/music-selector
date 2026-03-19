setting:
auto continue: on
turbo mode: on
auto lint: on

context: 
    - existing project with one file: SAMPLE_DATA.csv

model: Claude Opus 4.6 Thinking 1M
mode: windsurf planning
mcps: []
prompt:
the most important thing is to verify that each feature will work properly e2e on each and all platform properly.
the code should be well structrured e2e using best practices and industry standard and clean code


# Music Selector — Feature Summary

**Music Selector** is a mobile-first Progressive Web App for reviewing, curating, and managing your YouTube Music liked songs library using a Tinder-style swipe interface.

---

## Core Features

### 📥 Data Import
- Upload a songs CSV via **drag-and-drop** or file picker
- Load **1,148 built-in sample songs** to try without any data
- **Bookmarklet** to scrape your YouTube Music liked songs page and auto-download a CSV with full metadata (title, artist, album, duration, video ID, thumbnail, explicit flag)

### 👆 Swipe Review
- **Swipe right** → Like, **swipe left** → Dislike, **swipe up** → Skip
- Button controls: Like / Dislike / Skip / Play-Pause / Undo
- Haptic feedback on every swipe (Android)
- **Undo** the last decision at any time
- Cards show: thumbnail, title, artist, album, duration, explicit badge
- Progress bar shows reviewed / total count and completion %

### 🎵 Music Player (MiniPlayer)
- Embedded **YouTube IFrame** player (audio-only style, invisible video)
- Play / Pause / Stop controls
- **Seek bar** with live time display
- **Volume slider** (desktop)
- **Loop modes**: Off / Repeat One / Repeat All
- **Auto-Continue**: automatically plays the next song when current ends
- **Shuffle Playback**: randomises next song selection
- **Lock screen / notification controls** via Media Session API (play, pause, next, previous) on iOS and Android

### 📚 Library
- Browse all songs with **live search** (title / artist / album)
- **Tab filters**: All / Liked / Disliked / Unreviewed (with counts)
- **Sort by**: Index / Title / Artist / Duration (ascending or descending)
- **Group by**: None / Artist / Album / Duration range / Status
- Collapsible group sections
- Tap any song to instantly play it
- Animated "now playing" indicator on active row
- Lazy-loaded thumbnails with fallback chain

### 📊 Stats & Settings
- Stats cards: Total / Liked / Disliked / Skipped counts
- Review completion % with animated progress bar
- Distribution bar (liked / disliked / skipped breakdown)
- **Top 5 Liked Artists** chart
- **Top 5 Liked Albums** chart
- Playback settings: Autoplay, Loop Mode, Auto-Continue, Shuffle, Hide Explicit

### 💾 Export & Data Management
- **Export liked songs** as CSV
- **Export all songs** as CSV
- **Full backup** as JSON (songs + all selections)
- **Restore** from a JSON backup file
- **Reset all data** with confirmation

### 📲 PWA / Install
- **Installable** on Android (native prompt) and iOS (manual "Add to Home Screen" guide)
- Works **offline** after first load (service worker caches all app assets)
- Thumbnails cached for **7 days** offline (up to 300 per CDN)
- Offline status **banner** when network is lost
- Auto-updates silently in the background

### 🔔 Notifications & Feedback
- **Toast notifications** (success / error / info) for all major actions
- Auto-dismiss after 3 seconds, manually dismissable

---

## Platform Support

| Platform | Install | Audio | Gestures | Lock Screen |
|---|---|---|---|---|
| **iOS Safari** | Manual guide | ✅ (via gesture unlock) | ✅ | ✅ iOS 15+ |
| **Android Chrome** | Native prompt | ✅ | ✅ + haptics | ✅ |
| **macOS Safari/Chrome** | Native prompt | ✅ | ✅ | ✅ |
| **Windows Chrome/Edge** | Native prompt | ✅ | ✅ | ✅ |
| **Desktop browsers** | In-browser | ✅ + volume UI | Mouse drag | ✅ |

---

## Technical Highlights
- **Notch / Dynamic Island / Home bar** fully handled via env(safe-area-inset-*) on every screen edge
- **100dvh** dynamic viewport height — adapts to iOS Safari toolbar show/hide
- **Gesture-safe autoplay** via playerBridge — direct YouTube API calls from within event handlers to bypass mobile autoplay blocking
- **Zustand** persistent state (songs, selections, settings survive page reload)
- **3-stage thumbnail fallback**: upgraded CDN URL → canonical YouTube URL → placeholder icon
- **Image concurrency queue** infrastructure to prevent CDN rate-limiting




Let me grab the remaining config files before compiling.

Here's the full extended breakdown covering every platform-specific, screen-size, and thumbnail-loading technical detail found across the entire codebase:

---

# Multi-Platform & Technical Deep-Dive

---

## Viewport & Meta Configuration ([index.html](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/index.html:0:0-0:0))

``@/Users/czaunpeterbence/WebstormProjects/music-selector/index.html:5
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
``

- **viewport-fit=cover** — extends the viewport into the notch/island area on iOS; without this, safe-area-inset values would all be 0
- **maximum-scale=1.0, user-scalable=no** — disables iOS double-tap/pinch-to-zoom, critical for a swipe-gesture app
- **width=device-width, initial-scale=1.0** — baseline for all Android/iOS responsive layout

---

## iOS-Specific

### PWA / Home Screen
``@/Users/czaunpeterbence/WebstormProjects/music-selector/index.html:31-34
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Music Selector" />
``

- **apple-mobile-web-app-capable** — enables fullscreen standalone mode when launched from iOS home screen (hides Safari toolbar/URL bar entirely)
- **black-translucent** — status bar overlaps app content (transparent over the dark theme), which is **why** every top-anchored element must add env(safe-area-inset-top) — without it text would render behind the clock/battery row
- **apple-touch-icon** — home screen icon (SVG, scales to all sizes)
- **apple-mobile-web-app-title** — label shown under home screen icon ("Music Selector")

### iOS Install Flow
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/hooks/usePWAInstall.ts:8-15
function isIPhone(): boolean {
  return /iPhone|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
}
``

- iOS does **not** fire beforeinstallprompt — so the hook detects iPhone/iPod via UA and shows a manual guide instead
- navigator.standalone is an iOS-only non-standard property — the double check (matchMedia + .standalone) covers both Safari and other embedded browsers
- On iOS the [HomePage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/HomePage.tsx:12:0-294:1) renders a text guide: "Open in Safari → Share → Add to Home Screen"

### YouTube playsinline 
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:240-245
playerVars: {
  autoplay: shouldPlay ? 1 : 0,
  controls: 0,
  disablekb: 1,
  modestbranding: 1,
  playsinline: 1,
},
``

- playsinline: 1 is **critical on iOS** — without it, every video load hijacks the screen and opens the native fullscreen player, breaking the entire UI
- controls: 0 — hides YouTube's own controls (custom controls are rendered in React)
- disablekb: 1 — disables keyboard shortcuts that would interfere on desktop

### iOS Autoplay Blocking
iOS requires a direct user gesture to start audio. The playerBridge module solves this:
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:23-40
export function loadVideoFromGesture(videoId: string, shouldPlay: boolean = true): boolean {
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById(videoId);
      ytPlayer.playVideo(); // Force play to ensure audio context is active
      gestureVideoId = videoId;
      gestureShouldPlay = shouldPlay;
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
``

- Every swipe, button tap, and row click calls [loadVideoFromGesture](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:18:0-39:1) **synchronously inside the event handler** — this keeps it within the gesture trust chain
- The [MiniPlayer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:47:0-490:1) then calls [consumeGestureLoad()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:45:0-60:1) in its useEffect to avoid a **redundant second [loadVideoById](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:32:4-32:40)** call that would break the audio context iOS already unlocked
- A 2-second safety timeout detects silent gesture-load failures (stuck UNSTARTED state) and resets the UI
- PAUSED events are ignored if [isGestureLoadPending()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:41:0-43:1) — prevents race conditions when the old video stops before the new one initialises

### Vibration (iOS has no support)
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/CardStack.tsx:41
if (navigator.vibrate) navigator.vibrate(30);
``

- Guards with if (navigator.vibrate) — on iOS this is undefined, silently skipped. On Android Chrome it fires a 30ms haptic on every swipe.

---

## Android-Specific

### Native PWA Install Prompt
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/hooks/usePWAInstall.ts:34-42
const handler = (e: Event) => {
  e.preventDefault();
  setDeferredPrompt(e as BeforeInstallPromptEvent);
};
window.addEventListener('beforeinstallprompt', handler);
window.addEventListener('appinstalled', installedHandler);
``

- beforeinstallprompt fires on Android Chrome when installability criteria are met (HTTPS, service worker, manifest) — the event is captured and deferred, then triggered on user action
- appinstalled event clears the prompt state after successful install

### Theme Color (Android Status Bar)
``@/Users/czaunpeterbence/WebstormProjects/music-selector/index.html:6
<meta name="theme-color" content="#0f172a" />
``

- Colors the Android status bar and browser tab strip dark navy to match the app's dark background — no jarring white flash

### Vibration
- navigator.vibrate(30) — 30ms on every swipe, works on Android Chrome, Firefox for Android

---

## Safe Area Insets (Notch / Dynamic Island / Home Bar)

Every area of the UI that could be obscured by hardware cutouts has explicit safe-area compensation:

### Global Root ([index.css](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:0:0-0:0))
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:41-49
#root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
`

- **Top**: covers the status bar + notch/Dynamic Island cutout
- **Left/Right**: covers landscape mode cutouts (iPhones in landscape, foldables)
- **No bottom** here — handled individually by [BottomNav](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/layout/BottomNav.tsx:10:0-33:1) and [MiniPlayer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:47:0-490:1)

### Bottom Navigation ([BottomNav.tsx](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/layout/BottomNav.tsx:0:0-0:0))
`@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/layout/BottomNav.tsx:13
<nav ... style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
`

Adds padding below the nav icons so they sit above the iOS home indicator bar.

### Mini Player ([MiniPlayer.tsx](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:0:0-0:0))
`@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:388
style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
``

Player sits 4rem (64px = BottomNav height) above the bottom, **plus** the safe-area inset so it's never hidden behind the home bar.

### Swipe Page Height ([SwipePage.tsx](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/SwipePage.tsx:0:0-0:0))
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/SwipePage.tsx:10
style={{ height: hasPlayer ? 'calc(100dvh - 10.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' : 'calc(100dvh - 4.5rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' }}
``

Two modes:
- **Player visible**: 100dvh - 10.5rem (nav + player bar) minus both vertical insets
- **Player hidden**: 100dvh - 4.5rem (nav only) minus both vertical insets

### Offline Banner ([OfflineBanner.tsx](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/OfflineBanner.tsx:0:0-0:0))
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/OfflineBanner.tsx:27
style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
``

The banner is fixed top-0, so it adds internal padding to push text below the notch.

### Toast Container ([Toast.tsx](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/Toast.tsx:0:0-0:0))
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/Toast.tsx:21
style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
``

Toasts appear 1rem below the status bar (not behind it).

---

## dvh Units — Dynamic Viewport Height

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:38
min-height: 100dvh;
``

- dvh = **dynamic viewport height** — adjusts when the iOS Safari toolbar shows/hides
- vh is fixed to the *maximum* viewport height on iOS; dvh tracks the *current* visible area
- Used on both body and #root, and in [SwipePage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/SwipePage.tsx:3:0-14:1)'s height calculation

---

## Responsive Screen Sizes

The app is mobile-first with a single max-w-lg (512px) centered column, but has targeted breakpoints:

| Breakpoint | Behavior |
|---|---|
| < ~501px | FilterChips Group row wraps to its own line below the Sort row |
| min-[501px]: | Sort + Group rows inline |
| sm: (≥640px) | Volume mute button + volume slider appear in MiniPlayer |
| > lg | Everything centered in max-w-lg mx-auto, sides are just dark background |

### Volume Controls — Desktop Only
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:462-477
<button ... className="hidden sm:block p-1.5 ...">
  {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
</button>
<input type="range" ... className="hidden sm:block w-14 ..." />
``

- hidden sm:block — completely absent from DOM rendering on mobile viewport (≤639px)
- On mobile, volume is not exposed in the UI at all (controlled via hardware buttons)

---

## Touch Interaction Details

### Swipe Card Drag
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:17-31
const x = useMotionValue(0);
const y = useMotionValue(0);
const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
``

- dragElastic: 0.9 — very springy, natural on touch screens
- dragConstraints: { left:0, right:0, top:0, bottom:0 } + high elastic = unconstrained feel with snap-back
- cursor-grab active:cursor-grabbing — desktop visual feedback
- whileDrag: { scale: 1.02 } — slight zoom on grab

### Seek Bar & Volume — Touch Event Isolation
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:402-403
onTouchStart={(e) => { e.stopPropagation(); setSeeking(true); }}
onTouchEnd={() => commitSeek()}
``

- e.stopPropagation() on touchStart prevents the MiniPlayer container from intercepting touch events meant for the seek slider
- Same pattern on the volume slider — prevents scroll interference
- touch-none (touch-action: none) CSS on both sliders disables browser scroll handling during slider drag

### Global Touch Highlight
``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:23-25
* {
  -webkit-tap-highlight-color: transparent;
}
`

Removes the blue/grey flash that iOS and Android Chrome show on tap — applied universally to every element.

### Overscroll Prevention
`@/Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:37
overscroll-behavior: none;
`

- Disables pull-to-refresh on Android Chrome
- Disables the iOS rubber-band bounce scroll that would fight with swipe card drag gestures

---

## Thumbnail Loading — Full Technical Detail

### Two CDN Sources & URL Normalization ([thumbnail.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:0:0-0:0))

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:6-28
export function getThumbnailUrl(raw: string | undefined, size: 'small' | 'large' = 'large'): string {
  if (!raw) return '';

  // Google user-content thumbnails (lh3.googleusercontent.com)
  if (raw.includes('googleusercontent.com')) {
    const dims = size === 'large' ? 'w544-h544' : 'w120-h120';
    return raw.replace(/=w\d+-h\d+/, =${dims});
  }

  // YouTube thumbnail URLs (i.ytimg.com)
  if (raw.includes('i.ytimg.com')) {
    const match = raw.match(/\/vi\/([^/]+)\//);
    if (match) {
      const videoId = match[1];
      const quality = size === 'large' ? 'hqdefault' : 'default';
      return https://i.ytimg.com/vi/${videoId}/${quality}.jpg;
    }
  }

  return raw;
}
```

**Google (lh3.googleusercontent.com):**
- Bookmarklet scrapes the raw URL which may have any dimension (e.g. =w60-h60-l90-rj)
- Regex =w\d+-h\d+ replaces **only** the dimension part, preserving flags like -l90-rj (JPEG quality flags)
- large → w544-h544 (used on SwipeCard), small → w120-h120 (used on SongRow + MiniPlayer)

**YouTube (i.ytimg.com):**
- Raw URL may contain expiring query params or size variants from the scrape
- Extracts the videoId via /vi/([^/]+)/ regex, constructs a clean canonical URL
- large → hqdefault.jpg (480×360), small → default.jpg (120×90)
- Query params stripped entirely — avoids expiry issues

**Fallback construction ([getFallbackThumbnail](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:29:0-37:1)):**
```@/Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:34-38
export function getFallbackThumbnail(videoId: string | undefined, size: 'small' | 'large' = 'large'): string {
  if (!videoId) return '';
  const quality = size === 'large' ? 'hqdefault' : 'default';
  return https://i.ytimg.com/vi/${videoId}/${quality}.jpg;
}
```

Used when the stored thumbnail URL completely fails — constructs from videoId alone.

---

### SwipeCard [ThumbnailImage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:127:0-148:1) — Eager 3-Stage Fallback

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:128-149
function ThumbnailImage({ src, fallback, alt, className }) {
  const [stage, setStage] = useState(0);
  const imgSrc = stage === 0 ? (src || fallback) : stage === 1 ? fallback : '';

  const handleError = () => {
    setStage((prev) => {
      if (prev === 0 && fallback && src !== fallback) return 1;
      return 2;
    });
  };
  ...
  return <img src={imgSrc} alt={alt} className={className} onError={handleError} loading="eager" />;
}
``

| Stage | Source | Trigger |
|---|---|---|
| 0 | [getThumbnailUrl(song.thumbnail, 'large')](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:0:0-27:1) — upgraded original URL | Initial render |
| 1 | [getFallbackThumbnail(song.videoId, 'large')](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:29:0-37:1) — canonical YouTube URL | onError from stage 0 |
| 2 | SVG disc placeholder (inline SVG component) | onError from stage 1 |

- loading="eager" — card images are immediately visible and must load fast; no lazy loading here

---

### SongRow [RowThumbnail](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:80:0-125:1) — Lazy + IntersectionObserver + Ghost-Image Detection

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:81-126
function RowThumbnail({ src, fallback }) {
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
  }, []);

  const handleLoad = (e) => {
    const img = e.currentTarget;
    if (img.naturalWidth < 2 || img.naturalHeight < 2) advance();
  };
  ...
  return <img ... onError={advance} onLoad={handleLoad} loading="lazy" />;
}
``

- **IntersectionObserver with rootMargin: '200px'** — starts loading thumbnails 200px before they scroll into view; renders a grey bg-surface-700 placeholder div until then
- **One-shot**: observer.disconnect() immediately after first intersection — no repeated callbacks
- **loading="lazy"** — native browser lazy loading as second layer of defence
- **Ghost image detection** — naturalWidth < 2 || naturalHeight < 2 catches 1×1 transparent GIF "errors" that YouTube sometimes returns instead of a real 404 (the onError event never fires for these)
- Same 3-stage fallback as SwipeCard (stage 0 → 1 → Play icon placeholder)

---

### Service Worker Thumbnail Caching (Workbox)

``@/Users/czaunpeterbence/WebstormProjects/music-selector/vite.config.ts:31-49
runtimeCaching: [
  {
    urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'thumbnail-cache',
      expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'ytimg-cache',
      expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
],
``

| Detail | Value |
|---|---|
| Strategy | StaleWhileRevalidate — serves cached instantly, revalidates in background |
| Cache names | thumbnail-cache (Google), ytimg-cache (YouTube) |
| Max entries each | 300 |
| TTL | 7 days (604800s) |
| cacheableResponse: { statuses: [0, 200] } | Caches **opaque responses** (status 0) — thumbnails are cross-origin and CORS-blocked, so the SW caches them as opaque regardless |

This means: after first load, thumbnails render **instantly even offline** (up to the 300-entry / 7-day limit).

---

### [imageQueue.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:0:0-0:0) — Rate Limit Protection

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:1-35
const MAX_CONCURRENT = 2;
const DELAY_MS = 300;
let active = 0;
const queue: Array<() => void> = [];

export function acquireSlot(): Promise<() => void> { ... }
`

- Exists to limit concurrent image fetches to **2 at a time** with 300ms stagger between releases, preventing HTTP 429 rate-limit errors from Google/YouTube CDNs
- **Currently defined but not yet wired** into [RowThumbnail](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:80:0-125:1) or [ThumbnailImage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:127:0-148:1) — it's infrastructure ready for integration

---

## Media Session API — Lock Screen / Background Playback

`@/Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:69-109
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
``

- Sets song info + artwork on the OS lock screen / notification shade
- Three artwork sizes: 96×96, 192×192, 512×512 — OS picks the best fit for display density
- Action handlers registered: play, pause, nexttrack, previoustrack 
- playbackState set to 'playing'/'paused' in sync with player state
- **Platform support**: iOS 15+ Safari, Android Chrome, macOS Safari/Chrome, Windows Chrome Edge

---

## Font Rendering

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:34-36
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
``

- **-apple-system** → San Francisco on macOS/iOS
- **BlinkMacSystemFont** → San Francisco on older macOS Chrome
- **Segoe UI** → Windows
- **Roboto** → Android / Chrome OS
- **-webkit-font-smoothing: antialiased** → thinner, sharper rendering on high-DPI macOS/iOS
- **-moz-osx-font-smoothing: grayscale** → Firefox on macOS

---

## Scrollbar (macOS / Windows / Chrome)

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:51-60
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-surface-600); border-radius: 3px; }
``

- Applies on: Chrome, Safari (macOS/Windows/iOS), Edge
- Firefox uses scrollbar-width: thin fallback (not set — uses OS default thin scrollbar)
- Mobile browsers: scrollbars are hidden by default and these rules have no effect

---

## color-scheme: dark 

``@/Users/czaunpeterbence/WebstormProjects/music-selector/src/index.css:29-30
html {
  color-scheme: dark;
}
`

- Tells the browser to use dark-mode native UI elements: form inputs, scrollbars, date pickers
- Prevents white flash on page load before CSS is applied (browser renders dark background immediately)
- On iOS: affects the keyboard theme (dark keyboard appears automatically)

---

## PWA Manifest Highlights

`@/Users/czaunpeterbence/WebstormProjects/music-selector/vite.config.ts:14-27
manifest: {
  theme_color: '#0f172a',
  background_color: '#020617',
  display: 'standalone',
  orientation: 'portrait',
  ...
}
``

- **display: standalone** — hides browser chrome entirely (URL bar, back button) on both iOS and Android when installed
- **orientation: portrait** — locked to portrait; prevents landscape layout issues on phones
- **background_color: #020617** — splash screen background on Android; matches surface-950 so there's no flash
- **registerType: autoUpdate** — service worker silently updates itself when a new version deploys, no user interaction needed
- Icons declared as both purpose: any and purpose: maskable — maskable allows adaptive icons on Android (the icon can be cropped into any shape by the launcher)









Now let me compile the full, exhaustive improvement analysis from both codebase analysis and web research:

---

# Comprehensive Improvement List

---

## 🍎 iOS-Specific Issues

### 1. **First-Song Autoplay Failure (Critical Bug)**
The playerBridge only works when ytPlayer is already initialized. On the **very first swipe**, ytPlayer is null so [loadVideoFromGesture](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:18:0-39:1) returns false. Then initPlayer is called from useEffect (not a gesture context), so iOS blocks the autoplay silently — no error shown to the user.

**Fix**: Pre-warm the YT player on first user interaction anywhere in the app (e.g., on the first tap on the swipe page) by creating a silent hidden [YT.Player](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:27:2-41:3) instance in gesture context, before the first song is needed.

### 2. **No "Tap to Play" Fallback Overlay**
When autoplay is blocked by iOS and [setPlaying(false)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/playerStore.ts:22:2-22:47) is called, the play button just sits there. No UI callout tells the user *why* audio didn't start.

**Fix**: Show a brief animated "Tap ▶ to play" hint on the card or MiniPlayer when isPlaying is false but a currentVideoId exists.

### 3. **Background Playback Progress Desync**
The 500ms setInterval polling in MiniPlayer pauses when iOS Safari suspends the JS thread (app backgrounded). On return, progress and duration are stale.

**Fix**: On visibilitychange → document.visibilityState === 'visible', force a fresh [getCurrentTime()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:38:4-38:28) + [getDuration()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:39:4-39:25) pull from the player.

### 4. **iOS Ringer Switch — Web Audio API vs. Media Route**
YouTube IFrame uses HTMLMediaElement (Media route) which **ignores** the silent switch on iOS 15+. However, if any AudioContext node is ever introduced (e.g., for audio visualizations), it would route through the Ringer channel and be silenced. Worth documenting as a hard constraint.

### 5. **iOS PWA: Status Bar Area Flash on Launch**
apple-mobile-web-app-status-bar-style: black-translucent is correct, but there's no <meta name="apple-mobile-web-app-status-bar-style"> fallback for devices that don't support translucent. On older iOS, this shows a thin white strip at the top.

### 6. **No apple-touch-startup-image (Splash Screen)**
iOS shows a white/black blank screen for ~1s while loading. A configured <link rel="apple-touch-startup-image"> per device screen size eliminates this.

### 7. **iOS Safari Safe-Area Bottom — [InstallPrompt](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/InstallPrompt.tsx:9:0-62:1) Overlap**
[InstallPrompt](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/InstallPrompt.tsx:9:0-62:1) is positioned bottom-20 (fixed). On iPhone with home bar, the env(safe-area-inset-bottom) is not applied, so it can clip below the home indicator.

---

## 🤖 Android-Specific Issues

### 8. **Back Gesture / Hardware Back Button Not Handled**
Android's system back button and gesture navigate the browser history. From [/swipe](cci:9://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe:0:0-0:0), pressing back goes to / which discards the session visually. No confirmation dialog or back-press handler exists.

**Fix**: Use history.pushState or intercept popstate to prompt "Leave review?" before navigating away with unsaved progress.

### 9. **PWA Icon — No Rasterized PNG Fallback**
The manifest only declares SVG icons (purpose: any + maskable). Android Chrome on some devices (especially older Chromium versions) doesn't render SVG manifest icons correctly and falls back to a generic icon.

**Fix**: Add PNG icons at 192×192 and 512×512 alongside the SVG.

### 10. **vibrate() Pattern Too Simple**
navigator.vibrate(30) is a single pulse for all three swipe directions. Users can't distinguish like vs. dislike by feel.

**Fix**: Directional haptic patterns: like → [30], dislike → [15, 20, 15], skip → [50].

---

## 📱 Screen Orientation

### 11. **Landscape Mode Completely Broken**
orientation: portrait in the manifest locks the installed PWA to portrait. But in the browser (not installed), landscape is accessible and the SwipeCard layout collapses — card height becomes unusable, controls overflow.

**Fix options:**
- Add screen.orientation.lock('portrait') programmatically for installed PWA
- OR build a proper landscape layout (card left, controls right)
- @media (orientation: landscape) CSS rules at minimum

### 12. **No screen.orientation.lock() API Call**
The manifest setting only works when installed as PWA. In-browser the app freely rotates.
``js
// Should be called after first user interaction
screen.orientation.lock('portrait').catch(() => {/* API not supported, ignore */});
``

### 13. **Foldable / Tablet Layout Not Considered**
On tablets and foldables (Samsung Galaxy Fold, iPad), max-w-lg (512px) leaves large empty dark gutters. No split-pane layout (e.g., card left + library right on tablet).

---

## 🌍 Internationalisation (i18n)

### 14. **Zero i18n Support — All Strings Hardcoded English**
Every user-facing string is hardcoded. react-i18next + i18next is the de-facto standard (1M+ weekly downloads).

Strings that need extraction: all toast messages, UI labels, modal content, empty states, How To Use guide, BOOKMARKLET instructions, export filenames, error messages.

### 15. **No RTL Layout Support**
Languages like Arabic, Hebrew, Farsi are RTL. Tailwind supports rtl: variants but none are used. The SwipeCard drag direction would need semantic inversion for RTL (swipe right = dislike in RTL convention).

### 16. **No Date/Number Locale Formatting**
Export filenames use new Date().toISOString().slice(0, 10) (ISO format). Duration display is raw string from CSV (e.g. "3:45"). Neither uses Intl.DateTimeFormat or Intl.NumberFormat.

### 17. **No lang Attribute on <html>**
<html lang="en"> is set correctly but hardcoded. Should update dynamically when language is changed.

---

## ♿ Accessibility (WCAG 2.2)

### 18. **Swipe Cards Have No Keyboard Alternative**
Dragging is the only gesture. Arrow keys produce no action. This is a **WCAG 2.1.1 Level A failure** — all functionality must be keyboard operable.

**Fix**: onKeyDown on the card container: → = like, ← = dislike, ↑ = skip, Space = play/pause, Z = undo.

### 19. **No aria-label on Icon-Only Buttons**
All control buttons (heart, thumbs-down, skip, undo, play, loop, stop) have zero aria-label. A screen reader announces them as "button" with no context.

**Fix**: Add aria-label="Like", aria-label="Dislike", aria-label="Undo last selection", etc. to every button.

### 20. **No role="status" for Toast Notifications**
Toasts appear visually but screen readers don't announce them. They need role="status" or role="alert" (for errors) + aria-live="polite".

### 21. **Tap Highlight Removed Globally**
``css
* { -webkit-tap-highlight-color: transparent; }
``
This also removes visual feedback for keyboard focus on interactive elements. Focus rings should be explicitly reinstated.

**Fix**: Keep -webkit-tap-highlight-color: transparent but add explicit :focus-visible styles.

### 22. **No Skip-to-Content Link**
No <a href="#main-content">Skip to content</a> at the top. Every keyboard navigation starts from the bottom nav.

### 23. **SwipeCard Accessible Name Missing**
The card <motion.div> has no role="article" or aria-label="{song.title} by {artist}". Screen readers can't identify what song is being reviewed.

### 24. **Progress Bar Not Announced**
The review progress (14 of 1148 reviewed, 1%) updates silently. Should use aria-valuenow, aria-valuemin, aria-valuemax and role="progressbar".

### 25. **Color Contrast — text-surface-600 on Dark Backgrounds**
Duration labels in [SongRow](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:19:0-78:1) use text-surface-600 (#475569) on bg-surface-950 (#020617) — contrast ratio is approximately 3.5:1, below the WCAG AA minimum of **4.5:1** for small text.

---

## ⚡ Performance

### 26. **No List Virtualization — 1148 Rows in DOM**
[SongList](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongList.tsx:10:0-34:1) renders every [SongRow](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:19:0-78:1) directly. At 1148 songs, this puts ~1148 DOM nodes with observers and motion components into the document simultaneously.

**Fix**: @tanstack/react-virtual or react-window — render only the ~15 visible rows + buffer.

### 27. **[imageQueue.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:0:0-0:0) Exists But Is Not Wired**
The rate-limit queue ([acquireSlot](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:20:0-34:1)) was built but never imported in [RowThumbnail](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:80:0-125:1) or [ThumbnailImage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:127:0-148:1). Google/YouTube CDNs can 429 during rapid scrolling of large lists.

### 28. **[SongRow](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:19:0-78:1) Not Memoized**
With 1148 rows, any parent state change (e.g., player currentSongIndex change) re-renders all rows. No React.memo() or useCallback on [handlePlay](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:23:2-26:4).

### 29. **No Route-Level Code Splitting**
All 4 pages + all components load in a single JS bundle. [MiniPlayer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:47:0-490:1) (largest component, 19KB) loads even on the home page before any songs are loaded.

**Fix**: React.lazy + Suspense on route components.

### 30. **[StatsDashboard](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/stats/StatsDashboard.tsx:6:0-187:1) Recomputes on Every Selection**
useMemo over songs + selections runs top-artist and top-album calculations on every swipe. With 1148 songs and many selections, this is O(n) on every render.

### 31. **No will-change on Swipe Card**
Framer Motion handles GPU compositing, but the rotate transform on the card during drag could benefit from a will-change: transform hint for older devices.

### 32. **Framer Motion Full Bundle Imported**
import { motion, AnimatePresence, useMotionValue, useTransform } — Framer Motion is not tree-shaken in all bundler configs. Using the m component alias + LazyMotion reduces bundle by ~30KB.

---

## 💾 Data Persistence & Storage

### 33. **Zustand persist Uses localStorage (5MB Limit)**
With 1148 songs × ~300 bytes/song ≈ ~345KB just for songs. Selections add ~50 bytes each. Approaching the limit at large libraries (e.g., 10K+ songs). No fallback or error if storage quota is exceeded.

**Fix**: Migrate to IndexedDB via idb-keyval adapter for Zustand persist — no size limit.

### 34. **Volume Not Persisted**
playerStore has no persist middleware. Volume resets to 70 on every page reload.

### 35. **No Undo History Size Cap**
history: Selection[] in selectionStore grows unboundedly. After reviewing 1000 songs, history holds 1000 entries in localStorage.

**Fix**: Cap undo history at last 50 entries.

### 36. **window.confirm() in PWA Standalone Mode**
[ExportPanel.handleReset](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/stats/ExportPanel.tsx:74:2-80:4) uses confirm('This will clear all songs...'). In PWA standalone mode on some Android browsers, window.confirm is blocked and silently returns false — the reset never fires but also never tells the user why.

**Fix**: Replace with a custom modal confirmation component.

---

## 🔔 Missing PWA Capabilities

### 37. **No Service Worker Update Notification**
registerType: autoUpdate silently installs new versions. Users get new code without knowing. If a breaking change deploys, their persisted data format may mismatch.

**Fix**: Listen for workbox:waiting and show a toast: "Update available — tap to reload."

### 38. **No Web Share API**
Users can't share their liked songs list or individual song links. navigator.share() is available on iOS 12.2+ and Android Chrome.

**Fix**: Add a share button on the Library (liked tab) to share a summary, and on each [SongRow](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:19:0-78:1) to share the YouTube Music link.

### 39. **No PWA Shortcuts in Manifest**
Home screen long-press context menu (Android) can show quick actions. None defined.

``json
"shortcuts": [
  { "name": "Swipe", "url": "/#/swipe", "icons": [...] },
  { "name": "Library", "url": "/#/library", "icons": [...] }
]
``

### 40. **No screenshots in Manifest**
screenshots improve the install prompt UI on Android Chrome (shows app previews before install). Not defined.

### 41. **No Periodic Background Sync**
Could pre-warm the YouTube IFrame API script in the background so first play is faster.

### 42. **/404.html Only Handles Hash Routing Partially**
The 404.html redirects to [index.html](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/index.html:0:0-0:0) with the path encoded as a query param. But since HashRouter is used, 404.html may not always be served by GitHub Pages for hash routes. This works but relies on GitHub Pages' specific 404 behaviour.

---

## 🎨 UI / UX Improvements

### 43. **Light Mode / System Theme Support**
The app is dark-only (color-scheme: dark hardcoded). No @media (prefers-color-scheme: light) handling. No manual toggle.

### 44. **No Swipe Animation on Button Tap**
Tapping the heart/thumbs-down buttons in [SwipeControls](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeControls.tsx:13:0-58:1) calls handleSwipe which triggers [addSelection](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:24:6-30:7) — but the card doesn't fly off with the swipe animation. It just disappears via AnimatePresence exit. The exit animation in [SwipeCard](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:15:0-116:1) uses x.get() and y.get() which are both 0 when triggered by button (not drag).

**Fix**: When swipe is triggered by button, animate the card programmatically using useAnimate or imperative Framer Motion controls before removing it.

### 45. **No Song Detail / Link to YouTube**
No way to open the song on YouTube or YouTube Music from within the app. Both youtubeWatchUrl and youtubeMusicUrl are stored in the data but never surfaced in any UI.

### 46. **Search Results Have No Highlight**
When searching "Billie" in the library, matching rows don't highlight the matched text. Standard UX expectation.

### 47. **No Estimated Time to Completion**
Stats page shows X of Y reviewed but not "~N minutes remaining" based on average review time per song.

### 48. **No Per-Session Review Speed**
No tracking of how many songs reviewed per minute/hour in the current session.

### 49. **Long Swipe Queue With No Randomize Option**
The swipe queue is always in CSV index order. No shuffle option for the swipe queue (only shuffle for *playback* exists).

### 50. **No "Jump to Unreviewed" in Library**
If you have 800 liked/disliked songs, scrolling to find unreviewed ones requires switching tabs. A "Go to next unreviewed" button would shortcut back to the swipe queue.

### 51. **[InstallPrompt](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/InstallPrompt.tsx:9:0-62:1) and [usePWAInstall](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/hooks/usePWAInstall.ts:16:0-70:1) Duplicated Logic**
[BeforeInstallPromptEvent](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/hooks/usePWAInstall.ts:2:0-5:1) interface and beforeinstallprompt listener are implemented in **both** [InstallPrompt.tsx](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/InstallPrompt.tsx:0:0-0:0) and [usePWAInstall.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/hooks/usePWAInstall.ts:0:0-0:0) independently. One should use the other.

### 52. **MiniPlayer Album Thumbnail Renders the Raw Stored URL**
``tsx
src={currentSong.thumbnail}  // not going through getThumbnailUrl()
``
The MiniPlayer uses currentSong.thumbnail directly without upgrading it through [getThumbnailUrl()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:0:0-27:1). SwipeCard and SongRow both use [getThumbnailUrl()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:0:0-27:1) for the size upgrade — MiniPlayer does not.

### 53. **No Swipe Card Count Badge**
No indicator of how many songs remain in the swipe queue (other than the progress bar %). A "X left" label adds clarity.

### 54. **Toast Auto-Dismiss Timer Not Pauseable**
If the user looks away, toasts dismiss in 3s. No hover/focus pause mechanism (standard for accessible toast patterns).

---

## 🔒 Security & Privacy

### 55. **No Content Security Policy (CSP)**
No <meta http-equiv="Content-Security-Policy"> or server header. XSS via injected scripts from the YouTube IFrame API domain is unmitigated at the app level.

### 56. **BOOKMARKLET Runs Arbitrary JS on youtube.com**
Technically sound (it's the user's own browser), but the bookmarklet has no integrity checks. Distributing it via clipboard means any modification by a clipboard hijacker goes undetected.

### 57. **No rel="noopener noreferrer" on External Links**
The feedback mailto: link is fine, but if any <a href="...youtube.com"> links are added in future, this needs the rel attribute.

---

## 🧪 Reliability / Error Handling

### 58. **No React Error Boundary**
Any unhandled render error (e.g., malformed song data, null reference) crashes the entire app with a blank screen. No recovery UI.

**Fix**: Wrap routes in <ErrorBoundary> with a "Something went wrong — reload" fallback.

### 59. **[parseCSV](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:7:0-55:1) Max 5 Errors Shown**
``ts
errors.push(...results.errors.slice(0, 5)...)
``
Silently truncates after 5. No indication that more errors were suppressed.

### 60. **YouTube IFrame onError Not Handled in UI**
onError: (event: { data: number }) => void is defined in the type definitions but no onError handler is passed to [new YT.Player(...)](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:27:2-41:3). Error codes 2 (invalid ID), 5 (HTML5 not supported), 100 (not found), 101/150 (embedding not allowed) all fail silently.

**Fix**: Handle at minimum error 100/150 ("video unavailable") with a toast + auto-advance to next song.

### 61. **No Retry on Failed Thumbnail**
After the 3-stage fallback fails (stage 2), the placeholder is permanent. There's no retry on slow connections where the image failed due to timeout rather than a real 404.

### 62. **loadingRef Leak on Unmount**
[MiniPlayer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:47:0-490:1) doesn't clean up the loadingRef, progressInterval, or playerRef on component unmount (though it's never actually unmounted in normal use since it lives in [Layout](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/layout/Layout.tsx:9:0-35:1)). If navigation triggered an unmount, the polling interval would reference a destroyed player.

---

## 🛠️ Developer Experience / Code Quality

### 63. **[imageQueue.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:0:0-0:0) Dead Code**
Built and exported but never imported anywhere. Either wire it up in [RowThumbnail](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:80:0-125:1) or remove it to avoid confusion.

### 64. **[Disc](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:118:0-125:1) SVG Component in [SwipeCard.tsx](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:0:0-0:0) — Unused**
``ts
function Disc({ size }: { size: number }) { ... }
``
Defined but never rendered (it was replaced by the inline SVG in [ThumbnailImage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:127:0-148:1)). Dead code.

### 65. **No Test Coverage**
Zero test files. No unit tests for [filterSongs](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/search.ts:2:0-44:1), [groupSongs](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/grouping.ts:7:0-24:1), [parseCSV](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:7:0-55:1), [getThumbnailUrl](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:0:0-27:1), playerBridge. No integration tests for store actions.

### 66. **GitHub Actions Deploy Workflow — No Cache**
.github/workflows/deploy.yml (not read yet) presumably runs npm ci + vite build on every push with no actions/cache for node_modules. Slow builds.

### 67. **[vite.config.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/vite.config.ts:0:0-0:0) base: '/' vs HashRouter**
HashRouter is used for GitHub Pages compatibility, but base: '/' in vite config means relative asset paths work on custom domain (music.peterbenceczaun.me) but would break on a sub-path GitHub Pages deploy (username.github.io/music-selector/). The CNAME file suggests the custom domain is active, but this is a fragile setup.

---

## Summary Table

| # | Category | Severity | Effort |
|---|---|---|---|
| 1–3 | iOS Audio/Autoplay | 🔴 High | Medium |
| 4–7 | iOS PWA Polish | 🟡 Medium | Low |
| 8–10 | Android | 🟡 Medium | Low |
| 11–13 | Screen Orientation | 🔴 High | High |
| 14–17 | i18n | 🟡 Medium | High |
| 18–25 | Accessibility | 🔴 High | Medium |
| 26–32 | Performance | 🟡 Medium | Medium |
| 33–36 | Data Storage | 🟡 Medium | Low–Medium |
| 37–42 | PWA Capabilities | 🟢 Low | Low–Medium |
| 43–54 | UI/UX | 🟡 Medium | Low–High |
| 55–57 | Security | 🟡 Medium | Low |
| 58–62 | Reliability | 🔴 High | Low–Medium |
| 63–67 | DX / Code Quality | 🟢 Low | Low |



Let me read through the entire codebase systematically.





Now let me read all the source files in parallel.















Here's a complete breakdown of every feature and function in this repo:

---

# Music Selector — Full Feature & Function Inventory

## Stack
React 19 + TypeScript, Vite, TailwindCSS v4, Zustand, Framer Motion, PapaParse, React Router v7, vite-plugin-pwa 

---

## Pages / Routes

| Route | Component |
|---|---|
| / | [HomePage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/HomePage.tsx:12:0-294:1) |
| [/swipe](cci:9://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe:0:0-0:0) | [SwipePage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/SwipePage.tsx:3:0-14:1) |
| [/library](cci:9://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library:0:0-0:0) | [LibraryPage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/LibraryPage.tsx:14:0-107:1) |
| [/stats](cci:9://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/stats:0:0-0:0) | [StatsPage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/StatsPage.tsx:39:0-124:1) |
| * | Redirects to / |

---

## Page Features

### [HomePage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/HomePage.tsx:12:0-294:1)
- CSV drag-and-drop / file upload
- Load sample data (1,148 songs from SAMPLE_DATA.csv)
- Session resume card (shows filename, song count, reviewed count, % complete)
- "Continue Reviewing" shortcut to [/swipe](cci:9://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe:0:0-0:0)
- **How To Use** modal (animated, scrollable) with:
  - Step-by-step bookmarklet usage instructions
  - One-click copy of the bookmarklet code to clipboard
  - Swipe gesture guide
  - Library / Settings summary
  - Tips
- Feedback mailto link
- PWA install button (non-iOS: native prompt, iOS: Safari "Add to Home Screen" guide)

### [SwipePage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/SwipePage.tsx:3:0-14:1)
- Renders [CardStack](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/CardStack.tsx:12:0-160:1)
- Dynamically adjusts viewport height when [MiniPlayer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:47:0-490:1) is visible (calc(100dvh - 10.5rem …) vs 4.5rem)

### [LibraryPage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/LibraryPage.tsx:14:0-107:1)
- Full-text search (title, artist, album)
- Tab filter: **All / Liked / Disliked / Unreviewed** with live counts
- Sort by: **Index / Title / Artist / Duration** (asc ↑ / desc ↓ toggle)
- Group by: **None / Artist / Album / Duration / Status**
- **Shuffle Play** button (random song from filtered set)
- Filtered result count display
- Respects global hideExplicit setting

### [StatsPage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/pages/StatsPage.tsx:39:0-124:1) (also Settings)
- **Playback settings:**
  - Autoplay toggle
  - Loop mode cycle: Off → Repeat One → Repeat All
  - Auto-Continue toggle (play next song when current ends)
  - Shuffle Playback toggle
- **Content settings:**
  - Hide Explicit toggle
- **Statistics dashboard** (conditional on songs loaded)
- **Export & Data panel**

---

## Components

### [DropZone](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/upload/DropZone.tsx:12:0-160:1)
- Drag-and-drop CSV upload with visual drag state
- Click-to-browse fallback
- Processing spinner animation
- Parse error display
- 5-song preview after successful load
- "Start Reviewing" CTA navigates to [/swipe](cci:9://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe:0:0-0:0)

### [CardStack](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/CardStack.tsx:12:0-160:1)
- Manages the swipe review queue (unreviewed songs filtered by hideExplicit)
- Handles swipe events → [addSelection](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:24:6-30:7) (liked/disliked/skipped)
- **Haptic feedback** on swipe (navigator.vibrate(30))
- Toast on like
- Auto-loads next song via [loadVideoFromGesture](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:18:0-39:1) + [setCurrentSong](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/playerStore.ts:19:2-20:86) (respects autoplay setting)
- **Undo last selection** (restores song to top of queue, reloads it in player)
- Progress bar (reviewed / total, %)
- Empty states: no songs loaded, all done
- Play/Pause toggle for current card song

### [SwipeCard](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:15:0-116:1)
- Framer Motion drag with useMotionValue / useTransform 
- Swipe thresholds: right >100px = like, left <-100px = dislike, up <-80px = skip
- Animated overlays: **LIKE** (green), **NOPE** (red), **SKIP** (amber) fade in with drag
- Card rotation follows drag direction (−15° to +15°)
- Exit animation flies card off-screen in swipe direction
- Background card rendered at 95% scale / 60% opacity
- [ThumbnailImage](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeCard.tsx:127:0-148:1) with primary → fallback → SVG placeholder chain
- Explicit badge (E chip + AlertTriangle icon)
- Song title, artist, album, duration displayed

### [SwipeControls](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/swipe/SwipeControls.tsx:13:0-58:1)
- Dislike button (rose)
- Skip button (amber)
- Like button (green)
- Play/Pause toggle button
- Undo button (disabled when nothing to undo)
- All buttons have whileTap scale animation

### [MiniPlayer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:47:0-490:1)
- **YouTube IFrame API** integration (lazy-loaded once, singleton)
- Seeks, plays, pauses, stops, loads videos
- playerBridge integration to bypass React state indirection for mobile autoplay
- **Progress bar** (seek slider, 500ms polling interval)
- Time display (current / total, m:ss format)
- Play/Pause button
- Stop (X) button
- Loop mode button (cycles Off → Repeat One → Repeat All) — hidden on swipe page
- Auto-Continue toggle — hidden on swipe page
- Shuffle toggle — hidden on swipe page
- Volume mute toggle + slider — desktop only (hidden sm:block)
- Song thumbnail + title + artist display
- **Media Session API**: lock screen controls (play/pause/next/previous), artwork metadata
- Handles autoplay blocking (detects CUED/PAUSED states, resets UI)
- Gesture-load pending guard (ignores spurious PAUSED events during video transitions)
- Slides in/out with AnimatePresence + y: 100 entry animation
- Safe-area-inset aware positioning

### [SearchBar](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SearchBar.tsx:7:0-28:1)
- Controlled text input
- Clear button (X) when value is non-empty

### [FilterChips](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/FilterChips.tsx:37:0-114:1)
- Tab row: All / Liked / Disliked / Unreviewed (with counts)
- Sort row: # / Title / Artist / Duration + direction arrow toggle
- Group row: None / Artist / Album / Duration / Status

### [SongList](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongList.tsx:10:0-34:1)
- Renders flat list (no grouping) or collapsible groups
- [CollapsibleGroup](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongList.tsx:36:0-70:1): animated expand/collapse with AnimatePresence 
- Empty state: "No songs match your filters"

### [SongRow](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:19:0-78:1)
- Click to play (via [loadVideoFromGesture](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:18:0-39:1) + [setCurrentSong](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/playerStore.ts:19:2-20:86))
- Active state highlight (accent border + color)
- Animated "now playing" bars when active (3 pulsing bars)
- [RowThumbnail](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/library/SongRow.tsx:80:0-125:1): **Intersection Observer** lazy-load (200px root margin), primary → fallback → placeholder chain, 1×1 pixel image detection
- Status icon (Heart / ThumbsDown / SkipForward) with colored backgrounds
- Duration display

### [StatsDashboard](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/stats/StatsDashboard.tsx:6:0-187:1)
- Stat cards: Total Songs, Liked, Disliked, Skipped
- Completion % with animated progress bar
- Review distribution stacked bar (liked / disliked / skipped with % labels)
- **Top 5 Liked Artists** (animated bar chart)
- **Top 5 Liked Albums** (animated bar chart)

### [ExportPanel](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/stats/ExportPanel.tsx:7:0-133:1)
- Export liked songs as CSV (liked_songs_YYYY-MM-DD.csv)
- Export all songs as CSV (all_songs_YYYY-MM-DD.csv)
- Backup full state as JSON (music_selector_backup_YYYY-MM-DD.json)
- Restore from JSON backup (restores songs + all selections)
- **Reset All Data** (confirm dialog → clears songs + selections)

### [OfflineBanner](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/OfflineBanner.tsx:4:0-34:1)
- Listens to window online/offline events
- Animated slide-in banner when offline

### [InstallPrompt](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/InstallPrompt.tsx:9:0-62:1)
- Floating bottom banner on beforeinstallprompt 
- Dismissable (X button)

### [Toast](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/toastStore.ts:2:0-6:1) / [ToastContainer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/Toast.tsx:16:0-43:1)
- Three types: success (green), [error](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:49:6-52:7) (red), info (neutral)
- Auto-dismiss after 3 seconds
- Manual dismiss (X)
- Animated enter/exit

### [Layout](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/layout/Layout.tsx:9:0-35:1)
- Page transition animation (opacity + y slide, 200ms, mode="wait")
- Hosts: [OfflineBanner](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/OfflineBanner.tsx:4:0-34:1), [ToastContainer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/Toast.tsx:16:0-43:1), [InstallPrompt](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/ui/InstallPrompt.tsx:9:0-62:1), [MiniPlayer](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/player/MiniPlayer.tsx:47:0-490:1), [BottomNav](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/layout/BottomNav.tsx:10:0-33:1)

### [BottomNav](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/components/layout/BottomNav.tsx:10:0-33:1)
- 4 links: Upload / Swipe / Library / Settings
- Active link highlighted in accent color

---

## State (Zustand stores)

### songStore — persisted
- songs: Song[], fileName: string | null 
- [setSongs(songs, fileName)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/songStore.ts:16:6-16:61), [clearSongs()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/songStore.ts:17:6-17:58)

### selectionStore — persisted
- selections: Record<number, Selection>, history: Selection[] 
- [addSelection(songIndex, status)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:24:6-30:7)
- [undoLast()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:32:6-43:7) → returns removed Selection | null 
- [getSelection(songIndex)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:45:6-45:62), [getSelectionsMap()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:47:6-47:103)
- [clearSelections()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:49:6-49:65)
- [getLikedCount()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:51:6-51:101), [getDislikedCount()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:52:6-52:107), [getSkippedCount()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:53:6-53:105), [getReviewedCount()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/selectionStore.ts:54:6-54:66)

### playerStore — in-memory
- currentVideoId, currentSongIndex, isPlaying, volume (default 70)
- [setCurrentSong(videoId, songIndex, autoplay?)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/playerStore.ts:19:2-20:86), [setPlaying(bool)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/playerStore.ts:22:2-22:47), [setVolume(n)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/playerStore.ts:23:2-23:40), [stop()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/playerStore.ts:24:2-24:85)

### settingsStore — persisted
- autoplay, loopMode (off/one/all), autoContinue, shufflePlayback, hideExplicit 
- [toggleAutoplay()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/settingsStore.ts:28:6-28:67), [cycleLoopMode()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/settingsStore.ts:29:6-32:11), [toggleAutoContinue()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/settingsStore.ts:33:6-33:79), [toggleShufflePlayback()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/settingsStore.ts:34:6-34:88), [toggleHideExplicit()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/settingsStore.ts:35:6-35:79)

### toastStore — in-memory
- toasts: Toast[] 
- [addToast(message, type?)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/toastStore.ts:16:2-22:3) — auto-removes after 3s via setTimeout 
- [removeToast(id)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/store/toastStore.ts:23:2-23:92)

---

## Utilities

### [csv.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:0:0-0:0)
- [parseCSV(file)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:7:0-55:1) — async, PapaParse, validates required columns (index, title, primaryArtist, videoId), maps all 15 song fields
- [parseCSVString(csvText)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:57:0-93:1) — synchronous version for sample data
- [exportToCSV(songs, filename)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:95:0-108:1) — PapaParse unparse → blob download
- [exportJSON(data, filename)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:110:0-112:1) — JSON stringify → blob download
- [downloadFile(content, filename, type)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/csv.ts:114:0-122:1) — creates <a> + URL.createObjectURL, auto-revokes after 1s

### [playerBridge.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:0:0-0:0)
- [registerPlayer(p)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:10:0-12:1) / [unregisterPlayer()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:14:0-16:1) — holds singleton [YT.Player](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:27:2-41:3) ref
- [loadVideoFromGesture(videoId, shouldPlay?)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:18:0-39:1) — calls [loadVideoById](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:32:4-32:40) + [playVideo](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/youtube.d.ts:29:4-29:21) directly from gesture events (bypasses React state delay for mobile autoplay)
- [isGestureLoadPending()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:41:0-43:1) — guard for race conditions
- [consumeGestureLoad(videoId)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/playerBridge.ts:45:0-60:1) — one-shot consume of pending gesture load

### [search.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/search.ts:0:0-0:0)
- [filterSongs(songs, selections, filters)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/search.ts:2:0-44:1) — merges selections, applies tab filter, search query (title/artist/album), explicit filter, sorts
- [filterByTab(songs, tab)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/search.ts:46:0-57:1) — liked / disliked / unreviewed / all

### [grouping.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/grouping.ts:0:0-0:0)
- [groupSongs(songs, groupBy)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/grouping.ts:7:0-24:1) — builds [SongGroup[]](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/grouping.ts:2:0-5:1), sorted by group size desc
- [getGroupKey(song, groupBy)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/grouping.ts:26:0-42:1) — artist / album / duration bucket (<2min, 2–9min, 9+min) / status

### [thumbnail.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:0:0-0:0)
- [getThumbnailUrl(raw, size)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:0:0-27:1) — upgrades Google user-content URLs (w544-h544 / w120-h120) and YouTube i.ytimg.com paths (hqdefault / default)
- [getFallbackThumbnail(videoId, size)](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/thumbnail.ts:29:0-37:1) — constructs i.ytimg.com/vi/{id}/hqdefault.jpg 

### [imageQueue.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:0:0-0:0)
- Concurrency-limited image load queue (max 2 concurrent, 300ms stagger between slots)
- [acquireSlot()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:20:0-34:1) — returns Promise that resolves with a [release()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/imageQueue.ts:14:0-18:1) fn to call on load/error

### [bookmarklet.ts](cci:7://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/utils/bookmarklet.ts:0:0-0:0)
- BOOKMARKLET — minified JS bookmarklet that:
  - Auto-scrolls YouTube Music Liked Songs page (up to 9999 iterations, stabilizes after 3 equal counts)
  - Scrapes all ytmusic-responsive-list-item-renderer elements
  - Extracts: index, title, titleNormalized, primaryArtist, allArtists, artistCount, album, duration, durationSeconds, videoId, url, youtubeWatchUrl, youtubeMusicUrl, thumbnail, isExplicit
  - Strips list param from URLs
  - Downloads result as CSV

---

## Hooks

### [usePWAInstall](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/hooks/usePWAInstall.ts:16:0-70:1)
- Listens for beforeinstallprompt event
- Detects iOS iPhone/iPod (shows manual guide instead)
- Detects standalone mode (already installed)
- [install()](cci:1://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/hooks/usePWAInstall.ts:52:2-62:4) — triggers native prompt, awaits userChoice 
- Returns: { canInstall, isInstalled, isIOS, install } 

---

## Data Model ([Song](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/index.ts:0:0-16:1))
15 fields: index, title, titleNormalized, primaryArtist, allArtists, artistCount, album, duration, durationSeconds, videoId, url, youtubeWatchUrl, youtubeMusicUrl, thumbnail, isExplicit 

## Selection Types
- [SelectionStatus](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/index.ts:18:0-18:63): 'liked' | 'disliked' | 'skipped' 
- [Selection](cci:2://file:///Users/czaunpeterbence/WebstormProjects/music-selector/src/types/index.ts:20:0-24:1): { songIndex, status, timestamp } 

---

## PWA / Infrastructure
- vite-plugin-pwa — service worker, installable
- HashRouter — GitHub Pages compatible routing
- GitHub Actions deploy workflow (.github/workflows/deploy.yml)
- public/CNAME — custom domain
- public/404.html — SPA fallback for hash routing
- public/SAMPLE_DATA.csv — 1,148 pre-loaded songs
- Safe-area insets throughout (env(safe-area-inset-bottom/top)) for iOS notch/home bar support





model: Claude Opus 4.6 Thinking 1M
mode: planing
type: model is asking: For the rewrite, should I keep the same tech stack (React 19, Vite, TailwindCSS v4, Zustand, Framer Motion) or do you want to consider alternatives?
mcps: []
prompt: total rewrite from scratch


model: Claude Opus 4.6 Thinking 1M
mode: planing
type: model is asking: What's your primary goal for this session? The improvement list spans iOS bugs, Android issues, accessibility, performance, i18n, security, UI/UX, and code quality. Which category or severity level do you want to tackle first?
mcps: []
prompt: Keep current stack

model: Claude Opus 4.6 Thinking 1M
mode: planing
type: model is asking: Which of the 67 improvement items should be included in the rewrite? And should I include i18n (items 14-17) given it's high effort?
mcps: []
prompt: all and everything down to the last bit


model: Claude Opus 4.6 Thinking 1M
mode: coding
mcps: []
prompt: implement the plan

model: Claude Opus 4.6 Thinking 1M
mode: coding
mcps: []
prompt: test with playwrigth or chrome devtools mcp the whole app e2e each and everything in all cases if you find anything incosistent or not working fix it e2e one you done do a second run and verify each and every ui element functions and behaviour and side effects



model: Claude Opus 4.6 Thinking 1M
mode: coding
mcps: []
prompt: play around with the application with mcp like a real user and find bugs


model: Claude Opus 4.6 Thinking 1M
mode: coding
mcps: [mcp-playwright, memory, puppeteer, sequential-thinking]
prompt: by using a real browser window test the app with  mcp and verify as a real user that is is working properly and feels good to use it and it is a smooth experience to use it


end: 312 759 context is used out of 1m