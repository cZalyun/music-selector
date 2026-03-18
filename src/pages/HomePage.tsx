import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Disc3, Database, HelpCircle, Mail, X, ChevronRight, Download, Copy, Check } from 'lucide-react';
import DropZone from '../components/upload/DropZone';
import { useSongStore } from '../store/songStore';
import { useSelectionStore } from '../store/selectionStore';
import { useToastStore } from '../store/toastStore';
import { parseCSVString } from '../utils/csv';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BOOKMARKLET } from '../utils/bookmarklet';

export default function HomePage() {
  const navigate = useNavigate();
  const { songs, fileName, setSongs } = useSongStore();
  const reviewed = useSelectionStore((s) => s.getReviewedCount());
  const addToast = useToastStore((s) => s.addToast);
  const [loadingSample, setLoadingSample] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false);
  const { canInstall, install } = usePWAInstall();

  const hasData = songs.length > 0;

  const handleLoadSample = async () => {
    setLoadingSample(true);
    try {
      const base = import.meta.env.BASE_URL;
      const res = await fetch(`${base}SAMPLE_DATA.csv`);
      if (!res.ok) throw new Error('Failed to fetch sample data');
      const text = await res.text();
      const { songs: parsed, errors } = parseCSVString(text);
      if (errors.length > 0) {
        addToast(errors[0], 'error');
      }
      if (parsed.length > 0) {
        setSongs(parsed, 'SAMPLE_DATA.csv');
        addToast(`Loaded ${parsed.length} sample songs`, 'success');
        navigate('/swipe');
      }
    } catch {
      addToast('Failed to load sample data', 'error');
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-lg mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-600/20">
          <Music size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-surface-50">Music Selector</h1>
        <p className="text-sm text-surface-400 mt-1">
          Discover and curate your music library
        </p>
        {canInstall && (
          <button
            onClick={install}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-accent-600/20"
          >
            <Download size={16} />
            Install App
          </button>
        )}
      </motion.div>

      {/* Existing session card */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded-2xl bg-surface-800/60 border border-surface-700/40"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-600/20 flex items-center justify-center">
              <Disc3 size={20} className="text-accent-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200">Current Session</p>
              <p className="text-xs text-surface-500 truncate">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-surface-400 mb-3">
            <span>{songs.length} songs</span>
            <span>·</span>
            <span>{reviewed} reviewed</span>
            <span>·</span>
            <span>{Math.round((reviewed / songs.length) * 100)}% complete</span>
          </div>
          <button
            onClick={() => navigate('/swipe')}
            className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Continue Reviewing
          </button>
        </motion.div>
      )}

      {/* Upload zone — only when no session loaded */}
      {!hasData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DropZone onSuccess={() => navigate('/swipe')} />
          </motion.div>

          {/* Load sample data */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-surface-700/50" />
              <span className="text-[10px] text-surface-500 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-surface-700/50" />
            </div>
            <button
              onClick={handleLoadSample}
              disabled={loadingSample}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-800/60 border border-surface-700/40 hover:bg-surface-700/60 text-surface-300 font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              <Database size={16} />
              {loadingSample ? 'Loading...' : 'Load Sample Music List'}
            </button>
            <p className="text-[10px] text-surface-600 text-center mt-2">
              Try with a pre-loaded list of 1,148 songs
            </p>
          </motion.div>
        </>
      )}
      {/* Bottom links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center justify-center gap-4"
      >
        <button
          onClick={() => setShowHowTo(true)}
          className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-200 transition-colors"
        >
          <HelpCircle size={14} />
          How To Use?
        </button>
        <span className="text-surface-700">·</span>
        <a
          href="mailto:contact@peterbenceczaun.me?subject=Music%20Selector%20Feedback"
          className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-200 transition-colors"
        >
          <Mail size={14} />
          Feedback
        </a>
      </motion.div>

      {/* How To Use Modal */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHowTo(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-surface-900 border border-surface-700/50 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-surface-100">How To Use</h2>
                <button
                  onClick={() => setShowHowTo(false)}
                  className="p-1.5 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 text-sm text-surface-300">
                <section>
                  <h3 className="text-surface-100 font-semibold mb-1.5 flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-accent-400" />
                    Getting Your Music Data
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-surface-400 text-xs leading-relaxed">
                    <li>Go to <span className="text-accent-400">music.youtube.com</span> and sign in</li>
                    <li>Navigate to <span className="text-surface-200">Library → Liked Songs</span></li>
                    <li>Create a new bookmark and paste this bookmarklet code as the URL:</li>
                  </ol>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(BOOKMARKLET);
                        setBookmarkletCopied(true);
                        setTimeout(() => setBookmarkletCopied(false), 2000);
                      } catch {
                        addToast('Failed to copy', 'error');
                      }
                    }}
                    className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-xs font-mono bg-surface-800 border border-surface-700/50 rounded-lg hover:bg-surface-700/60 transition-colors text-left"
                  >
                    <span className="flex-1 truncate text-accent-400">{"javascript:(async()=>{…} bookmarklet"}</span>
                    {bookmarkletCopied ? (
                      <Check size={14} className="shrink-0 text-emerald-400" />
                    ) : (
                      <Copy size={14} className="shrink-0 text-surface-400" />
                    )}
                  </button>
                  {bookmarkletCopied && (
                    <p className="text-[10px] text-emerald-400 mt-1">Copied to clipboard!</p>
                  )}
                  <ol start={4} className="list-decimal list-inside space-y-1 text-surface-400 text-xs leading-relaxed mt-2">
                    <li>Click the bookmarklet — it scrolls through all songs and downloads a CSV</li>
                    <li>Upload that CSV here in the app</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-surface-100 font-semibold mb-1.5 flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-accent-400" />
                    Swipe to Review
                  </h3>
                  <ul className="space-y-1 text-surface-400 text-xs leading-relaxed">
                    <li><span className="text-emerald-400 font-medium">Swipe right</span> or tap the heart to <strong>like</strong> a song</li>
                    <li><span className="text-rose-400 font-medium">Swipe left</span> or tap the thumbs down to <strong>dislike</strong></li>
                    <li><span className="text-amber-400 font-medium">Swipe up</span> or tap the skip arrow to <strong>skip</strong> for now</li>
                    <li>Use the <strong>play button</strong> to preview the song via YouTube</li>
                    <li>Use the <strong>undo button</strong> to go back to the previous song</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-surface-100 font-semibold mb-1.5 flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-accent-400" />
                    Library
                  </h3>
                  <p className="text-surface-400 text-xs leading-relaxed">
                    Browse all your songs with search, filter by status (liked, disliked, unreviewed),
                    sort by title, artist, or duration, and group by artist, album, duration, or status.
                    Tap any song to play it.
                  </p>
                </section>

                <section>
                  <h3 className="text-surface-100 font-semibold mb-1.5 flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-accent-400" />
                    Settings & Export
                  </h3>
                  <p className="text-surface-400 text-xs leading-relaxed">
                    Toggle autoplay on/off, view review statistics, and export your liked songs as CSV
                    or back up all your data as JSON.
                  </p>
                </section>

                <section>
                  <h3 className="text-surface-100 font-semibold mb-1.5 flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-accent-400" />
                    Tips
                  </h3>
                  <ul className="space-y-1 text-surface-400 text-xs leading-relaxed">
                    <li>Your progress is <strong>saved automatically</strong> in your browser</li>
                    <li>Install the app as a PWA for the best mobile experience</li>
                    <li>You can try the app with sample data before uploading your own</li>
                  </ul>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
