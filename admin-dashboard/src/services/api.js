/**
 * Admin Dashboard API Service
 *
 * Real API calls to the NestJS backend.
 * Field mapping is done here so page components need ZERO changes.
 * Backend uses: nameEn, nameEs, imageUrl, categoryId
 * Frontend uses: name_en, name_es, image_url, category (string name)
 */
import apiClient from '../../../shared-logic/apiClient';

// ─── Field Mappers ───

/** Backend product → Frontend product (what pages expect) */
const mapProduct = (p) => ({
    id: p.id,
    name_en: p.nameEn,
    name_es: p.nameEs,
    description_en: p.descriptionEn,
    description_es: p.descriptionEs,
    price: p.price,
    specs: p.specs || [],
    image_url: p.imageUrl,
    stock: p.stock,
    category: p.category?.name || '',
    categoryId: p.categoryId,
    createdAt: p.createdAt,
});

/** Frontend form → Backend DTO */
const mapProductToBackend = (form) => ({
    nameEn: form.name_en,
    nameEs: form.name_es,
    descriptionEn: form.description_en,
    descriptionEs: form.description_es,
    price: Number(form.price),
    specs: Array.isArray(form.specs) ? form.specs : form.specs.split(',').map(s => s.trim()).filter(Boolean),
    imageUrl: form.image_url,
    stock: Number(form.stock),
    categoryId: form.categoryId || form.category,
});

/** Backend user → Frontend user */
const mapUser = (u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    registeredAt: u.registeredAt,
    orders: u._count?.orders || u.orderCount || 0,
    totalSpent: u.totalSpent || 0,
    role: u.role,
});

/** Backend payment → Frontend payment */
const mapPayment = (p) => ({
    id: p.id,
    orderId: p.orderId,
    userName: p.order?.user?.name || 'Unknown',
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    method: p.method,
    date: p.date,
    items: p.order?.items?.map(i => i.product?.nameEn || 'Product') || [],
});

/** Backend category → Frontend category */
const mapCategory = (c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    productCount: c._count?.products ?? c.productCount ?? 0,
});

// ─── API Functions ───

// --- Products ---
export const fetchProducts = async () => {
    const data = await apiClient.get('/products');
    return (Array.isArray(data) ? data : []).map(mapProduct);
};

export const fetchProductById = async (id) => {
    const data = await apiClient.get(`/products/${id}`);
    return mapProduct(data);
};

export const createProduct = async (product) => {
    const dto = mapProductToBackend(product);
    const data = await apiClient.post('/products', dto);
    return mapProduct(data);
};

export const updateProduct = async (id, product) => {
    const dto = mapProductToBackend(product);
    const data = await apiClient.patch(`/products/${id}`, dto);
    return mapProduct(data);
};

export const deleteProduct = async (id) => {
    await apiClient.delete(`/products/${id}`);
    return { success: true };
};

// --- Users ---
export const fetchUsers = async () => {
    const data = await apiClient.get('/users');
    return (Array.isArray(data) ? data : []).map(mapUser);
};

// --- Payments ---
export const fetchPayments = async () => {
    const data = await apiClient.get('/payments');
    return (Array.isArray(data) ? data : []).map(mapPayment);
};

// --- Orders (Sales) ---
const mapOrder = (o) => ({
    id: o.id,
    userId: o.userId,
    userName: o.user?.name || 'Unknown',
    userEmail: o.user?.email || '',
    subtotal: o.subtotal,
    tax: o.tax,
    total: o.total,
    currency: o.currency,
    status: o.status,
    createdAt: o.createdAt,
    items: (o.items || []).map((i) => ({
        productName: i.product?.nameEn || 'Product',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
    })),
    payment: o.payment,
});

export const fetchOrders = async () => {
    const data = await apiClient.get('/orders');
    return (Array.isArray(data) ? data : []).map(mapOrder);
};

// --- Categories ---
export const fetchCategories = async () => {
    const data = await apiClient.get('/categories');
    return (Array.isArray(data) ? data : []).map(mapCategory);
};

export const createCategory = async (category) => {
    const data = await apiClient.post('/categories', {
        name: category.name,
        color: category.color || '#007AFF',
    });
    return mapCategory(data);
};

export const deleteCategory = async (id) => {
    await apiClient.delete(`/categories/${id}`);
    return { success: true };
};

// --- Dashboard Stats ---
export const fetchDashboardStats = async () => {
    const data = await apiClient.get('/dashboard/stats');
    return {
        totalSales: data.totalSales || 0,
        totalOrders: data.totalOrders || 0,
        activeUsers: data.activeUsers || 0,
        totalProducts: data.totalProducts || 0,
        recentPayments: (data.recentPayments || []).map(mapPayment),
    };
};

// --- Config ---
export const fetchConfig = async () => {
    const data = await apiClient.get('/config');
    return data;
};

export const updateConfig = async (config) => {
    const data = await apiClient.put('/config', config);
    return data;
};
