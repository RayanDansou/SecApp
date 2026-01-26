import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from './locales/fr/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du navigateur
  .use(initReactI18next) // Passe i18n à react-i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut
    lng: localStorage.getItem('language') || 'fr', // Langue sauvegardée ou défaut
    debug: false,

    interpolation: {
      escapeValue: false // React échappe déjà les valeurs
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Sauvegarder la langue dans localStorage à chaque changement
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
