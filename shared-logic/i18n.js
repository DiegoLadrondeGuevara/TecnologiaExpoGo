import i18next from 'i18next';
import en from './locales/en.json';
import es from './locales/es.json';

const i18n = i18next.createInstance();

i18n.init({
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

export default i18n;
