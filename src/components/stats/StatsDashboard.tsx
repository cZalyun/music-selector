import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Heart, ThumbsDown, SkipForward } from 'lucide-react';
import type { Song, Selection } from '@/types';

interface StatsDashboardProps {
  songs: Song[];
  selections: Record<number, Selection>;
}

export function StatsDashboard({ songs, selections }: StatsDashboardProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const selectionValues = Object.values(selections);
    const liked = selectionValues.filter((s) => s.status === 'liked');
    const disliked = selectionValues.filter((s) => s.status === 'disliked');
    const skipped = selectionValues.filter((s) => s.status === 'skipped');
    const reviewed = selectionValues.length;
    const total = songs.length;
    const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

    // Top 5 liked artists
    const artistCounts = new Map<string, number>();
    for (const sel of liked) {
      const song = songs.find((s) => s.index === sel.songIndex);
      if (song) {
        artistCounts.set(song.primaryArtist, (artistCounts.get(song.primaryArtist) ?? 0) + 1);
      }
    }
    const topArtists = Array.from(artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Top 5 liked albums
    const albumCounts = new Map<string, number>();
    for (const sel of liked) {
      const song = songs.find((s) => s.index === sel.songIndex);
      if (song && song.album) {
        albumCounts.set(song.album, (albumCounts.get(song.album) ?? 0) + 1);
      }
    }
    const topAlbums = Array.from(albumCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total,
      liked: liked.length,
      disliked: disliked.length,
      skipped: skipped.length,
      reviewed,
      percent,
      topArtists,
      topAlbums,
    };
  }, [songs, selections]);

  const maxArtistCount = stats.topArtists[0]?.[1] ?? 1;
  const maxAlbumCount = stats.topAlbums[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Music} label={t('stats.cards.total')} value={stats.total} color="text-accent-400" />
        <StatCard icon={Heart} label={t('stats.cards.liked')} value={stats.liked} color="text-like" />
        <StatCard icon={ThumbsDown} label={t('stats.cards.disliked')} value={stats.disliked} color="text-dislike" />
        <StatCard icon={SkipForward} label={t('stats.cards.skipped')} value={stats.skipped} color="text-skip" />
      </div>

      {/* Completion */}
      <div className="bg-surface-800 rounded-2xl p-4 border border-surface-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-surface-300">{t('stats.completion')}</h3>
          <span className="text-sm font-bold text-surface-100">{stats.percent}%</span>
        </div>
        <div className="h-2.5 bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <p className="text-xs text-surface-500 mt-1.5">
          {stats.reviewed} / {stats.total}
        </p>
      </div>

      {/* Distribution */}
      {stats.reviewed > 0 && (
        <div className="bg-surface-800 rounded-2xl p-4 border border-surface-700">
          <h3 className="text-sm font-medium text-surface-300 mb-3">{t('stats.distribution')}</h3>
          <div className="h-4 rounded-full overflow-hidden flex">
            {stats.liked > 0 && (
              <div
                className="bg-like h-full transition-all duration-500"
                style={{ width: `${(stats.liked / stats.reviewed) * 100}%` }}
                title={`Liked: ${Math.round((stats.liked / stats.reviewed) * 100)}%`}
              />
            )}
            {stats.disliked > 0 && (
              <div
                className="bg-dislike h-full transition-all duration-500"
                style={{ width: `${(stats.disliked / stats.reviewed) * 100}%` }}
                title={`Disliked: ${Math.round((stats.disliked / stats.reviewed) * 100)}%`}
              />
            )}
            {stats.skipped > 0 && (
              <div
                className="bg-skip h-full transition-all duration-500"
                style={{ width: `${(stats.skipped / stats.reviewed) * 100}%` }}
                title={`Skipped: ${Math.round((stats.skipped / stats.reviewed) * 100)}%`}
              />
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px]">
            <span className="text-like">Liked {Math.round((stats.liked / stats.reviewed) * 100)}%</span>
            <span className="text-dislike">Disliked {Math.round((stats.disliked / stats.reviewed) * 100)}%</span>
            <span className="text-skip">Skipped {Math.round((stats.skipped / stats.reviewed) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Top Artists */}
      {stats.topArtists.length > 0 && (
        <div className="bg-surface-800 rounded-2xl p-4 border border-surface-700">
          <h3 className="text-sm font-medium text-surface-300 mb-3">{t('stats.topArtists')}</h3>
          <div className="space-y-2">
            {stats.topArtists.map(([artist, count]) => (
              <div key={artist}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-200 truncate flex-1 mr-2">{artist}</span>
                  <span className="text-surface-400 tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-like rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxArtistCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Albums */}
      {stats.topAlbums.length > 0 && (
        <div className="bg-surface-800 rounded-2xl p-4 border border-surface-700">
          <h3 className="text-sm font-medium text-surface-300 mb-3">{t('stats.topAlbums')}</h3>
          <div className="space-y-2">
            {stats.topAlbums.map(([album, count]) => (
              <div key={album}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-surface-200 truncate flex-1 mr-2">{album}</span>
                  <span className="text-surface-400 tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-400 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxAlbumCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Music;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-surface-800 rounded-2xl p-4 border border-surface-700">
      <Icon size={20} className={`${color} mb-2`} />
      <p className="text-2xl font-bold text-surface-100">{value}</p>
      <p className="text-xs text-surface-400">{label}</p>
    </div>
  );
}
