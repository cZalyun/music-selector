import { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { useTheme } from '@/hooks/useTheme';
import { useBackButton } from '@/hooks/useBackButton';

const HomePage = lazy(() => import('@/pages/HomePage'));
const SwipePage = lazy(() => import('@/pages/SwipePage'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));

function AppInner() {
  useTheme();
  useBackButton();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppInner />
      </HashRouter>
    </ErrorBoundary>
  );
}
