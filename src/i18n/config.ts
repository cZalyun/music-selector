import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// In a real app, you would load these from separate files
const resources = {
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        save: 'Save',
        cancel: 'Cancel',
      },
      nav: {
        upload: 'Upload',
        swipe: 'Swipe',
        library: 'Library',
        settings: 'Settings'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
