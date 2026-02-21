/**
 * Shared constants and enums for the TechStore ecosystem.
 */

export const CATEGORIES = [
    'Laptops',
    'Smartphones',
    'Gadgets',
    'Tablets',
    'Accessories',
];

export const ORDER_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_PROCESS: 'in_process',
};

export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇵🇪' },
];

export const SUPPORTED_CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'PEN', symbol: 'S/.', label: 'Sol Peruano' },
];

export const TAX_RATE = 0.16;
