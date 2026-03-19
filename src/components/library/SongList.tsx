import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SongRow } from './SongRow';
import type { Song, SongGroup } from '@/types';
import type { FilteredSong } from '@/utils/search';

interface SongListProps {
  songs: FilteredSong[];
  groups: SongGroup[] | null;
  activeSongIndex: number | null;
  searchQuery: string;
  onPlay: (song: Song) => void;
}

export function SongList({ songs, groups, activeSongIndex, searchQuery, onPlay }: SongListProps) {
  const { t } = useTranslation();

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-surface-500 text-sm">
        {t('library.noResults')}
      </div>
    );
  }

  if (groups) {
    return (
      <div className="h-full overflow-y-auto space-y-2">
        {groups.map((group) => (
          <CollapsibleGroup
            key={group.label}
            group={group}
            activeSongIndex={activeSongIndex}
            searchQuery={searchQuery}
            onPlay={onPlay}
          />
        ))}
      </div>
    );
  }

  return (
    <VirtualizedList
      songs={songs}
      activeSongIndex={activeSongIndex}
      searchQuery={searchQuery}
      onPlay={onPlay}
    />
  );
}

function VirtualizedList({
  songs,
  activeSongIndex,
  searchQuery,
  onPlay,
}: {
  songs: FilteredSong[];
  activeSongIndex: number | null;
  searchQuery: string;
  onPlay: (song: Song) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: songs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const song = songs[virtualRow.index];
          if (!song) return null;
          return (
            <div
              key={song.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <SongRow
                song={song}
                selectionStatus={song.selectionStatus}
                isActive={activeSongIndex === song.index}
                searchQuery={searchQuery}
                onPlay={onPlay}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollapsibleGroup({
  group,
  activeSongIndex,
  searchQuery,
  onPlay,
}: {
  group: SongGroup;
  activeSongIndex: number | null;
  searchQuery: string;
  onPlay: (song: Song) => void;
}) {
  const [open, setOpen] = useState(true);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div className="bg-surface-800/50 rounded-xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-800 transition-colors"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown size={14} className="text-surface-500 shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-surface-500 shrink-0" />
        )}
        <span className="text-sm font-medium text-surface-200 truncate flex-1">
          {group.label}
        </span>
        <span className="text-xs text-surface-500">{group.songs.length}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-1">
              {(group.songs as FilteredSong[]).map((song) => (
                <SongRow
                  key={song.index}
                  song={song}
                  selectionStatus={song.selectionStatus}
                  isActive={activeSongIndex === song.index}
                  searchQuery={searchQuery}
                  onPlay={onPlay}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
