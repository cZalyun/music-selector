import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { TabFilter, SortField, SortDirection, GroupBy } from '@/types';

interface FilterChipsProps {
  tab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onDirectionToggle: () => void;
  groupBy: GroupBy;
  onGroupChange: (group: GroupBy) => void;
  counts: { all: number; liked: number; disliked: number; unreviewed: number };
}

const TABS: TabFilter[] = ['all', 'liked', 'disliked', 'unreviewed'];
const SORT_FIELDS: SortField[] = ['index', 'title', 'artist', 'duration'];
const GROUP_OPTIONS: GroupBy[] = ['none', 'artist', 'album', 'duration', 'status'];

export function FilterChips({
  tab,
  onTabChange,
  sortField,
  sortDirection,
  onSortChange,
  onDirectionToggle,
  groupBy,
  onGroupChange,
  counts,
}: FilterChipsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {/* Tab filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {TABS.map((tabKey) => {
          const count = counts[tabKey];
          const isActive = tab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => onTabChange(tabKey)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-800 text-surface-400 hover:text-surface-200'
              }`}
              aria-pressed={isActive}
            >
              {t(`library.tabs.${tabKey}`)} ({count})
            </button>
          );
        })}
      </div>

      {/* Sort + Group row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort buttons */}
        <div className="flex items-center gap-1">
          {SORT_FIELDS.map((field) => (
            <button
              key={field}
              onClick={() => onSortChange(field)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                sortField === field
                  ? 'bg-surface-700 text-surface-100'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
              aria-pressed={sortField === field}
            >
              {t(`library.sort.${field}`)}
            </button>
          ))}
          <button
            onClick={onDirectionToggle}
            className="p-1 text-surface-400 hover:text-surface-200 transition-colors"
            aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
          >
            {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </button>
        </div>

        {/* Group buttons */}
        <div className="flex items-center gap-1 min-[501px]:ml-auto">
          {GROUP_OPTIONS.map((group) => (
            <button
              key={group}
              onClick={() => onGroupChange(group)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                groupBy === group
                  ? 'bg-surface-700 text-surface-100'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
              aria-pressed={groupBy === group}
            >
              {t(`library.group.${group}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
