import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import Layout from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { useBackHandler } from './hooks/useBackHandler';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const SwipePage = lazy(() => import('./pages/SwipePage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

function App() {
  useTheme(); // Initialize theme
  useBackHandler(); // Setup back button interception

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
              <HomePage />
            </Suspense>
          } />
          <Route path="swipe" element={
            <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
              <SwipePage />
            </Suspense>
          } />
          <Route path="library" element={
            <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
              <LibraryPage />
            </Suspense>
          } />
          <Route path="stats" element={
            <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
              <StatsPage />
            </Suspense>
          } />
          <Route path="*" element={<div className="flex h-full items-center justify-center">404 - Not Found</div>} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;