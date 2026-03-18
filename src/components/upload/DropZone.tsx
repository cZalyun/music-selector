import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseCSV } from '../../utils/csv';
import { useSongStore } from '../../store/songStore';
import { useToastStore } from '../../store/toastStore';
import type { Song } from '../../types';

interface DropZoneProps {
  onSuccess: () => void;
}

export default function DropZone({ onSuccess }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<Song[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const setSongs = useSongStore((s) => s.setSongs);
  const addToast = useToastStore((s) => s.addToast);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrors(['Please upload a CSV file']);
      return;
    }

    setIsProcessing(true);
    setErrors([]);
    setPreview(null);

    const { songs, errors: parseErrors } = await parseCSV(file);

    if (parseErrors.length > 0) {
      setErrors(parseErrors);
    }

    if (songs.length > 0) {
      setPreview(songs.slice(0, 5));
      setSongs(songs, file.name);
      addToast(`Loaded ${songs.length} songs from ${file.name}`, 'success');
    }

    setIsProcessing(false);
  }, [setSongs, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        animate={{
          borderColor: isDragging ? '#a855f7' : '#334155',
          backgroundColor: isDragging ? 'rgba(168, 85, 247, 0.05)' : 'rgba(30, 41, 59, 0.5)',
        }}
        className="relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all flex flex-col items-center gap-4 text-center"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <FileSpreadsheet size={40} className="text-accent-400" />
            </motion.div>
            <p className="text-surface-300 text-sm">Processing CSV...</p>
          </div>
        ) : (
          <>
            <motion.div
              animate={{ y: isDragging ? -4 : 0 }}
              className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center"
            >
              <Upload size={28} className={isDragging ? 'text-accent-400' : 'text-surface-400'} />
            </motion.div>
            <div>
              <p className="text-surface-200 font-medium">
                {isDragging ? 'Drop your CSV here' : 'Upload your music CSV'}
              </p>
              <p className="text-surface-500 text-sm mt-1">
                Drag & drop or tap to browse
              </p>
            </div>
          </>
        )}
      </motion.div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50"
        >
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-rose-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </motion.div>
      )}

      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-surface-800/60 border border-surface-700/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-surface-200">
              {useSongStore.getState().songs.length} songs loaded
            </span>
          </div>
          <div className="space-y-2">
            {preview.map((song) => (
              <div key={song.index} className="flex items-center gap-3 p-2 rounded-lg bg-surface-900/50">
                {song.thumbnail && (
                  <img src={song.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-surface-200 truncate">{song.title}</p>
                  <p className="text-[10px] text-surface-500 truncate">{song.primaryArtist}</p>
                </div>
                <span className="text-[10px] text-surface-500">{song.duration}</span>
              </div>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSuccess(); }}
            className="mt-4 w-full py-3 bg-accent-600 hover:bg-accent-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Start Reviewing
          </button>
        </motion.div>
      )}
    </div>
  );
}
