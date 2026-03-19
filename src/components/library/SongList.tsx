import { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SongRow from './SongRow';
import { useGroupedSongs, FilterState, useLibraryFilters } from '../../hooks/useLibraryFilters';
import type { Song } from '../../types';

interface SongListProps {
  songs: Song[];
  filters: FilterState;
}

export default function SongList({ songs, filters }: SongListProps) {
  const filteredSongs = useLibraryFilters(songs, filters);
  const groups = useGroupedSongs(filteredSongs, filters.group);
  
  const parentRef = useRef<HTMLDivElement>(null);

  if (filteredSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-surface-500">
        <p>No songs match your filters.</p>
      </div>
    );
  }

  if (filters.group === 'none') {
    return <FlatList songs={filteredSongs} parentRef={parentRef} />;
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      {groups.map((group) => (
        <CollapsibleGroup key={group.name} name={group.name} songs={group.songs} />
      ))}
    </div>
  );
}

function FlatList({ songs, parentRef }: { songs: Song[], parentRef: React.RefObject<HTMLDivElement | null> }) {
  const virtualizer = useVirtualizer({
    count: songs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // approximate height of SongRow
    overscan: 10,
  });

  return (
    <div 
      ref={parentRef} 
      className="h-full overflow-y-auto w-full pb-20"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <SongRow 
              song={songs[virtualItem.index]} 
              index={virtualItem.index} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CollapsibleGroup({ name, songs }: { name: string; songs: Song[] }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-surface-100 dark:bg-surface-900 rounded-xl overflow-hidden mx-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-surface-200/50 dark:bg-surface-800/50 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-surface-900 dark:text-surface-50">{name}</h3>
          <span className="text-xs font-medium bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-2 py-0.5 rounded-full">
            {songs.length}
          </span>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-surface-500" /> : <ChevronDown size={20} className="text-surface-500" />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-2">
              {songs.map((song, i) => (
                <SongRow key={song.index} song={song} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
