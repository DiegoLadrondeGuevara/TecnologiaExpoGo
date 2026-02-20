import products from '../data/products.json';

// Base URL for the backend API (loaded from .env)
// In Expo, environment variables prefixed with EXPO_PUBLIC_ are accessible via process.env
// For now, we use a local constant that can be swapped when a real backend is available.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.techstore.com/v1';

const SIMULATED_DELAY = 800;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches all products.
 * When a real backend is available, replace with:
 *   const res = await fetch(`${API_URL}/products`);
 *   return res.json();
 */
export const getProducts = async () => {
    await delay(SIMULATED_DELAY);
    return [...products];
};

/**
 * Fetches a single product by ID.
 */
export const getProductById = async (id) => {
    await delay(SIMULATED_DELAY / 2);
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error(`Product with id ${id} not found`);
    return { ...product };
};

/**
 * Returns the list of unique categories.
 */
export const getCategories = async () => {
    await delay(SIMULATED_DELAY / 2);
    const categories = [...new Set(products.map((p) => p.category))];
    return ['All', ...categories];
};

/**
 * Searches products by name or category.
 */
export const searchProducts = async (query) => {
    await delay(SIMULATED_DELAY / 2);
    const lowerQuery = query.toLowerCase();
    return products.filter(
        (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Filters products by category.
 */
export const getProductsByCategory = async (category) => {
    await delay(SIMULATED_DELAY / 2);
    if (category === 'All') return [...products];
    return products.filter((p) => p.category === category);
};
