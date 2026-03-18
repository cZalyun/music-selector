import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, ThumbsDown, SkipForward, Music, TrendingUp } from 'lucide-react';
import { useSongStore } from '../../store/songStore';
import { useSelectionStore } from '../../store/selectionStore';

export default function StatsDashboard() {
  const songs = useSongStore((s) => s.songs);
  const selections = useSelectionStore((s) => s.selections);

  const stats = useMemo(() => {
    const all = Object.values(selections);
    const liked = all.filter((s) => s.status === 'liked');
    const disliked = all.filter((s) => s.status === 'disliked');
    const skipped = all.filter((s) => s.status === 'skipped');
    const total = songs.length;
    const reviewed = all.length;
    const completion = total > 0 ? Math.round((reviewed / total) * 100) : 0;

    // Top artists by likes
    const artistMap = new Map<string, number>();
    for (const sel of liked) {
      const song = songs.find((s) => s.index === sel.songIndex);
      if (song) {
        artistMap.set(song.primaryArtist, (artistMap.get(song.primaryArtist) ?? 0) + 1);
      }
    }
    const topArtists = Array.from(artistMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Top albums by likes
    const albumMap = new Map<string, number>();
    for (const sel of liked) {
      const song = songs.find((s) => s.index === sel.songIndex);
      if (song?.album) {
        albumMap.set(song.album, (albumMap.get(song.album) ?? 0) + 1);
      }
    }
    const topAlbums = Array.from(albumMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { total, reviewed, completion, liked: liked.length, disliked: disliked.length, skipped: skipped.length, topArtists, topAlbums };
  }, [songs, selections]);

  const cards = [
    { label: 'Total Songs', value: stats.total, icon: Music, color: 'text-accent-400' },
    { label: 'Liked', value: stats.liked, icon: Heart, color: 'text-emerald-400' },
    { label: 'Disliked', value: stats.disliked, icon: ThumbsDown, color: 'text-rose-400' },
    { label: 'Skipped', value: stats.skipped, icon: SkipForward, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40"
          >
            <card.icon size={18} className={card.color} />
            <p className="text-2xl font-bold text-surface-100 mt-2">{card.value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Completion */}
      <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-400" />
            <span className="text-sm font-medium text-surface-200">Completion</span>
          </div>
          <span className="text-sm font-bold text-surface-100">{stats.completion}%</span>
        </div>
        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completion}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full"
          />
        </div>
        <p className="text-xs text-surface-500 mt-2">
          {stats.reviewed} of {stats.total} songs reviewed
        </p>
      </div>

      {/* Distribution bar */}
      {stats.reviewed > 0 && (
        <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40">
          <p className="text-sm font-medium text-surface-200 mb-3">Review Distribution</p>
          <div className="flex h-6 rounded-lg overflow-hidden">
            {stats.liked > 0 && (
              <div
                className="bg-emerald-500/80 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${(stats.liked / stats.reviewed) * 100}%` }}
              >
                {stats.liked > 2 && `${Math.round((stats.liked / stats.reviewed) * 100)}%`}
              </div>
            )}
            {stats.disliked > 0 && (
              <div
                className="bg-rose-500/80 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${(stats.disliked / stats.reviewed) * 100}%` }}
              >
                {stats.disliked > 2 && `${Math.round((stats.disliked / stats.reviewed) * 100)}%`}
              </div>
            )}
            {stats.skipped > 0 && (
              <div
                className="bg-amber-500/80 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ width: `${(stats.skipped / stats.reviewed) * 100}%` }}
              >
                {stats.skipped > 2 && `${Math.round((stats.skipped / stats.reviewed) * 100)}%`}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-surface-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Liked</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Disliked</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Skipped</span>
          </div>
        </div>
      )}

      {/* Top Artists */}
      {stats.topArtists.length > 0 && (
        <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40">
          <p className="text-sm font-medium text-surface-200 mb-3">Top Liked Artists</p>
          <div className="space-y-2">
            {stats.topArtists.map(([artist, count], i) => (
              <div key={artist} className="flex items-center gap-3">
                <span className="text-xs text-surface-600 w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-surface-700 rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.topArtists[0][1]) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full bg-accent-600/40 rounded-md flex items-center px-2"
                    >
                      <span className="text-[10px] text-surface-200 truncate">{artist}</span>
                    </motion.div>
                  </div>
                </div>
                <span className="text-xs text-surface-400 shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Albums */}
      {stats.topAlbums.length > 0 && (
        <div className="p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40">
          <p className="text-sm font-medium text-surface-200 mb-3">Top Liked Albums</p>
          <div className="space-y-2">
            {stats.topAlbums.map(([album, count], i) => (
              <div key={album} className="flex items-center gap-3">
                <span className="text-xs text-surface-600 w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-surface-700 rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.topAlbums[0][1]) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full bg-emerald-600/30 rounded-md flex items-center px-2"
                    >
                      <span className="text-[10px] text-surface-200 truncate">{album}</span>
                    </motion.div>
                  </div>
                </div>
                <span className="text-xs text-surface-400 shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
