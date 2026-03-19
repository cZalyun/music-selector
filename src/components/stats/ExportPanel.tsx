import { useState, useRef } from 'react';
import { Download, Trash2, Save, FileJson } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSongStore } from '@/store/songStore';
import { useSelectionStore } from '@/store/selectionStore';
import { useToastStore } from '@/store/toastStore';
import { exportToCSV, exportJSON } from '@/utils/csv';
import { formatDateISO } from '@/utils/format';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { Song, Selection } from '@/types';

export function ExportPanel() {
  const { t } = useTranslation();
  const songs = useSongStore((s) => s.songs);
  const setSongs = useSongStore((s) => s.setSongs);
  const clearSongs = useSongStore((s) => s.clearSongs);
  const selections = useSelectionStore((s) => s.selections);
  const setSelections = useSelectionStore((s) => s.setSelections);
  const clearSelections = useSelectionStore((s) => s.clearSelections);
  const addToast = useToastStore((s) => s.addToast);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  function handleExportLiked() {
    const liked = songs.filter((s) => selections[s.index]?.status === 'liked');
    if (liked.length === 0) {
      addToast(t('export.noLikedSongs'), 'info');
      return;
    }
    exportToCSV(liked, `liked_songs_${formatDateISO()}.csv`);
    addToast(t('export.exportSuccess', { count: liked.length }), 'success');
  }

  function handleExportAll() {
    if (songs.length === 0) {
      addToast(t('export.noSongs'), 'info');
      return;
    }
    exportToCSV(songs, `all_songs_${formatDateISO()}.csv`);
    addToast(t('export.exportSuccess', { count: songs.length }), 'success');
  }

  function handleBackup() {
    if (songs.length === 0) {
      addToast(t('export.noSongs'), 'info');
      return;
    }
    const data = { songs, selections };
    exportJSON(data, `music_selector_backup_${formatDateISO()}.json`);
    addToast(t('export.exportSuccess', { count: songs.length }), 'success');
  }

  function handleRestore() {
    restoreInputRef.current?.click();
  }

  function handleRestoreFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as {
          songs?: Song[];
          selections?: Record<number, Selection>;
        };

        if (!data.songs || !Array.isArray(data.songs)) {
          addToast(t('export.restoreError'), 'error');
          return;
        }

        setSongs(data.songs, null);
        if (data.selections) {
          setSelections(data.selections);
        }

        const selCount = data.selections ? Object.keys(data.selections).length : 0;
        addToast(
          t('export.restoreSuccess', { songs: data.songs.length, selections: selCount }),
          'success',
        );
      } catch {
        addToast(t('export.restoreError'), 'error');
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  }

  function handleReset() {
    clearSongs();
    clearSelections();
    setResetModalOpen(false);
    addToast(t('export.resetConfirm.confirm'), 'success');
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-surface-300 mb-2">{t('export.title')}</h3>

      <ActionButton onClick={handleExportLiked} icon={Download} label={t('export.likedCsv')} />
      <ActionButton onClick={handleExportAll} icon={Download} label={t('export.allCsv')} />
      <ActionButton onClick={handleBackup} icon={Save} label={t('export.backupJson')} />
      <ActionButton onClick={handleRestore} icon={FileJson} label={t('export.restore')} />

      <input
        ref={restoreInputRef}
        type="file"
        accept=".json"
        onChange={handleRestoreFile}
        className="hidden"
        aria-hidden="true"
      />

      <div className="pt-2 border-t border-surface-700">
        <ActionButton
          onClick={() => setResetModalOpen(true)}
          icon={Trash2}
          label={t('export.reset')}
          destructive
        />
      </div>

      <ConfirmModal
        open={resetModalOpen}
        title={t('export.resetConfirm.title')}
        message={t('export.resetConfirm.message')}
        confirmLabel={t('export.resetConfirm.confirm')}
        cancelLabel={t('export.resetConfirm.cancel')}
        onConfirm={handleReset}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  destructive = false,
}: {
  onClick: () => void;
  icon: typeof Download;
  label: string;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        destructive
          ? 'bg-dislike/10 text-dislike hover:bg-dislike/20'
          : 'bg-surface-800 text-surface-200 hover:bg-surface-700 border border-surface-700'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
