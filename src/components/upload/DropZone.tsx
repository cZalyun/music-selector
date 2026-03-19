import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseCSV } from '@/utils/csv';
import { useSongStore } from '@/store/songStore';
import { useToastStore } from '@/store/toastStore';

export function DropZone() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSongs = useSongStore((s) => s.setSongs);
  const addToast = useToastStore((s) => s.addToast);

  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<{ title: string; artist: string }[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrors(['Please upload a CSV file']);
      return;
    }

    setProcessing(true);
    setErrors([]);
    setPreview([]);

    const { songs, errors: parseErrors } = await parseCSV(file);

    if (parseErrors.length > 0 && songs.length === 0) {
      setErrors(parseErrors);
      setProcessing(false);
      return;
    }

    if (songs.length === 0) {
      setErrors(['No songs found in file']);
      setProcessing(false);
      return;
    }

    setSongs(songs, file.name);
    setPreview(songs.slice(0, 5).map((s) => ({ title: s.title, artist: s.primaryArtist })));
    setErrors(parseErrors);
    setLoaded(true);
    setProcessing(false);
    addToast(t('toast.csvLoaded', { count: songs.length, file: file.name }), 'success');
  }, [setSongs, addToast, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (loaded) {
    return (
      <div className="space-y-4">
        {preview.length > 0 && (
          <div className="bg-surface-800 rounded-2xl p-4 border border-surface-700">
            <p className="text-sm text-surface-400 mb-3">
              {t('home.dropzone.preview', { count: preview.length })}
            </p>
            <div className="space-y-2">
              {preview.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-surface-500 w-5 text-right">{i + 1}</span>
                  <span className="text-surface-100 truncate flex-1">{s.title}</span>
                  <span className="text-surface-400 truncate">{s.artist}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => navigate('/swipe')}
          className="w-full py-3 bg-accent-500 text-white font-medium rounded-xl hover:bg-accent-600 transition-colors"
        >
          {t('home.dropzone.startReviewing')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragging
            ? 'border-accent-400 bg-accent-500/10'
            : 'border-surface-600 bg-surface-800/50 hover:border-surface-500 hover:bg-surface-800/70'
        }`}
        role="button"
        tabIndex={0}
        aria-label={t('home.dropzone.title')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        {processing ? (
          <>
            <Loader2 size={40} className="text-accent-400 animate-spin mb-3" />
            <p className="text-surface-300 text-sm">{t('home.dropzone.processing')}</p>
          </>
        ) : (
          <>
            {dragging ? (
              <FileText size={40} className="text-accent-400 mb-3" />
            ) : (
              <Upload size={40} className="text-surface-400 mb-3" />
            )}
            <p className="text-surface-200 font-medium mb-1">
              {dragging ? t('home.dropzone.dragging') : t('home.dropzone.title')}
            </p>
            {!dragging && (
              <p className="text-surface-500 text-sm">{t('home.dropzone.subtitle')}</p>
            )}
          </>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-dislike">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
