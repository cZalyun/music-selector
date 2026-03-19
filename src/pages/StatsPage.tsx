import { useTranslation } from 'react-i18next';
import {
  Play,
  Repeat,
  Repeat1,
  SkipForward,
  Shuffle,
  EyeOff,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { StatsDashboard } from '@/components/stats/StatsDashboard';
import { ExportPanel } from '@/components/stats/ExportPanel';
import { useSongStore } from '@/store/songStore';
import { useSelectionStore } from '@/store/selectionStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { Theme } from '@/types';

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; labelKey: string }[] = [
  { value: 'dark', icon: Moon, labelKey: 'settings.appearance.themeDark' },
  { value: 'light', icon: Sun, labelKey: 'settings.appearance.themeLight' },
  { value: 'system', icon: Monitor, labelKey: 'settings.appearance.themeSystem' },
];

export default function StatsPage() {
  const { t } = useTranslation();
  const songs = useSongStore((s) => s.songs);
  const selections = useSelectionStore((s) => s.selections);

  const autoplay = useSettingsStore((s) => s.autoplay);
  const loopMode = useSettingsStore((s) => s.loopMode);
  const autoContinue = useSettingsStore((s) => s.autoContinue);
  const shufflePlayback = useSettingsStore((s) => s.shufflePlayback);
  const hideExplicit = useSettingsStore((s) => s.hideExplicit);
  const theme = useSettingsStore((s) => s.theme);

  const toggleAutoplay = useSettingsStore((s) => s.toggleAutoplay);
  const cycleLoopMode = useSettingsStore((s) => s.cycleLoopMode);
  const toggleAutoContinue = useSettingsStore((s) => s.toggleAutoContinue);
  const toggleShufflePlayback = useSettingsStore((s) => s.toggleShufflePlayback);
  const toggleHideExplicit = useSettingsStore((s) => s.toggleHideExplicit);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const loopLabel =
    loopMode === 'off' ? t('player.loop.off') :
    loopMode === 'one' ? t('player.loop.one') :
    t('player.loop.all');

  const LoopIcon = loopMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-6 pb-4">
      {/* Settings */}
      <section>
        <h2 className="text-lg font-bold text-surface-100 mb-4">{t('settings.title')}</h2>

        {/* Playback */}
        <div className="bg-surface-800 rounded-2xl border border-surface-700 divide-y divide-surface-700">
          <div className="px-4 py-3">
            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider">
              {t('settings.playback.title')}
            </h3>
          </div>

          <SettingToggle
            icon={Play}
            label={t('settings.playback.autoplay')}
            active={autoplay}
            onToggle={toggleAutoplay}
          />
          <SettingButton
            icon={LoopIcon}
            label={t('settings.playback.loopMode')}
            value={loopLabel}
            active={loopMode !== 'off'}
            onClick={cycleLoopMode}
          />
          <SettingToggle
            icon={SkipForward}
            label={t('settings.playback.autoContinue')}
            active={autoContinue}
            onToggle={toggleAutoContinue}
          />
          <SettingToggle
            icon={Shuffle}
            label={t('settings.playback.shuffle')}
            active={shufflePlayback}
            onToggle={toggleShufflePlayback}
          />
        </div>

        {/* Content */}
        <div className="bg-surface-800 rounded-2xl border border-surface-700 divide-y divide-surface-700 mt-3">
          <div className="px-4 py-3">
            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider">
              {t('settings.content.title')}
            </h3>
          </div>
          <SettingToggle
            icon={EyeOff}
            label={t('settings.content.hideExplicit')}
            active={hideExplicit}
            onToggle={toggleHideExplicit}
          />
        </div>

        {/* Appearance */}
        <div className="bg-surface-800 rounded-2xl border border-surface-700 divide-y divide-surface-700 mt-3">
          <div className="px-4 py-3">
            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider">
              {t('settings.appearance.title')}
            </h3>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-surface-200 mb-2">{t('settings.appearance.theme')}</p>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    theme === value
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface-700 text-surface-400 hover:text-surface-200'
                  }`}
                  aria-pressed={theme === value}
                >
                  <Icon size={14} />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {songs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-surface-100 mb-4">{t('stats.title')}</h2>
          <StatsDashboard songs={songs} selections={selections} />
        </section>
      )}

      {/* Export */}
      <section>
        <ExportPanel />
      </section>
    </div>
  );
}

function SettingToggle({
  icon: Icon,
  label,
  active,
  onToggle,
}: {
  icon: typeof Play;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-700/50 transition-colors"
    >
      <Icon size={16} className={active ? 'text-accent-400' : 'text-surface-500'} />
      <span className="text-sm text-surface-200 flex-1 text-left">{label}</span>
      <div
        className={`w-10 h-6 rounded-full transition-colors relative ${
          active ? 'bg-accent-500' : 'bg-surface-600'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            active ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  );
}

function SettingButton({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-700/50 transition-colors"
    >
      <Icon size={16} className={active ? 'text-accent-400' : 'text-surface-500'} />
      <span className="text-sm text-surface-200 flex-1 text-left">{label}</span>
      <span className="text-xs text-surface-400">{value}</span>
    </button>
  );
}
