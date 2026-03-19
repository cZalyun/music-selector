import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative mb-4 mx-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2.5 bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow outline-none text-surface-900 dark:text-surface-50 placeholder-surface-500"
        placeholder="Search title, artist, or album..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
