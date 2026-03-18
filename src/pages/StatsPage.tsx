import { motion } from 'framer-motion';
import { Volume2, VolumeX, Repeat, Repeat1, ListMusic, Shuffle, EyeOff, Eye } from 'lucide-react';
import StatsDashboard from '../components/stats/StatsDashboard';
import ExportPanel from '../components/stats/ExportPanel';
import { useSongStore } from '../store/songStore';
import { useSettingsStore } from '../store/settingsStore';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        on ? 'bg-accent-600' : 'bg-surface-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingRow({ icon, title, description, control }: { icon: React.ReactNode; title: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-200">{title}</p>
          <p className="text-[11px] text-surface-500">{description}</p>
        </div>
      </div>
      {control}
    </div>
  );
}

export default function StatsPage() {
  const songs = useSongStore((s) => s.songs);
  const {
    autoplay, toggleAutoplay,
    loopMode, cycleLoopMode,
    autoContinue, toggleAutoContinue,
    shufflePlayback, toggleShufflePlayback,
    hideExplicit, toggleHideExplicit,
  } = useSettingsStore();

  const loopLabel = loopMode === 'off' ? 'Off' : loopMode === 'one' ? 'Repeat One' : 'Repeat All';
  const LoopIcon = loopMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-4 space-y-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg font-bold text-surface-100"
      >
        Settings
      </motion.h1>

      {/* Playback */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-medium text-surface-400 uppercase tracking-wider px-1">Playback</h2>
        <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40 space-y-4">
          <SettingRow
            icon={autoplay ? <Volume2 size={18} className="text-accent-400" /> : <VolumeX size={18} className="text-surface-500" />}
            title="Autoplay"
            description="Auto-play songs while swiping"
            control={<Toggle on={autoplay} onToggle={toggleAutoplay} />}
          />
          <SettingRow
            icon={<LoopIcon size={18} className={loopMode !== 'off' ? 'text-accent-400' : 'text-surface-500'} />}
            title={`Loop: ${loopLabel}`}
            description="Off → Repeat One → Repeat All"
            control={
              <button onClick={cycleLoopMode} className="px-3 py-1.5 text-xs font-medium bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors text-surface-200">
                {loopLabel}
              </button>
            }
          />
          <SettingRow
            icon={<ListMusic size={18} className={autoContinue ? 'text-accent-400' : 'text-surface-500'} />}
            title="Auto-Continue"
            description="Play next song when current ends"
            control={<Toggle on={autoContinue} onToggle={toggleAutoContinue} />}
          />
          <SettingRow
            icon={<Shuffle size={18} className={shufflePlayback ? 'text-accent-400' : 'text-surface-500'} />}
            title="Shuffle"
            description="Randomize next song order"
            control={<Toggle on={shufflePlayback} onToggle={toggleShufflePlayback} />}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-medium text-surface-400 uppercase tracking-wider px-1">Content</h2>
        <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40 space-y-4">
          <SettingRow
            icon={hideExplicit ? <EyeOff size={18} className="text-rose-400" /> : <Eye size={18} className="text-surface-500" />}
            title="Hide Explicit"
            description="Hide explicit songs from library & swipe"
            control={<Toggle on={hideExplicit} onToggle={toggleHideExplicit} />}
          />
        </div>
      </div>

      {/* Stats — only show if songs loaded */}
      {songs.length > 0 && (
        <div className="space-y-1.5">
          <h2 className="text-xs font-medium text-surface-400 uppercase tracking-wider px-1">Statistics</h2>
          <StatsDashboard />
        </div>
      )}

      <div className="space-y-1.5">
        <h2 className="text-xs font-medium text-surface-400 uppercase tracking-wider px-1">Export & Data</h2>
        <ExportPanel />
      </div>
    </div>
  );
}
