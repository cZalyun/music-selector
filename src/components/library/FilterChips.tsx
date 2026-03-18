import type { LibraryTab, GroupBy, SortField, SortDirection } from '../../types';
import { ArrowUpDown, Layers } from 'lucide-react';

interface FilterChipsProps {
  tab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onDirectionToggle: () => void;
  counts: { all: number; liked: number; disliked: number; unreviewed: number };
}

const tabs: { value: LibraryTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'liked', label: 'Liked' },
  { value: 'disliked', label: 'Disliked' },
  { value: 'unreviewed', label: 'Unreviewed' },
];

const groups: { value: GroupBy; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'artist', label: 'Artist' },
  { value: 'album', label: 'Album' },
  { value: 'duration', label: 'Duration' },
  { value: 'status', label: 'Status' },
];

const sorts: { value: SortField; label: string }[] = [
  { value: 'index', label: '#' },
  { value: 'title', label: 'Title' },
  { value: 'primaryArtist', label: 'Artist' },
  { value: 'durationSeconds', label: 'Duration' },
];

export default function FilterChips({
  tab, onTabChange, groupBy, onGroupByChange,
  sortField, onSortChange, sortDirection, onDirectionToggle, counts,
}: FilterChipsProps) {
  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t) => {
          const count = counts[t.value];
          return (
            <button
              key={t.value}
              onClick={() => onTabChange(t.value)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.value
                  ? 'bg-accent-600 text-white'
                  : 'bg-surface-800 text-surface-400 hover:text-surface-200'
              }`}
            >
              {t.label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-[10px] text-surface-500 uppercase tracking-wider">
          <ArrowUpDown size={10} />
          Sort
        </div>
        {sorts.map((s) => (
          <button
            key={s.value}
            onClick={() => onSortChange(s.value)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              sortField === s.value
                ? 'bg-surface-700 text-surface-100'
                : 'text-surface-500 hover:text-surface-300'
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={onDirectionToggle}
          className="px-1.5 py-1 rounded text-[11px] text-surface-500 hover:text-surface-300"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>

        <div className="hidden min-[501px]:block w-px h-4 bg-surface-700 mx-1" />

        {/* Group — separate line on small screens */}
        <div className="flex items-center gap-2 basis-full min-[501px]:basis-auto">
          <div className="flex items-center gap-1 text-[10px] text-surface-500 uppercase tracking-wider">
            <Layers size={10} />
            Group
          </div>
          {groups.map((g) => (
            <button
              key={g.value}
              onClick={() => onGroupByChange(g.value)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                groupBy === g.value
                  ? 'bg-surface-700 text-surface-100'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
