import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';

const resources = {
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng);
  const dir = ['ar', 'he', 'fa', 'ur'].includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
});

export default i18n;
