import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setThemePalette } from '../theme/colors';

const ThemeContext = createContext();
const STORAGE_KEY = 'techstore_theme_mode';

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light'); // 'light' | 'dark' | 'system'
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) setMode(stored);
            } catch (e) {
                console.warn('Failed to load theme:', e);
            }
            setLoaded(true);
        };
        load();
    }, []);

    const setTheme = useCallback(async (newMode) => {
        setMode(newMode);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, newMode);
        } catch (e) {
            console.warn('Failed to persist theme:', e);
        }
    }, []);

    const resolvedMode = useMemo(() => {
        if (mode === 'system') {
            return Appearance.getColorScheme() || 'light';
        }
        return mode;
    }, [mode]);

    // Listen for system theme changes when in 'system' mode
    useEffect(() => {
        if (mode !== 'system') return;
        const sub = Appearance.addChangeListener(() => {
            setMode('system');
        });
        return () => sub?.remove();
    }, [mode]);

    const isDark = resolvedMode === 'dark';

    // Switch the palette in colors.js whenever resolved theme changes
    useEffect(() => {
        setThemePalette(resolvedMode);
    }, [resolvedMode]);

    // Also set on initial load
    useEffect(() => {
        if (loaded) {
            setThemePalette(resolvedMode);
        }
    }, [loaded]);

    return (
        <ThemeContext.Provider value={{ isDark, mode, setTheme }}>
            {loaded ? children : null}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
