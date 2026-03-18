import { NavLink } from 'react-router-dom';
import { Upload, Disc3, Library, Settings } from 'lucide-react';

const links = [
  { to: '/', icon: Upload, label: 'Upload' },
  { to: '/swipe', icon: Disc3, label: 'Swipe' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/stats', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-900/95 backdrop-blur-md border-t border-surface-700/50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-accent-400'
                  : 'text-surface-400 hover:text-surface-200'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
