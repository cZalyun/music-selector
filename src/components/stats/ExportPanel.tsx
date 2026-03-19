import { useState } from 'react';
import { useSongStore } from '../../store/songStore';
import { useSelectionStore } from '../../store/selectionStore';
import { exportToCSV, exportJSON } from '../../utils/csv';
import { Download, Upload, Trash2, Database } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function ExportPanel() {
  const { songs, clearSongs } = useSongStore();
  const { selections, clearSelections } = useSelectionStore();
  const { addToast } = useToastStore();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleExportLikedCSV = () => {
    if (songs.length === 0) return;
    const likedSongs = songs.filter(s => selections[s.index]?.status === 'liked');
    const dateStr = new Date().toISOString().split('T')[0];
    exportToCSV(likedSongs, `liked_songs_${dateStr}.csv`);
    addToast(`Exported ${likedSongs.length} liked songs.`, 'success');
  };

  const handleExportAllCSV = () => {
    if (songs.length === 0) return;
    const dateStr = new Date().toISOString().split('T')[0];
    exportToCSV(songs, `all_songs_${dateStr}.csv`);
    addToast(`Exported all ${songs.length} songs.`, 'success');
  };

  const handleBackupJSON = () => {
    if (songs.length === 0) return;
    const dateStr = new Date().toISOString().split('T')[0];
    exportJSON({ songs, selections }, `music_selector_backup_${dateStr}.json`);
    addToast('Backup downloaded successfully.', 'success');
  };

  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.songs && Array.isArray(data.songs) && data.selections) {
          useSongStore.getState().setSongs(data.songs, file.name);
          useSelectionStore.setState({ selections: data.selections, history: [] });
          addToast(`Restored ${data.songs.length} songs and selections!`, 'success');
        } else {
          throw new Error('Invalid backup format');
        }
      } catch (err) {
        addToast('Failed to restore backup. Invalid file format.', 'error');
        console.error(err);
      }
      
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    clearSongs();
    clearSelections();
    setIsResetConfirmOpen(false);
    addToast('All data has been cleared.', 'info');
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto max-w-lg p-4">
      <h3 className="text-xl font-bold mb-2">Export & Data</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleExportLikedCSV}
          disabled={songs.length === 0}
          className="flex items-center gap-3 p-4 bg-surface-100 dark:bg-surface-900 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors disabled:opacity-50 text-left border border-surface-200 dark:border-surface-800"
        >
          <div className="p-2 bg-accent-500/10 text-accent-500 rounded-lg">
            <Download size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">Export Liked (CSV)</div>
            <div className="text-xs text-surface-500">Only songs you've liked</div>
          </div>
        </button>

        <button
          onClick={handleExportAllCSV}
          disabled={songs.length === 0}
          className="flex items-center gap-3 p-4 bg-surface-100 dark:bg-surface-900 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors disabled:opacity-50 text-left border border-surface-200 dark:border-surface-800"
        >
          <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
            <Download size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">Export All (CSV)</div>
            <div className="text-xs text-surface-500">Full library data</div>
          </div>
        </button>

        <button
          onClick={handleBackupJSON}
          disabled={songs.length === 0}
          className="flex items-center gap-3 p-4 bg-surface-100 dark:bg-surface-900 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors disabled:opacity-50 text-left border border-surface-200 dark:border-surface-800"
        >
          <div className="p-2 bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg">
            <Database size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">Backup (JSON)</div>
            <div className="text-xs text-surface-500">Songs + Selections</div>
          </div>
        </button>

        <label className="flex items-center gap-3 p-4 bg-surface-100 dark:bg-surface-900 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors cursor-pointer border border-surface-200 dark:border-surface-800">
          <div className="p-2 bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg">
            <Upload size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">Restore Backup</div>
            <div className="text-xs text-surface-500">From JSON file</div>
          </div>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleRestoreJSON}
          />
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
        {isResetConfirmOpen ? (
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
            <p className="font-medium text-brand-600 dark:text-brand-400 mb-3">
              Are you sure? This will delete all songs and your review history.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handleReset}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors flex-1"
              >
                Yes, Delete All
              </button>
              <button 
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-surface-200 dark:bg-surface-800 rounded-lg font-medium hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center justify-center gap-2 w-full p-4 rounded-xl text-brand-600 dark:text-brand-400 bg-brand-500/5 hover:bg-brand-500/10 transition-colors font-medium border border-brand-500/10"
          >
            <Trash2 size={18} />
            Reset All Data
          </button>
        )}
      </div>
    </div>
  );
}
