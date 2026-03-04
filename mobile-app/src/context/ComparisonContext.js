import React, { createContext, useContext, useState, useCallback } from 'react';

const MAX_COMPARISON = 3;
const ComparisonContext = createContext(null);

export const ComparisonProvider = ({ children }) => {
    const [comparisonItems, setComparisonItems] = useState([]);

    const toggleComparison = useCallback((product) => {
        setComparisonItems((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (exists) {
                return prev.filter((p) => p.id !== product.id);
            }
            if (prev.length >= MAX_COMPARISON) return prev;
            return [...prev, product];
        });
    }, []);

    const removeFromComparison = useCallback((productId) => {
        setComparisonItems((prev) => prev.filter((p) => p.id !== productId));
    }, []);

    const clearComparison = useCallback(() => {
        setComparisonItems([]);
    }, []);

    const isInComparison = useCallback(
        (id) => comparisonItems.some((p) => p.id === id),
        [comparisonItems]
    );

    const canAddMore = comparisonItems.length < MAX_COMPARISON;

    return (
        <ComparisonContext.Provider
            value={{
                comparisonItems,
                toggleComparison,
                removeFromComparison,
                clearComparison,
                isInComparison,
                canAddMore,
                comparisonCount: comparisonItems.length,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const ctx = useContext(ComparisonContext);
    if (!ctx) throw new Error('useComparison must be used within ComparisonProvider');
    return ctx;
};
