import { Outlet } from 'react-router';
import BottomNav from './BottomNav';
import MiniPlayer from '../player/MiniPlayer';
import OfflineBanner from '../ui/OfflineBanner';
import ToastContainer from '../ui/ToastContainer';
import InstallPrompt from '../ui/InstallPrompt';

export default function Layout() {
  return (
    <div className="flex h-full w-full flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50">
      <OfflineBanner />
      <ToastContainer />
      <InstallPrompt />
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-lg relative w-full pb-16">
          <Outlet />
        </div>
      </main>
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}
