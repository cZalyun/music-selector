import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { ErrorBoundary } from './ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ToastContainer } from '@/components/ui/Toast';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { SkipToContent } from '@/components/ui/SkipToContent';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { usePlayerStore } from '@/store/playerStore';
import { PAGE_TRANSITION_MS } from '@/constants';

interface LayoutProps {
  children: React.ReactNode;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50dvh]">
      <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const hasPlayer = usePlayerStore((s) => s.currentVideoId !== null);

  return (
    <>
      <SkipToContent />
      <OfflineBanner />
      <ToastContainer />

      <main
        id="main-content"
        className="flex-1"
        style={{
          paddingBottom: hasPlayer
            ? 'calc(10rem + env(safe-area-inset-bottom, 0px))'
            : 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: PAGE_TRANSITION_MS / 1000 }}
            className="h-full"
          >
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                {children}
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      <MiniPlayer />
      <InstallPrompt />
      <BottomNav />
    </>
  );
}
