import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import MiniPlayer from '../player/MiniPlayer';
import ToastContainer from '../ui/Toast';
import InstallPrompt from '../ui/InstallPrompt';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-dvh bg-surface-950 text-surface-100">
      <ToastContainer />
      <InstallPrompt />
      <main className="flex-1 pb-36 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}
