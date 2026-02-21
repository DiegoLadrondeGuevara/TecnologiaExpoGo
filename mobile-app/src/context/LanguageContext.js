import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import i18n from 'shared-logic/i18n';
import { getCurrencyFromLocale } from 'shared-logic/currency';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [locale, setLocale] = useState(i18n.language || 'en');
    const [currency, setCurrency] = useState(getCurrencyFromLocale(locale));

    const toggleLanguage = useCallback(() => {
        const newLocale = locale === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLocale);
        setLocale(newLocale);
        setCurrency(getCurrencyFromLocale(newLocale));
    }, [locale]);

    const setLanguage = useCallback((lang) => {
        i18n.changeLanguage(lang);
        setLocale(lang);
        setCurrency(getCurrencyFromLocale(lang));
    }, []);

    return (
        <LanguageContext.Provider
            value={{
                locale,
                currency,
                toggleLanguage,
                setLanguage,
                t: i18n.t.bind(i18n),
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
