import { useMemo } from 'react';
import { useSongStore } from '../../store/songStore';
import { useSelectionStore } from '../../store/selectionStore';
import { motion } from 'framer-motion';

export default function StatsDashboard() {
  const { songs } = useSongStore();
  const { selections } = useSelectionStore();

  const stats = useMemo(() => {
    let liked = 0, disliked = 0, skipped = 0;
    const artists: Record<string, number> = {};
    const albums: Record<string, number> = {};

    Object.entries(selections).forEach(([indexStr, sel]) => {
      const idx = parseInt(indexStr, 10);
      const song = songs[idx];
      
      if (sel.status === 'liked') {
        liked++;
        if (song) {
          artists[song.primaryArtist] = (artists[song.primaryArtist] || 0) + 1;
          if (song.album) {
            albums[song.album] = (albums[song.album] || 0) + 1;
          }
        }
      } else if (sel.status === 'disliked') {
        disliked++;
      } else if (sel.status === 'skipped') {
        skipped++;
      }
    });

    const topArtists = Object.entries(artists)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
      
    const topAlbums = Object.entries(albums)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      liked, disliked, skipped,
      totalReviewed: liked + disliked + skipped,
      totalSongs: songs.length,
      topArtists,
      topAlbums
    };
  }, [songs, selections]);

  if (stats.totalSongs === 0) return null;

  const percentComplete = stats.totalSongs > 0 ? Math.round((stats.totalReviewed / stats.totalSongs) * 100) : 0;
  
  // Percentages for the distribution bar
  const likedPct = stats.totalReviewed > 0 ? (stats.liked / stats.totalReviewed) * 100 : 0;
  const dislikedPct = stats.totalReviewed > 0 ? (stats.disliked / stats.totalReviewed) * 100 : 0;
  const skippedPct = stats.totalReviewed > 0 ? (stats.skipped / stats.totalReviewed) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 w-full mx-auto max-w-lg p-4">
      {/* Top Level Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-100 dark:bg-surface-900 rounded-xl p-4 border border-surface-200 dark:border-surface-800">
          <div className="text-surface-500 text-xs font-medium mb-1 uppercase tracking-wider">Reviewed</div>
          <div className="text-2xl font-bold text-brand-500">{stats.totalReviewed}</div>
          <div className="text-xs text-surface-400 mt-1">out of {stats.totalSongs}</div>
        </div>
        <div className="bg-surface-100 dark:bg-surface-900 rounded-xl p-4 border border-surface-200 dark:border-surface-800">
          <div className="text-surface-500 text-xs font-medium mb-1 uppercase tracking-wider">Liked</div>
          <div className="text-2xl font-bold text-accent-500">{stats.liked}</div>
          <div className="text-xs text-surface-400 mt-1">{stats.totalReviewed > 0 ? Math.round((stats.liked / stats.totalReviewed) * 100) : 0}% of reviewed</div>
        </div>
      </div>

      {/* Progress & Distribution */}
      <div className="bg-surface-100 dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-800">
        <div className="flex justify-between items-end mb-2">
          <h3 className="font-bold">Completion</h3>
          <span className="text-xl font-bold text-brand-500">{percentComplete}%</span>
        </div>
        <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden mb-6">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-brand-500"
          />
        </div>

        <h3 className="font-bold mb-3">Distribution</h3>
        <div className="flex h-6 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-800 mb-2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${likedPct}%` }} className="bg-accent-500 h-full transition-all" />
          <motion.div initial={{ width: 0 }} animate={{ width: `${dislikedPct}%` }} className="bg-brand-500 h-full transition-all" />
          <motion.div initial={{ width: 0 }} animate={{ width: `${skippedPct}%` }} className="bg-amber-500 h-full transition-all" />
        </div>
        <div className="flex justify-between text-xs font-medium px-1">
          <span className="text-accent-500">Like ({stats.liked})</span>
          <span className="text-amber-500">Skip ({stats.skipped})</span>
          <span className="text-brand-500">Dislike ({stats.disliked})</span>
        </div>
      </div>

      {/* Top Artists */}
      {stats.topArtists.length > 0 && (
        <div className="bg-surface-100 dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-800">
          <h3 className="font-bold mb-4">Top Liked Artists</h3>
          <div className="flex flex-col gap-3">
            {stats.topArtists.map(([artist, count], i) => (
              <div key={artist} className="flex items-center gap-3">
                <div className="w-5 text-center text-sm font-bold text-surface-400">{i + 1}</div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium truncate pr-2">{artist}</span>
                    <span className="text-sm text-surface-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.topArtists[0][1]) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full bg-accent-500/80"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Albums */}
      {stats.topAlbums.length > 0 && (
        <div className="bg-surface-100 dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-800">
          <h3 className="font-bold mb-4">Top Liked Albums</h3>
          <div className="flex flex-col gap-3">
            {stats.topAlbums.map(([album, count], i) => (
              <div key={album} className="flex items-center gap-3">
                <div className="w-5 text-center text-sm font-bold text-surface-400">{i + 1}</div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium truncate pr-2">{album}</span>
                    <span className="text-sm text-surface-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.topAlbums[0][1]) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full bg-accent-500/80"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
