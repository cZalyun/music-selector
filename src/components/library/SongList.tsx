import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SongRow from './SongRow';
import type { SongGroup } from '../../utils/grouping';

interface SongListProps {
  groups: SongGroup[];
}

export default function SongList({ groups }: SongListProps) {
  const isSingleGroup = groups.length === 1 && groups[0].label === 'All Songs';

  if (isSingleGroup) {
    const songs = groups[0].songs;
    if (songs.length === 0) return <EmptyState />;
    return (
      <div className="space-y-1">
        {songs.map((song, i) => (
          <SongRow key={song.index} song={song} index={i} />
        ))}
      </div>
    );
  }

  if (groups.length === 0) return <EmptyState />;

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <CollapsibleGroup key={group.label} group={group} />
      ))}
    </div>
  );
}

function CollapsibleGroup({ group }: { group: SongGroup }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl bg-surface-900/40 border border-surface-800/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-800/40 transition-colors"
      >
        {isOpen ? <ChevronDown size={14} className="text-surface-500" /> : <ChevronRight size={14} className="text-surface-500" />}
        <span className="text-sm font-medium text-surface-200 flex-1 truncate">{group.label}</span>
        <span className="text-[10px] text-surface-500 bg-surface-800 px-1.5 py-0.5 rounded-md">
          {group.songs.length}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-1 space-y-0.5">
              {group.songs.map((song, i) => (
                <SongRow key={song.index} song={song} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-3">
        <span className="text-3xl">🔍</span>
      </div>
      <p className="text-surface-400 text-sm">No songs match your filters</p>
    </div>
  );
}
