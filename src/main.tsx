import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './i18n/config';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker with update prompt
const updateSW = registerSW({
  onNeedRefresh() {
    // Defer toast import to avoid circular dependency during init
    import('@/store/toastStore').then(({ useToastStore }) => {
      useToastStore.getState().addToast('Update available — tap to reload', 'info');
    });
    // Auto-apply after a short delay
    setTimeout(() => updateSW(true), 5000);
  },
  onOfflineReady() {
    import('@/store/toastStore').then(({ useToastStore }) => {
      useToastStore.getState().addToast('App ready for offline use', 'success');
    });
  },
});
