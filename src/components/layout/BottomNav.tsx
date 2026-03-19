import { NavLink } from 'react-router';
import { Upload, PlaySquare, Library, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const { t } = useTranslation();
  
  const navItems = [
    { to: '/', icon: Upload, label: t('nav.upload') },
    { to: '/swipe', icon: PlaySquare, label: t('nav.swipe') },
    { to: '/library', icon: Library, label: t('nav.library') },
    { to: '/stats', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-md border-t border-surface-200 dark:border-surface-800"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto max-w-lg">
        <ul className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                    isActive ? 'text-brand-500' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-50'
                  }`
                }
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
