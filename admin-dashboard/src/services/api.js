/**
 * Admin Dashboard Mock API Service
 *
 * Simulates backend API calls for all admin CRUD operations.
 * Replace the mock implementations with real fetch calls when backend is ready.
 */

const MOCK_DELAY = 600;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- PRODUCTS ----------

let products = [
    { id: '1', name_en: 'MacBook Pro 16"', name_es: 'MacBook Pro 16"', price: 2499, description_en: 'The most powerful MacBook Pro ever. M3 Max chip, 48GB unified memory, Liquid Retina XDR.', description_es: 'El MacBook Pro más potente de todos. Chip M3 Max, 48GB de memoria unificada, Liquid Retina XDR.', specs: ['M3 Max Chip', '48GB Unified Memory', '1TB SSD', '16" Liquid Retina XDR'], image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', stock: 15, category: 'Laptops' },
    { id: '2', name_en: 'Dell XPS 15', name_es: 'Dell XPS 15', price: 1799, description_en: 'Ultra-thin and powerful. 15.6" OLED InfinityEdge display with Intel Core i9.', description_es: 'Ultra delgado y potente. Pantalla OLED InfinityEdge de 15.6" con Intel Core i9.', specs: ['Intel Core i9', '32GB RAM', '512GB SSD', '15.6" OLED Display'], image_url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600', stock: 22, category: 'Laptops' },
    { id: '3', name_en: 'ThinkPad X1 Carbon', name_es: 'ThinkPad X1 Carbon', price: 1549, description_en: 'Business ultrabook with ThinkPad reliability. 14" 2.8K OLED display.', description_es: 'Ultrabook empresarial con la fiabilidad ThinkPad. Pantalla OLED 2.8K de 14".', specs: ['Intel Core i7 vPro', '16GB RAM', '512GB SSD', '14" 2.8K OLED'], image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', stock: 18, category: 'Laptops' },
    { id: '4', name_en: 'ASUS ROG Zephyrus', name_es: 'ASUS ROG Zephyrus', price: 2199, description_en: 'Gaming powerhouse in ultra-slim chassis. RTX 4080 with 240Hz QHD display.', description_es: 'Potencia gaming en un chasis ultra delgado. RTX 4080 con pantalla QHD 240Hz.', specs: ['AMD Ryzen 9', 'RTX 4080', '32GB RAM', '16" 240Hz QHD'], image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600', stock: 10, category: 'Laptops' },
    { id: '5', name_en: 'iPhone 16 Pro Max', name_es: 'iPhone 16 Pro Max', price: 1199, description_en: 'Titanium design. A18 Pro chip. 48MP camera system with 5x Telephoto.', description_es: 'Diseño en titanio. Chip A18 Pro. Sistema de cámara de 48MP con telefoto 5x.', specs: ['A18 Pro Chip', '256GB Storage', '48MP Camera', '6.9" Super Retina XDR'], image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', stock: 30, category: 'Smartphones' },
    { id: '6', name_en: 'Samsung Galaxy S25 Ultra', name_es: 'Samsung Galaxy S25 Ultra', price: 1299, description_en: 'AI-powered smartphone with titanium frame. 200MP camera.', description_es: 'Smartphone con IA y marco de titanio. Cámara de 200MP.', specs: ['Snapdragon 8 Elite', '12GB RAM', '200MP Camera', '6.8" Dynamic AMOLED'], image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600', stock: 25, category: 'Smartphones' },
    { id: '7', name_en: 'AirPods Pro 3', name_es: 'AirPods Pro 3', price: 249, description_en: 'Adaptive Audio, Personalized Spatial Audio, and 2x Active Noise Cancellation.', description_es: 'Audio Adaptativo, Audio Espacial Personalizado y 2x Cancelación Activa de Ruido.', specs: ['H3 Chip', 'Adaptive Audio', 'USB-C', '6h Battery Life'], image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600', stock: 50, category: 'Gadgets' },
    { id: '8', name_en: 'Sony WH-1000XM6', name_es: 'Sony WH-1000XM6', price: 349, description_en: 'Industry-leading noise cancellation with 40-hour battery.', description_es: 'Cancelación de ruido líder en la industria con 40 horas de batería.', specs: ['V2 Processor', 'LDAC Hi-Res', '40h Battery', 'Multipoint'], image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', stock: 35, category: 'Gadgets' },
];

// ---------- USERS ----------

let users = [
    { id: 'u1', name: 'Carlos Mendoza', email: 'carlos@email.com', registeredAt: '2025-11-15', orders: 8, totalSpent: 4250 },
    { id: 'u2', name: 'Maria García', email: 'maria@email.com', registeredAt: '2025-12-01', orders: 3, totalSpent: 1899 },
    { id: 'u3', name: 'John Smith', email: 'john@email.com', registeredAt: '2026-01-10', orders: 5, totalSpent: 3499 },
    { id: 'u4', name: 'Ana López', email: 'ana@email.com', registeredAt: '2026-01-22', orders: 2, totalSpent: 798 },
    { id: 'u5', name: 'David Chen', email: 'david@email.com', registeredAt: '2026-02-05', orders: 1, totalSpent: 2499 },
    { id: 'u6', name: 'Sofia Torres', email: 'sofia@email.com', registeredAt: '2026-02-14', orders: 4, totalSpent: 2147 },
];

// ---------- PAYMENTS ----------

let payments = [
    { id: 'pay_001', orderId: 'ORD-2026-001', userId: 'u1', userName: 'Carlos Mendoza', amount: 2499, currency: 'USD', status: 'approved', method: 'mercadopago', date: '2026-02-18T14:30:00Z', items: ['MacBook Pro 16"'] },
    { id: 'pay_002', orderId: 'ORD-2026-002', userId: 'u2', userName: 'Maria García', amount: 1199, currency: 'USD', status: 'approved', method: 'mercadopago', date: '2026-02-17T10:15:00Z', items: ['iPhone 16 Pro Max'] },
    { id: 'pay_003', orderId: 'ORD-2026-003', userId: 'u3', userName: 'John Smith', amount: 1799, currency: 'USD', status: 'pending', method: 'mercadopago', date: '2026-02-19T16:45:00Z', items: ['Dell XPS 15'] },
    { id: 'pay_004', orderId: 'ORD-2026-004', userId: 'u4', userName: 'Ana López', amount: 249, currency: 'USD', status: 'approved', method: 'mercadopago', date: '2026-02-19T09:20:00Z', items: ['AirPods Pro 3'] },
    { id: 'pay_005', orderId: 'ORD-2026-005', userId: 'u5', userName: 'David Chen', amount: 2499, currency: 'USD', status: 'rejected', method: 'mercadopago', date: '2026-02-20T11:00:00Z', items: ['MacBook Pro 16"'] },
    { id: 'pay_006', orderId: 'ORD-2026-006', userId: 'u6', userName: 'Sofia Torres', amount: 1548, currency: 'USD', status: 'approved', method: 'mercadopago', date: '2026-02-20T13:10:00Z', items: ['iPhone 16 Pro Max', 'Sony WH-1000XM6'] },
];

// ---------- CATEGORIES ----------

let categories = [
    { id: 'cat1', name: 'Laptops', productCount: 4, color: '#007AFF' },
    { id: 'cat2', name: 'Smartphones', productCount: 2, color: '#34C759' },
    { id: 'cat3', name: 'Gadgets', productCount: 2, color: '#FF9500' },
    { id: 'cat4', name: 'Tablets', productCount: 0, color: '#AF52DE' },
    { id: 'cat5', name: 'Accessories', productCount: 0, color: '#FF2D55' },
];

// ==================== API FUNCTIONS ====================

// --- Products ---
export const fetchProducts = async () => { await delay(MOCK_DELAY); return [...products]; };
export const fetchProductById = async (id) => { await delay(MOCK_DELAY / 2); return products.find(p => p.id === id) || null; };
export const createProduct = async (product) => {
    await delay(MOCK_DELAY);
    const newProduct = { ...product, id: `p${Date.now()}` };
    products = [newProduct, ...products];
    return newProduct;
};
export const updateProduct = async (id, data) => {
    await delay(MOCK_DELAY);
    products = products.map(p => p.id === id ? { ...p, ...data } : p);
    return products.find(p => p.id === id);
};
export const deleteProduct = async (id) => {
    await delay(MOCK_DELAY / 2);
    products = products.filter(p => p.id !== id);
    return { success: true };
};

// --- Users ---
export const fetchUsers = async () => { await delay(MOCK_DELAY); return [...users]; };

// --- Payments ---
export const fetchPayments = async () => { await delay(MOCK_DELAY); return [...payments]; };

// --- Categories ---
export const fetchCategories = async () => { await delay(MOCK_DELAY / 2); return [...categories]; };
export const createCategory = async (category) => {
    await delay(MOCK_DELAY);
    const newCat = { ...category, id: `cat${Date.now()}`, productCount: 0 };
    categories = [newCat, ...categories];
    return newCat;
};
export const deleteCategory = async (id) => {
    await delay(MOCK_DELAY / 2);
    categories = categories.filter(c => c.id !== id);
    return { success: true };
};

// --- Dashboard Stats ---
export const fetchDashboardStats = async () => {
    await delay(MOCK_DELAY);
    const totalSales = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
    return {
        totalSales,
        totalOrders: payments.length,
        activeUsers: users.length,
        totalProducts: products.length,
        recentPayments: payments.slice(0, 5),
    };
};
