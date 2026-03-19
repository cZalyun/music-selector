# Music Selector

![ TypeScript ](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![ React ](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![ Vite ](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![ PWA ](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![ License ](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> A mobile-first Progressive Web App for reviewing your YouTube Music liked songs with a Tinder-style swipe interface.

## 🎯 How to Use

### 1. Export Your YouTube Music Library

**Bookmarklet Method (Recommended):**
- Copy the bookmarklet from the app's "How to Use" modal
- Create a new bookmark in your browser with this code
- Go to YouTube Music → Library → Liked songs
- Click the bookmarklet to automatically export as CSV

**Manual Method:**
- Go to YouTube Music → Library → Liked songs
- Scroll to load all your liked songs
- Use browser dev tools to extract data (see bookmarklet code for reference)

### 2. Upload & Start Swiping

1. Upload your CSV file on the home page
2. Start swiping: Right to like 👍, left to dislike 👎, up to skip ⏭️
3. Use keyboard shortcuts: `→` `←` `↑` `Space` `Z`

### 3. Review & Export

- Check your progress in the Stats page
- Export your curated liked songs as CSV
- Import back to YouTube Music or other services

### 4. Install as PWA

**iOS (iPhone/iPad):**
- Safari: Share → Add to Home Screen
- Chrome/Edge: Share → Add to Home Screen (iOS 17+)

**Android:**
- Chrome/Brave/Edge: Menu → Add to Home Screen
- Samsung Internet: Install icon in URL bar

**Desktop:**
- **macOS:** 
  - Chrome/Edge/Brave: Install icon in URL bar → Add to Dock
  - Safari 17+: File → Add to Dock
- **Windows:** Edge/Chrome/Brave: Install icon in URL bar → Add to Desktop/Taskbar
- **Linux:** Chrome/Edge/Brave: Install icon in URL bar

**Benefits:**
- Native app experience
- Instant updates


## ✨ Features

- 🎯 **Swipe Review** — Tinder-style interface for quick curation
- 🎵 **Music Player** — YouTube player with lock screen controls
- 📚 **Library** — Search, filter, sort with virtualized lists
- 📊 **Stats** — Progress tracking, export to CSV
- 📱 **PWA** — Installable, works offline
- ♿ **Accessibility** — WCAG 2.2 AA compliant
- 🌍 **i18n** — Multi-language ready

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🛠️ Tech Stack

- **React 19** + TypeScript
- **Vite** + PWA (Workbox)
- **TailwindCSS v4** with custom themes
- **Zustand** + IndexedDB persistence
- **Framer Motion** animations
- **Vitest** testing

## 📱 Platform Support

| Platform | Install | Audio | Gestures | Lock Screen |
|----------|---------|-------|----------|-------------|
| iOS Safari | ✅ Manual | ✅ | ✅ | ✅ iOS 15+ |
| Android Chrome | ✅ Native | ✅ | ✅ + haptics | ✅ |
| Desktop | ✅ Native | ✅ | Mouse drag | ✅ |

## 🧪 Testing

```bash
npm test              # Watch mode
npm run test:run     # Single run
npm run lint         # ESLint
```

## 📁 Project Structure

```
src/
├── components/       # UI components
├── hooks/           # Custom React hooks
├── pages/           # Route pages
├── store/           # Zustand stores (IndexedDB)
├── utils/           # Utility functions
└── __tests__/       # Unit tests
```

## 📄 License

MIT
