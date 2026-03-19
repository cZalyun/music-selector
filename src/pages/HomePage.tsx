import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Music,
  HelpCircle,
  X,
  Copy,
  Check,
  Download,
  Mail,
  ArrowRight,
  Bookmark,
  ListMusic,
  Settings,
  Lightbulb,
  Keyboard,
  Smartphone,
  Undo2,
} from 'lucide-react';
import { DropZone } from '@/components/upload/DropZone';
import { useSongStore } from '@/store/songStore';
import { useSelectionStore } from '@/store/selectionStore';
import { useToastStore } from '@/store/toastStore';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { parseCSVString } from '@/utils/csv';
import { formatPercent } from '@/utils/format';
import { BOOKMARKLET } from '@/utils/bookmarklet';
import { SAMPLE_DATA_PATH } from '@/constants';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const songs = useSongStore((s) => s.songs);
  const fileName = useSongStore((s) => s.fileName);
  const setSongs = useSongStore((s) => s.setSongs);
  const reviewed = useSelectionStore((s) => s.getReviewedCount());
  const addToast = useToastStore((s) => s.addToast);
  const { canInstall, isIOS, install } = usePWAInstall();

  const [showHowTo, setShowHowTo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  const percent = formatPercent(reviewed, songs.length);

  const handleLoadSample = useCallback(async () => {
    setLoadingSample(true);
    try {
      const response = await fetch(SAMPLE_DATA_PATH);
      const text = await response.text();
      const { songs: parsed } = parseCSVString(text);
      if (parsed.length > 0) {
        setSongs(parsed, 'SAMPLE_DATA.csv');
        addToast(t('toast.sampleLoaded', { count: parsed.length }), 'success');
      }
    } catch {
      addToast(t('errors.genericError'), 'error');
    }
    setLoadingSample(false);
  }, [setSongs, addToast, t]);

  const handleCopyBookmarklet = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(BOOKMARKLET);
      setCopied(true);
      addToast(t('toast.copied'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast(t('errors.genericError'), 'error');
    }
  }, [addToast, t]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/10 rounded-2xl mb-2">
          <Music size={32} className="text-accent-400" />
        </div>
        <h1 className="text-2xl font-bold text-surface-100">{t('home.title')}</h1>
        <p className="text-sm text-surface-400">{t('home.subtitle')}</p>
      </div>

      {/* Session resume card */}
      {songs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-800 rounded-2xl p-4 border border-accent-500/20"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-surface-100">{t('home.resume.title')}</h2>
          </div>
          {fileName && (
            <p className="text-xs text-surface-400">{t('home.resume.file', { name: fileName })}</p>
          )}
          <p className="text-xs text-surface-400">{t('home.resume.songs', { total: songs.length })}</p>
          <p className="text-xs text-surface-400 mb-3">
            {t('home.resume.reviewed', { count: reviewed, percent })}
          </p>
          <button
            onClick={() => navigate('/swipe')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-500 text-white text-sm font-medium rounded-xl hover:bg-accent-600 transition-colors"
          >
            {t('home.resume.continue')}
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* DropZone - only show if no existing session */}
      {songs.length === 0 && <DropZone />}

      {/* Load sample data */}
      <button
        onClick={handleLoadSample}
        disabled={loadingSample}
        className="w-full flex items-center justify-center gap-2 py-3 bg-surface-800 text-surface-200 text-sm font-medium rounded-xl border border-surface-700 hover:bg-surface-700 transition-colors disabled:opacity-50"
      >
        {loadingSample ? (
          <div className="w-4 h-4 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ListMusic size={16} />
        )}
        {t('home.dropzone.loadSample', { count: 1152 })}
      </button>

      {/* Actions row */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowHowTo(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-800 text-surface-300 text-sm rounded-xl border border-surface-700 hover:bg-surface-700 transition-colors"
        >
          <HelpCircle size={16} />
          {t('home.howToUse.title')}
        </button>

        {canInstall && (
          <button
            onClick={isIOS ? () => setShowHowTo(true) : install}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent-500/10 text-accent-400 text-sm rounded-xl border border-accent-500/20 hover:bg-accent-500/20 transition-colors"
          >
            <Download size={16} />
            {t('home.install.button')}
          </button>
        )}
      </div>

      {/* Feedback */}
      <div className="text-center">
        <a
          href="mailto:contact@peterbenceczaun.me?subject=Music%20Selector%20Feedback"
          className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300 transition-colors"
          rel="noopener noreferrer"
        >
          <Mail size={12} />
          {t('home.feedback')}
        </a>
      </div>

      {/* How To Use Modal */}
      <AnimatePresence>
        {showHowTo && (
          <HowToModal
            onClose={() => setShowHowTo(false)}
            onCopyBookmarklet={handleCopyBookmarklet}
            copied={copied}
            isIOS={isIOS}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HowToModal({
  onClose,
  onCopyBookmarklet,
  copied,
  isIOS,
}: {
  onClose: () => void;
  onCopyBookmarklet: () => void;
  copied: boolean;
  isIOS: boolean;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-surface-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-surface-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="sticky top-0 bg-surface-800 p-4 border-b border-surface-700 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-surface-100">{t('home.howToUse.title')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-surface-400 hover:text-surface-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Step 1: Bookmarklet */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Bookmark size={16} className="text-accent-400" />
              <h3 className="text-sm font-bold text-surface-100">
                {t('home.howToUse.bookmarklet.title')}
              </h3>
            </div>
            <ol className="space-y-2 text-sm text-surface-300 list-decimal list-inside">
              <li>{t('home.howToUse.bookmarklet.step1')}</li>
              <li>{t('home.howToUse.bookmarklet.step2')}</li>
              <li>{t('home.howToUse.bookmarklet.step3')}</li>
              <li>{t('home.howToUse.bookmarklet.step4')}</li>
              <li>{t('home.howToUse.bookmarklet.step5')}</li>
            </ol>
            <button
              onClick={onCopyBookmarklet}
              className="mt-3 flex items-center gap-2 px-3 py-2 bg-surface-700 text-surface-200 text-sm rounded-lg hover:bg-surface-600 transition-colors"
            >
              {copied ? <Check size={14} className="text-like" /> : <Copy size={14} />}
              {copied ? t('home.howToUse.bookmarklet.copied') : t('home.howToUse.bookmarklet.copyButton')}
            </button>
          </section>

          {/* Step 2: Swipe */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight size={16} className="text-like" />
              <h3 className="text-sm font-bold text-surface-100">
                {t('home.howToUse.swipe.title')}
              </h3>
            </div>
            <ul className="space-y-1.5 text-sm text-surface-300">
              <li>👉 {t('home.howToUse.swipe.right')}</li>
              <li>👈 {t('home.howToUse.swipe.left')}</li>
              <li>👆 {t('home.howToUse.swipe.up')}</li>
            </ul>
          </section>

          {/* Step 3: Library */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-accent-400" />
              <h3 className="text-sm font-bold text-surface-100">
                {t('home.howToUse.library.title')}
              </h3>
            </div>
            <p className="text-sm text-surface-300">
              {t('home.howToUse.library.description')}
            </p>
          </section>

          {/* Tips */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-skip" />
              <h3 className="text-sm font-bold text-surface-100">
                {t('home.howToUse.tips.title')}
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-surface-300">
              <li className="flex items-start gap-2">
                <Undo2 size={14} className="shrink-0 mt-0.5 text-surface-500" />
                {t('home.howToUse.tips.undo')}
              </li>
              <li className="flex items-start gap-2">
                <Keyboard size={14} className="shrink-0 mt-0.5 text-surface-500" />
                {t('home.howToUse.tips.keyboard')}
              </li>
              <li className="flex items-start gap-2">
                <Smartphone size={14} className="shrink-0 mt-0.5 text-surface-500" />
                {t('home.howToUse.tips.install')}
              </li>
            </ul>
          </section>

          {/* iOS install guide */}
          {isIOS && (
            <section className="bg-accent-500/10 rounded-xl p-3 border border-accent-500/20">
              <p className="text-sm text-accent-400 font-medium">
                {t('home.install.iosGuide')}
              </p>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
