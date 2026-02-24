export type LanguageCode = 'en' | 'es';
export type CurrencyCode = 'USD' | 'PEN';
export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface ExchangeRate {
    fromCurrency: CurrencyCode;
    toCurrency: CurrencyCode;
    rate: number;
    updatedAt: Date;
}

export interface AppConfig {
    id: string;
    empresaId: string;
    defaultLanguage: LanguageCode;
    defaultCurrency: CurrencyCode;
    baseCurrency: CurrencyCode;
    exchangeRatePEN: number;
    taxRate: number;
    maintenanceMode: boolean;
    updatedAt: Date;
}

export interface Product {
    id: string;
    nameEn: string;
    nameEs: string;
    descriptionEn: string;
    descriptionEs: string;
    price: number;
    specs: string[];
    imageUrl: string;
    stock: number;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    productCount?: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    preferredLanguage: LanguageCode;
    preferredCurrency: CurrencyCode;
    registeredAt: Date;
}

export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    currency: CurrencyCode;
    status: 'pending' | 'approved' | 'rejected' | 'in_process';
    method: string;
    date: Date;
}

export interface Order {
    id: string;
    userId: string;
    subtotal: number;
    tax: number;
    total: number;
    currency: CurrencyCode;
    exchangeRate: number;
    status: 'pending' | 'paid' | 'failed' | 'shipped' | 'delivered' | 'refunded';
    createdAt: Date;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    activeUsers: number;
    totalProducts: number;
    recentPayments: Array<{
        id: string;
        orderId: string;
        userName: string;
        amount: number;
        currency: string;
        status: string;
        date: Date;
        items: string[];
    }>;
}
