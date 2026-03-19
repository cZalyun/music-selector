import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSongStore } from '../store/songStore';
import { useSelectionStore } from '../store/selectionStore';
import DropZone from '../components/upload/DropZone';
import { parseCSVString } from '../utils/csv';
import { bookmarkletCode } from '../utils/bookmarklet';
import { FileText, PlaySquare, HelpCircle, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../store/toastStore';

export default function HomePage() {
  const { songs, fileName, setSongs } = useSongStore();
  const { getReviewedCount, clearSelections } = useSelectionStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [showHowTo, setShowHowTo] = useState(false);
  const [copied, setCopied] = useState(false);

  const reviewedCount = getReviewedCount();
  const progressPercent = songs.length > 0 ? Math.round((reviewedCount / songs.length) * 100) : 0;

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/SAMPLE_DATA.csv');
      const text = await response.text();
      const { songs: sampleSongs, errors } = parseCSVString(text);
      
      if (errors.length > 0) {
         addToast(`Loaded with ${errors.length} errors.`, 'error');
      }

      setSongs(sampleSongs, 'SAMPLE_DATA.csv');
      clearSelections();
      addToast('Sample data loaded successfully!', 'success');
      navigate('/swipe');
    } catch (e: unknown) {
      if (e instanceof Error) {
        addToast(`Failed to load sample data: ${e.message}`, 'error');
      }
    }
  };

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    addToast('Bookmarklet copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto pb-20 p-4 max-w-lg mx-auto">
      <div className="text-center mt-6 mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent mb-2">
          Music Selector
        </h1>
        <p className="text-surface-500 text-sm">
          Review and curate your YouTube Music library
        </p>
      </div>

      {songs.length > 0 && (
        <div className="bg-brand-500 text-white rounded-2xl p-5 mb-8 shadow-lg shadow-brand-500/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg leading-tight">Session Resume</h2>
              <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
                <FileText size={12} /> {fileName || 'Unknown File'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{progressPercent}%</div>
              <div className="text-white/80 text-[10px] uppercase tracking-wider">Complete</div>
            </div>
          </div>

          <div className="h-2 bg-black/20 rounded-full overflow-hidden mb-5">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-sm font-medium mb-5">
            <span>{reviewedCount} reviewed</span>
            <span className="opacity-80">{songs.length - reviewedCount} remaining</span>
          </div>

          <button 
            onClick={() => navigate('/swipe')}
            className="w-full bg-white text-brand-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            <PlaySquare size={20} />
            Continue Reviewing
          </button>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 text-surface-900 dark:text-surface-50">
          Upload Library
        </h2>
        <DropZone />
        
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-surface-500">Don't have data yet?</span>
          <button 
            onClick={handleLoadSample}
            className="text-brand-500 font-bold hover:text-brand-600 transition-colors"
          >
            Load 1,148 Sample Songs
          </button>
        </div>
      </div>

      {/* Instructions Modal Trigger */}
      <button 
        onClick={() => setShowHowTo(true)}
        className="flex items-center justify-between w-full p-4 bg-surface-100 dark:bg-surface-900 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors border border-surface-200 dark:border-surface-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg">
            <HelpCircle size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-surface-900 dark:text-surface-50 text-sm">How to get your CSV data</h3>
            <p className="text-xs text-surface-500">Use the bookmarklet tool</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-surface-400" />
      </button>

      {/* How To Modal */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
            onClick={() => setShowHowTo(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-50 dark:bg-surface-950 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90dvh] flex flex-col border border-surface-200 dark:border-surface-800"
            >
              <div className="p-4 border-b border-surface-200 dark:border-surface-800 flex justify-between items-center bg-surface-100/50 dark:bg-surface-900/50 rounded-t-2xl">
                <h2 className="text-lg font-bold">How to Export Data</h2>
                <button 
                  onClick={() => setShowHowTo(false)}
                  className="p-2 hover:bg-surface-200 dark:hover:bg-surface-800 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  <section>
                    <h3 className="font-bold text-brand-500 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/10 text-xs">1</span>
                      Create Bookmarklet
                    </h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 mb-3 leading-relaxed">
                      Drag the code block below to your browser's bookmarks bar, or create a new bookmark and paste the copied code as the URL.
                    </p>
                    
                    <div className="relative group">
                      <pre className="p-4 bg-surface-200 dark:bg-surface-900 rounded-xl overflow-x-auto text-xs text-surface-600 dark:text-surface-400 font-mono border border-surface-300 dark:border-surface-800">
                        javascript:(function(){"{"}/* ... */{"}"})();
                      </pre>
                      <button
                        onClick={copyBookmarklet}
                        className="absolute top-2 right-2 p-2 bg-surface-100 dark:bg-surface-800 rounded-lg hover:bg-white dark:hover:bg-surface-700 transition-colors shadow-sm"
                      >
                        {copied ? <Check size={16} className="text-brand-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-bold text-brand-500 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/10 text-xs">2</span>
                      Run on YouTube Music
                    </h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                      Open <a href="https://music.youtube.com/library/liked_songs" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">YouTube Music Liked Songs</a> in your desktop browser, then click the bookmarklet you just created. It will automatically scroll and download a CSV file.
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="font-bold text-brand-500 mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/10 text-xs">3</span>
                      Upload Here
                    </h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                      Drag and drop the downloaded CSV file into the upload zone on this app to begin reviewing.
                    </p>
                  </section>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
