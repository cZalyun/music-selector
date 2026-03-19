import { NavLink } from 'react-router-dom';
import { Upload, Heart, Library, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { to: '/', icon: Upload, labelKey: 'nav.upload' },
  { to: '/swipe', icon: Heart, labelKey: 'nav.swipe' },
  { to: '/library', icon: Library, labelKey: 'nav.library' },
  { to: '/stats', icon: Settings, labelKey: 'nav.settings' },
] as const;

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-900/95 backdrop-blur-sm border-t border-surface-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label={t('nav.upload')}
    >
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-accent-400'
                  : 'text-surface-400 hover:text-surface-200'
              }`
            }
            aria-label={t(labelKey)}
          >
            <Icon size={20} />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
