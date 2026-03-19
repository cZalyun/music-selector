import { useState } from 'react';
import { useSongStore } from '../store/songStore';
import { usePlayerStore } from '../store/playerStore';
import { loadVideoFromGesture } from '../utils/playerBridge';
import SearchBar from '../components/library/SearchBar';
import FilterChips from '../components/library/FilterChips';
import SongList from '../components/library/SongList';
import { FilterState } from '../hooks/useLibraryFilters';
import { Shuffle } from 'lucide-react';
import { useLibraryFilters } from '../hooks/useLibraryFilters';

export default function LibraryPage() {
  const { songs } = useSongStore();
  const { setCurrentSong } = usePlayerStore();
  
  const [filters, setFilters] = useState<FilterState>({
    tab: 'all',
    search: '',
    sort: 'index',
    sortDesc: false,
    group: 'none',
  });

  const filteredSongs = useLibraryFilters(songs, filters);

  const handleShufflePlay = () => {
    if (filteredSongs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    const song = filteredSongs[randomIndex];
    loadVideoFromGesture(song.videoId, true);
    setCurrentSong(song.videoId, song.index, true);
  };

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 bg-surface-200 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">📚</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Library is Empty</h2>
        <p className="text-surface-500 max-w-xs mx-auto">
          Upload a CSV file on the Home tab to see your songs here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full pt-4">
      <div className="flex items-center justify-between px-4 mb-4">
        <h1 className="text-2xl font-bold">Library</h1>
        <button
          onClick={handleShufflePlay}
          disabled={filteredSongs.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Shuffle size={14} />
          Shuffle Play
        </button>
      </div>

      <SearchBar 
        value={filters.search} 
        onChange={(search) => setFilters(prev => ({ ...prev, search }))} 
      />
      
      <FilterChips 
        filters={filters} 
        onChange={setFilters} 
      />

      {/* Results count */}
      <div className="px-4 pb-2 text-xs font-medium text-surface-500">
        Showing {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
      </div>

      <div className="flex-1 overflow-hidden">
        <SongList songs={songs} filters={filters} />
      </div>
    </div>
  );
}
