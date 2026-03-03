import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const RecentlyViewedContext = createContext();

const getStorageKey = (userId) => `techstore_recently_viewed_${userId}`;
const MAX_ITEMS = 10;

export const RecentlyViewedProvider = ({ children }) => {
    const { user } = useAuth();
    const [recentItems, setRecentItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const currentUserRef = useRef(null);

    // Load recently viewed whenever user changes
    useEffect(() => {
        const userId = user?.id;

        // User changed — reset and reload
        if (currentUserRef.current !== userId) {
            currentUserRef.current = userId;
            setRecentItems([]);
            setLoaded(false);
        }

        if (!userId) {
            setLoaded(true);
            return;
        }

        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(getStorageKey(userId));
                if (stored) setRecentItems(JSON.parse(stored));
            } catch (e) {
                console.warn('Failed to load recently viewed:', e);
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
            console.warn('Failed to persist recently viewed:', e);
        }
    };

    const addRecentlyViewed = useCallback((product) => {
        setRecentItems((prev) => {
            // Remove duplicate, add to front, cap at MAX_ITEMS
            const filtered = prev.filter((p) => p.id !== product.id);
            const next = [product, ...filtered].slice(0, MAX_ITEMS);
            persist(next);
            return next;
        });
    }, []);

    const clearRecentlyViewed = useCallback(() => {
        setRecentItems([]);
        const userId = currentUserRef.current;
        if (userId) {
            AsyncStorage.removeItem(getStorageKey(userId)).catch(() => { });
        }
    }, []);

    return (
        <RecentlyViewedContext.Provider value={{ recentItems, addRecentlyViewed, clearRecentlyViewed, loaded }}>
            {children}
        </RecentlyViewedContext.Provider>
    );
};

export const useRecentlyViewed = () => {
    const context = useContext(RecentlyViewedContext);
    if (!context) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
    return context;
};
