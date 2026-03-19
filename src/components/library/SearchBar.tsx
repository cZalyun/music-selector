import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('library.search')}
        className="w-full pl-9 pr-9 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-accent-500 transition-colors"
        aria-label={t('library.search')}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors"
          aria-label={t('library.clearSearch')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
