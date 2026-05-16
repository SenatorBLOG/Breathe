// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';
import es from './locales/es/translation.json';

i18n
  .use(LanguageDetector)        // auto-detect from browser settings
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React handles XSS
    },
  });

// Keep <html lang> + <html dir> in sync with the active language so:
//   - screen readers use the correct voice
//   - Google indexes content under the right locale
//   - Chrome's "translate this page" prompt stops firing on already-translated text
const applyHtmlLang = (lng: string) => {
  if (typeof document === 'undefined') return;
  const code = lng.split('-')[0];
  document.documentElement.lang = code;
  // RTL placeholder — currently no RTL locale is shipped, but this keeps the slot ready
  document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].includes(code) ? 'rtl' : 'ltr';
};
applyHtmlLang(i18n.language || 'en');
i18n.on('languageChanged', applyHtmlLang);

export default i18n;