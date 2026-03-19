# Music Selector

A mobile-first Progressive Web App for reviewing, curating, and managing your YouTube Music liked songs library using a Tinder-style swipe interface.

## Features

- **Swipe Review** — Right to like, left to dislike, up to skip. Keyboard shortcuts: `→` `←` `↑` `Space` `Z`
- **Music Player** — Embedded YouTube player with seek, volume, loop, auto-continue, shuffle, and lock screen controls
- **Library** — Search, filter, sort, group your songs. Virtualized list for performance
- **Stats** — Review progress, top artists/albums charts, export liked songs as CSV
- **PWA** — Installable, works offline, background updates
- **Accessibility** — WCAG 2.2 AA: keyboard nav, ARIA labels, focus-visible, skip-to-content, screen reader support
- **i18n** — Internationalization-ready with `react-i18next`
- **Cross-platform** — iOS Safari, Android Chrome, macOS, Windows, with safe-area insets and platform-specific optimizations

## Tech Stack

- **React 19** + TypeScript
- **Vite** with PWA plugin (Workbox service worker)
- **TailwindCSS v4** with custom dark/light theme
- **Zustand** with IndexedDB persistence (`idb-keyval`)
- **Framer Motion** for animations
- **PapaParse** for CSV parsing
- **@tanstack/react-virtual** for virtualized lists
- **Vitest** for unit testing

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run lint` | ESLint check |

## Project Structure

```
src/
├── components/
│   ├── layout/        # Layout, BottomNav, ErrorBoundary
│   ├── swipe/         # CardStack, SwipeCard, SwipeControls
│   ├── player/        # MiniPlayer (YouTube IFrame)
│   ├── library/       # SearchBar, FilterChips, SongList, SongRow
│   ├── stats/         # StatsDashboard, ExportPanel
│   ├── upload/        # DropZone (CSV import)
│   └── ui/            # Toast, ConfirmModal, InstallPrompt, SkipToContent
├── hooks/             # usePWAInstall, useTheme, useBackButton
├── i18n/              # i18next config + locale files
├── pages/             # HomePage, SwipePage, LibraryPage, StatsPage
├── store/             # Zustand stores (IndexedDB-backed)
├── types/             # TypeScript types
├── utils/             # csv, playerBridge, search, grouping, thumbnail, imageQueue
└── __tests__/         # Unit tests
```

## Platform Support

| Platform | Install | Audio | Gestures | Lock Screen |
|---|---|---|---|---|
| iOS Safari | Manual guide | ✅ | ✅ | ✅ iOS 15+ |
| Android Chrome | Native prompt | ✅ | ✅ + haptics | ✅ |
| macOS Safari/Chrome | Native prompt | ✅ | ✅ | ✅ |
| Windows Chrome/Edge | Native prompt | ✅ + volume | Mouse drag | ✅ |

## License

MIT
