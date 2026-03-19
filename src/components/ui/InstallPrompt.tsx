import { useState } from 'react';
import { Share } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function InstallPrompt() {
  const { canInstall, isIOS, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!canInstall && !isIOS) return null;

  const handleInstall = async () => {
    await install();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-brand-500 text-white p-4 rounded-xl shadow-xl flex flex-col gap-3 mx-auto max-w-sm animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-sm">Install Music Selector</h3>
          <p className="text-xs opacity-90 mt-1">
            {isIOS 
              ? 'Install for fullscreen gesture support and offline access.'
              : 'Add to your home screen for the best experience.'}
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-black/10 rounded-full transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {isIOS ? (
        <div className="bg-black/20 p-3 rounded-lg flex items-center gap-3 text-xs font-medium">
          <Share size={16} />
          <span>Tap Share, then 'Add to Home Screen'</span>
        </div>
      ) : (
        <button 
          onClick={handleInstall}
          className="bg-white text-brand-600 font-bold py-2 px-4 rounded-lg w-full hover:bg-white/90 transition-colors text-sm"
        >
          Install App
        </button>
      )}
    </div>
  );
}
