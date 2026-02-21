import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../shared-logic/locales/en.json';
import es from '../../shared-logic/locales/es.json';

i18next
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
