import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import itTranslation from "./locales/it/translation.json";
import enTranslation from "./locales/en/translation.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            it: { translation: itTranslation },
            en: { translation: enTranslation },
        },
        fallbackLng: "it",
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
            lookupLocalStorage: "i18nextLng",
        },
    });

export default i18n;