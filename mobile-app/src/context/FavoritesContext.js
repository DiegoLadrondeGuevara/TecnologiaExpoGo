import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

const getStorageKey = (userId) => `techstore_favorites_${userId}`;

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const currentUserRef = useRef(null);

    // Load favorites whenever user changes
    useEffect(() => {
        const userId = user?.id;

        // User changed — reset and reload
        if (currentUserRef.current !== userId) {
            currentUserRef.current = userId;
            setFavorites([]);
            setLoaded(false);
        }

        if (!userId) {
            setLoaded(true);
            return;
        }

        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(getStorageKey(userId));
                if (stored) setFavorites(JSON.parse(stored));
            } catch (e) {
                console.warn('Failed to load favorites:', e);
            }
            setLoaded(true);
        };
        load();
    }, [user?.id]);

    const persist = async (items) => {
        const userId = currentUserRef.current;
        if (!userId) return;
        try {
            await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(items));
        } catch (e) {
            console.warn('Failed to persist favorites:', e);
        }
    };

    const toggleFavorite = useCallback((product) => {
        setFavorites((prev) => {
            const exists = prev.some((p) => p.id === product.id);
            const next = exists
                ? prev.filter((p) => p.id !== product.id)
                : [...prev, product];
            persist(next);
            return next;
        });
    }, []);

    const isFavorite = useCallback(
        (productId) => favorites.some((p) => p.id === productId),
        [favorites],
    );

    return (
        <FavoritesContext.Provider
            value={{ favorites, toggleFavorite, isFavorite, loaded }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
    return context;
};
