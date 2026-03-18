import { Download, Upload, Trash2 } from 'lucide-react';
import { useSongStore } from '../../store/songStore';
import { useSelectionStore } from '../../store/selectionStore';
import { useToastStore } from '../../store/toastStore';
import { exportToCSV, exportJSON } from '../../utils/csv';
import { useRef } from 'react';

export default function ExportPanel() {
  const songs = useSongStore((s) => s.songs);
  const { selections, clearSelections } = useSelectionStore();
  const clearSongs = useSongStore((s) => s.clearSongs);
  const addToast = useToastStore((s) => s.addToast);
  const importRef = useRef<HTMLInputElement>(null);

  const likedSongs = songs.filter((s) => selections[s.index]?.status === 'liked');

  const handleExportLiked = () => {
    if (likedSongs.length === 0) {
      addToast('No liked songs to export', 'error');
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportToCSV(likedSongs, `liked_songs_${date}.csv`);
    addToast(`Exported ${likedSongs.length} liked songs`, 'success');
  };

  const handleExportAll = () => {
    if (songs.length === 0) {
      addToast('No songs to export', 'error');
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportToCSV(songs, `all_songs_${date}.csv`);
    addToast(`Exported ${songs.length} songs`, 'success');
  };

  const handleBackup = () => {
    const backup = {
      songs: useSongStore.getState(),
      selections: useSelectionStore.getState().selections,
      exportedAt: new Date().toISOString(),
    };
    const date = new Date().toISOString().slice(0, 10);
    exportJSON(backup, `music_selector_backup_${date}.json`);
    addToast('Backup exported', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.songs?.songs) {
          useSongStore.getState().setSongs(data.songs.songs, data.songs.fileName ?? 'backup');
        }
        if (data.selections) {
          const store = useSelectionStore.getState();
          store.clearSelections();
          for (const [, sel] of Object.entries(data.selections)) {
            const s = sel as { songIndex: number; status: 'liked' | 'disliked' | 'skipped' };
            store.addSelection(s.songIndex, s.status);
          }
        }
        addToast('Backup restored successfully', 'success');
      } catch {
        addToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('This will clear all songs and selections. Are you sure?')) {
      clearSongs();
      clearSelections();
      addToast('All data cleared', 'info');
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleExportLiked}
        className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
      >
        <Download size={18} />
        <div className="text-left flex-1">
          <p className="text-sm font-medium">Export Liked Songs</p>
          <p className="text-[10px] opacity-60">{likedSongs.length} songs as CSV</p>
        </div>
      </button>

      <button
        onClick={handleExportAll}
        className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-surface-800/60 border border-surface-700/40 text-surface-200 hover:bg-surface-700/60 transition-colors"
      >
        <Download size={18} />
        <div className="text-left flex-1">
          <p className="text-sm font-medium">Export All Songs</p>
          <p className="text-[10px] opacity-60">{songs.length} songs as CSV</p>
        </div>
      </button>

      <div className="flex gap-3">
        <button
          onClick={handleBackup}
          className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-surface-800/60 border border-surface-700/40 text-surface-300 hover:bg-surface-700/60 transition-colors text-sm"
        >
          <Download size={16} />
          Backup
        </button>
        <button
          onClick={() => importRef.current?.click()}
          className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-surface-800/60 border border-surface-700/40 text-surface-300 hover:bg-surface-700/60 transition-colors text-sm"
        >
          <Upload size={16} />
          Restore
        </button>
        <input ref={importRef} type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
      </div>

      <button
        onClick={handleReset}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-rose-900/40 text-rose-400 hover:bg-rose-950/30 transition-colors text-sm"
      >
        <Trash2 size={16} />
        Reset All Data
      </button>
    </div>
  );
}
