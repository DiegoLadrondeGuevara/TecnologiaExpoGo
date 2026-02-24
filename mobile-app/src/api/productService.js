/**
 * Mobile App — Product Service (Real API)
 *
 * Replaces mock data with real backend calls.
 * Resolves bilingual fields (nameEn/nameEs) based on current language.
 */
import apiClient from '../../../shared-logic/apiClient';
import i18n from 'shared-logic/i18n';

/** Map backend product → mobile-friendly product (with resolved name/description) */
const mapProduct = (p) => {
    const lang = i18n.language || 'en';
    return {
        id: p.id,
        name: lang === 'es' ? p.nameEs : p.nameEn,
        description: lang === 'es' ? p.descriptionEs : p.descriptionEn,
        price: p.price,
        specs: p.specs || [],
        image_url: p.imageUrl,
        stock: p.stock,
        category: p.category?.name || '',
        categoryId: p.categoryId,
    };
};

/**
 * Fetches all products from the backend.
 */
export const getProducts = async () => {
    const data = await apiClient.get('/products');
    return (Array.isArray(data) ? data : []).map(mapProduct);
};

/**
 * Fetches a single product by ID.
 */
export const getProductById = async (id) => {
    const data = await apiClient.get(`/products/${id}`);
    return mapProduct(data);
};

/**
 * Returns the list of categories including 'All'.
 */
export const getCategories = async () => {
    const data = await apiClient.get('/categories');
    const names = (Array.isArray(data) ? data : []).map(c => c.name);
    return ['All', ...names];
};

/**
 * Searches products by name.
 */
export const searchProducts = async (query) => {
    const data = await apiClient.get('/products', { params: { search: query } });
    return (Array.isArray(data) ? data : []).map(mapProduct);
};

/**
 * Filters products by category name.
 */
export const getProductsByCategory = async (category) => {
    if (category === 'All') return getProducts();
    // We need to resolve categoryId from name — just filter client-side for simplicity
    const all = await getProducts();
    return all.filter(p => p.category === category);
};
