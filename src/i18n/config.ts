import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import trTranslations from "./locales/tr.json";
import enTranslations from "./locales/en.json";
import deTranslations from "./locales/de.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: trTranslations },
      en: { translation: enTranslations },
      de: { translation: deTranslations },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "cookie", "querystring", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
  });

export default i18n;
