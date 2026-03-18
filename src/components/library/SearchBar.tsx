import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search songs, artists, albums..."
        className="w-full pl-9 pr-9 py-2.5 bg-surface-800/80 border border-surface-700/50 rounded-xl text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-accent-600/50 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
