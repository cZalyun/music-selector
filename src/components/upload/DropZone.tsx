import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { parseCSV } from '../../utils/csv';
import { useSongStore } from '../../store/songStore';
import { useSelectionStore } from '../../store/selectionStore';
import { useToastStore } from '../../store/toastStore';
import { useNavigate } from 'react-router';

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setSongs } = useSongStore();
  const { clearSelections } = useSelectionStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      addToast('Please upload a valid CSV file.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const { songs, errors } = await parseCSV(file);

      if (errors.length > 0) {
        // Show up to 3 errors in toasts
        errors.slice(0, 3).forEach(err => addToast(err, 'error'));
        if (errors.length > 3) {
          addToast(`...and ${errors.length - 3} more errors.`, 'error');
        }
      }

      if (songs.length > 0) {
        setSongs(songs, file.name);
        clearSelections(); // Clear previous session when new file is loaded
        addToast(`Successfully loaded ${songs.length} songs!`, 'success');
        navigate('/swipe');
      } else {
        addToast('No valid songs found in the CSV file.', 'error');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        addToast(`Failed to parse CSV: ${e.message}`, 'error');
      } else {
        addToast('Failed to parse CSV: Unknown error', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [addToast, setSongs, clearSelections, navigate]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  return (
    <label
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
        isDragging
          ? 'border-brand-500 bg-brand-500/10'
          : 'border-surface-300 dark:border-surface-700 bg-surface-100 dark:bg-surface-900 hover:bg-surface-200 dark:hover:bg-surface-800'
      } ${isProcessing ? 'pointer-events-none opacity-75' : ''}`}
    >
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }} 
      />
      
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        {isProcessing ? (
          <>
            <div className="w-12 h-12 border-4 border-surface-300 border-t-brand-500 rounded-full animate-spin mb-4" />
            <p className="mb-2 text-sm text-surface-500 font-medium">Processing CSV...</p>
          </>
        ) : (
          <>
            <Upload size={48} className={`mb-4 ${isDragging ? 'text-brand-500' : 'text-surface-400'}`} />
            <p className="mb-2 text-sm font-bold text-surface-900 dark:text-surface-50">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-surface-500">
              YouTube Music Liked Songs CSV
            </p>
          </>
        )}
      </div>
    </label>
  );
}
