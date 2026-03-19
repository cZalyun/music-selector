import { useSettingsStore } from '../store/settingsStore';
import { useSongStore } from '../store/songStore';
import StatsDashboard from '../components/stats/StatsDashboard';
import ExportPanel from '../components/stats/ExportPanel';
import { PlaySquare, Repeat, Shuffle, EyeOff, Moon, Sun, Monitor } from 'lucide-react';

export default function StatsPage() {
  const { songs } = useSongStore();
  const { 
    autoplay, toggleAutoplay,
    loopMode, cycleLoopMode,
    autoContinue, toggleAutoContinue,
    shufflePlayback, toggleShufflePlayback,
    hideExplicit, toggleHideExplicit,
    theme, setTheme
  } = useSettingsStore();

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto pb-20">
      <div className="p-4 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Settings & Stats</h1>
        
        {/* Playback Settings */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-surface-900 dark:text-surface-50">Playback</h2>
          <div className="bg-surface-100 dark:bg-surface-900 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800">
            
            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-3">
                <PlaySquare size={20} className="text-surface-500" />
                <div>
                  <div className="font-medium text-surface-900 dark:text-surface-50">Autoplay</div>
                  <div className="text-xs text-surface-500">Play songs immediately on swipe</div>
                </div>
              </div>
              <input type="checkbox" className="toggle" checked={autoplay} onChange={toggleAutoplay} />
            </label>

            <button onClick={cycleLoopMode} className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-200 dark:border-surface-800 text-left">
              <div className="flex items-center gap-3">
                <Repeat size={20} className="text-surface-500" />
                <div>
                  <div className="font-medium text-surface-900 dark:text-surface-50">Loop Mode</div>
                  <div className="text-xs text-surface-500">Current: <span className="font-bold text-brand-500 uppercase">{loopMode}</span></div>
                </div>
              </div>
            </button>

            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-3">
                <PlaySquare size={20} className="text-surface-500" />
                <div>
                  <div className="font-medium text-surface-900 dark:text-surface-50">Auto-Continue</div>
                  <div className="text-xs text-surface-500">Play next song when current ends</div>
                </div>
              </div>
              <input type="checkbox" className="toggle" checked={autoContinue} onChange={toggleAutoContinue} />
            </label>

            <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shuffle size={20} className="text-surface-500" />
                <div>
                  <div className="font-medium text-surface-900 dark:text-surface-50">Shuffle Playback</div>
                  <div className="text-xs text-surface-500">Randomize next song selection</div>
                </div>
              </div>
              <input type="checkbox" className="toggle" checked={shufflePlayback} onChange={toggleShufflePlayback} />
            </label>

          </div>
        </section>

        {/* Display Settings */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-surface-900 dark:text-surface-50">Display</h2>
          <div className="bg-surface-100 dark:bg-surface-900 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-800 p-4">
            
            <div className="mb-4">
              <div className="font-medium text-surface-900 dark:text-surface-50 mb-2">Theme</div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${theme === 'light' ? 'bg-surface-800 text-surface-50 border-surface-800 dark:bg-surface-200 dark:text-surface-900 dark:border-surface-200' : 'bg-surface-50 dark:bg-surface-950 text-surface-600 border-surface-200 dark:border-surface-800'}`}
                >
                  <Sun size={20} />
                  <span className="text-xs font-medium">Light</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-surface-800 text-surface-50 border-surface-800 dark:bg-surface-200 dark:text-surface-900 dark:border-surface-200' : 'bg-surface-50 dark:bg-surface-950 text-surface-600 border-surface-200 dark:border-surface-800'}`}
                >
                  <Moon size={20} />
                  <span className="text-xs font-medium">Dark</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${theme === 'system' ? 'bg-surface-800 text-surface-50 border-surface-800 dark:bg-surface-200 dark:text-surface-900 dark:border-surface-200' : 'bg-surface-50 dark:bg-surface-950 text-surface-600 border-surface-200 dark:border-surface-800'}`}
                >
                  <Monitor size={20} />
                  <span className="text-xs font-medium">System</span>
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between cursor-pointer border-t border-surface-200 dark:border-surface-800 pt-4 mt-4">
              <div className="flex items-center gap-3">
                <EyeOff size={20} className="text-surface-500" />
                <div>
                  <div className="font-medium text-surface-900 dark:text-surface-50">Hide Explicit</div>
                  <div className="text-xs text-surface-500">Remove explicit tracks from queue & library</div>
                </div>
              </div>
              <input type="checkbox" className="toggle" checked={hideExplicit} onChange={toggleHideExplicit} />
            </label>

          </div>
        </section>
      </div>

      {songs.length > 0 && (
        <>
          <StatsDashboard />
          <ExportPanel />
        </>
      )}
    </div>
  );
}
