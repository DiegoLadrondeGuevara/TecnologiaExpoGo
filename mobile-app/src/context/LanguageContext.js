import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import i18n from 'shared-logic/i18n';
import { getCurrencyFromLocale } from 'shared-logic/currency';
import { getConfig, subscribeToConfigUpdates } from '../api/configService';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [locale, setLocale] = useState(i18n.language || 'en');
    const [currency, setCurrency] = useState(getCurrencyFromLocale(locale));
    const [exchangeRate, setExchangeRate] = useState(3.80);
    const disconnectRef = useRef(null);

    // Fetch initial config from backend on mount
    useEffect(() => {
        const fetchInitialConfig = async () => {
            try {
                const config = await getConfig();
                if (config) {
                    const lang = config.defaultLanguage || 'en';
                    i18n.changeLanguage(lang);
                    setLocale(lang);
                    setCurrency(getCurrencyFromLocale(lang));
                    if (config.exchangeRatePEN) {
                        setExchangeRate(config.exchangeRatePEN);
                    }
                }
            } catch (error) {
                // Backend not available — use defaults
                console.warn('Could not fetch config, using defaults:', error.message);
            }
        };
        fetchInitialConfig();
    }, []);

    // Subscribe to WebSocket config updates
    useEffect(() => {
        const disconnect = subscribeToConfigUpdates((config) => {
            if (config.defaultLanguage) {
                const lang = config.defaultLanguage;
                i18n.changeLanguage(lang);
                setLocale(lang);
                setCurrency(getCurrencyFromLocale(lang));
            }
            if (config.exchangeRatePEN) {
                setExchangeRate(config.exchangeRatePEN);
            }
        });
        disconnectRef.current = disconnect;

        return () => {
            if (disconnectRef.current) {
                disconnectRef.current();
            }
        };
    }, []);

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
                exchangeRate,
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
