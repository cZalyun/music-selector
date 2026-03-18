import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import StatsDashboard from '../components/stats/StatsDashboard';
import ExportPanel from '../components/stats/ExportPanel';
import { useSongStore } from '../store/songStore';
import { useSettingsStore } from '../store/settingsStore';

export default function StatsPage() {
  const songs = useSongStore((s) => s.songs);
  const { autoplay, toggleAutoplay } = useSettingsStore();

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-4 space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-bold text-surface-100"
      >
        Settings
      </motion.h1>

      {/* Settings */}
      <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {autoplay ? (
              <Volume2 size={18} className="text-accent-400" />
            ) : (
              <VolumeX size={18} className="text-surface-500" />
            )}
            <div>
              <p className="text-sm font-medium text-surface-200">Autoplay</p>
              <p className="text-[11px] text-surface-500">Automatically play songs while swiping</p>
            </div>
          </div>
          <button
            onClick={toggleAutoplay}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              autoplay ? 'bg-accent-600' : 'bg-surface-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoplay ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats — only show if songs loaded */}
      {songs.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-surface-300">Statistics</h2>
          <StatsDashboard />
        </>
      )}

      <div>
        <h2 className="text-sm font-medium text-surface-300 mb-3">Export & Data</h2>
        <ExportPanel />
      </div>
    </div>
  );
}
