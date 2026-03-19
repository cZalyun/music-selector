import { useSelectionStore } from '../../store/selectionStore';
import { useSongStore } from '../../store/songStore';
import { FilterState, FilterTab, SortOption, GroupOption } from '../../hooks/useLibraryFilters';
import { ArrowDown, ArrowUp, Hash, Clock, Type, User } from 'lucide-react';

interface FilterChipsProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterChips({ filters, onChange }: FilterChipsProps) {
  const { songs } = useSongStore();
  const { selections } = useSelectionStore();

  const counts = {
    all: songs.length,
    liked: Object.values(selections).filter(s => s.status === 'liked').length,
    disliked: Object.values(selections).filter(s => s.status === 'disliked').length,
    unreviewed: songs.length - Object.keys(selections).length,
  };

  const updateFilter = (updates: Partial<FilterState>) => {
    onChange({ ...filters, ...updates });
  };

  const tabs: { id: FilterTab; label: string; count: number; color?: string }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'liked', label: 'Liked', count: counts.liked, color: 'text-accent-500 bg-accent-500/10 border-accent-500/20' },
    { id: 'disliked', label: 'Disliked', count: counts.disliked, color: 'text-brand-500 bg-brand-500/10 border-brand-500/20' },
    { id: 'unreviewed', label: 'Unreviewed', count: counts.unreviewed, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  ];

  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'index', label: '#', icon: <Hash size={14} /> },
    { id: 'title', label: 'Title', icon: <Type size={14} /> },
    { id: 'artist', label: 'Artist', icon: <User size={14} /> },
    { id: 'duration', label: 'Length', icon: <Clock size={14} /> },
  ];

  const groupOptions: { id: GroupOption; label: string }[] = [
    { id: 'none', label: 'No Grouping' },
    { id: 'artist', label: 'Artist' },
    { id: 'album', label: 'Album' },
    { id: 'duration', label: 'Duration' },
    { id: 'status', label: 'Status' },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 mb-4">
      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => updateFilter({ tab: tab.id })}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
              filters.tab === tab.id 
                ? tab.color || 'bg-surface-800 text-surface-50 border-surface-800 dark:bg-surface-200 dark:text-surface-900 dark:border-surface-200' 
                : 'bg-surface-100 text-surface-600 border-surface-200 hover:bg-surface-200 dark:bg-surface-900 dark:text-surface-400 dark:border-surface-800 dark:hover:bg-surface-800'
            }`}
          >
            {tab.label}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-y-3 gap-x-4 items-center">
        {/* Sort */}
        <div className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-900 p-1 rounded-lg border border-surface-200 dark:border-surface-800">
          <span className="text-xs font-medium text-surface-500 pl-2 uppercase tracking-wider">Sort</span>
          <div className="flex gap-1">
            {sortOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (filters.sort === opt.id) {
                    updateFilter({ sortDesc: !filters.sortDesc });
                  } else {
                    updateFilter({ sort: opt.id, sortDesc: false });
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  filters.sort === opt.id 
                    ? 'bg-surface-800 text-surface-50 dark:bg-surface-200 dark:text-surface-900' 
                    : 'text-surface-600 hover:bg-surface-200 dark:text-surface-400 dark:hover:bg-surface-800'
                }`}
              >
                {opt.icon}
                <span className="hidden sm:inline">{opt.label}</span>
                {filters.sort === opt.id && (
                  filters.sortDesc ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Group */}
        <div className="flex items-center gap-1.5 bg-surface-100 dark:bg-surface-900 p-1 rounded-lg border border-surface-200 dark:border-surface-800">
          <span className="text-xs font-medium text-surface-500 pl-2 uppercase tracking-wider">Group</span>
          <select 
            value={filters.group}
            onChange={(e) => updateFilter({ group: e.target.value as GroupOption })}
            className="bg-transparent text-xs font-medium text-surface-700 dark:text-surface-300 outline-none pr-2 py-1 cursor-pointer appearance-none"
          >
            {groupOptions.map(opt => (
              <option key={opt.id} value={opt.id} className="bg-surface-50 dark:bg-surface-950">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
