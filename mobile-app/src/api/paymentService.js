/**
 * Payment Service — Real API calls via apiClient
 * Creates orders and Mercado Pago payment preferences through the backend
 */
import apiClient from 'shared-logic/apiClient';

/**
 * Create an order on the backend.
 * @param {Array<{productId: string, quantity: number}>} items
 * @param {string} currency - 'USD' | 'PEN'
 * @param {number} exchangeRate
 * @param {string} [shippingAddress] - Shipping address for delivery
 * @returns {Promise<{id, subtotal, tax, total, items, ...}>}
 */
export const createOrder = async (items, currency = 'USD', exchangeRate = 1, shippingAddress = '') => {
    return apiClient.post('/orders', {
        items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
        })),
        currency,
        exchangeRate,
        shippingAddress: shippingAddress || undefined,
    });
};

/**
 * Creates a Mercado Pago payment preference for an existing order.
 * The backend uses the real MP SDK to generate the checkout URL.
 * @param {string} orderId
 * @returns {Promise<{id, init_point, sandbox_init_point, paymentId}>}
 */
export const createPaymentPreference = async (orderId) => {
    return apiClient.post('/payments/create-preference', { orderId });
};

/**
 * Fetches the current user's order history from the backend.
 * Backend returns user-specific orders for CUSTOMER role, all orders for ADMIN.
 * @returns {Promise<Array<{id, subtotal, tax, total, status, createdAt, items, payment}>>}
 */
export const fetchMyOrders = async () => {
    return apiClient.get('/orders');
};

/**
 * Confirm a payment from the client side (after MP redirect).
 * Backend verifies with MercadoPago API and updates order status.
 */
export const confirmPayment = async (orderId, paymentId, status) => {
    return apiClient.post('/payments/confirm', { orderId, paymentId, status });
};

/**
 * Cancel a pending order. Used when the user exits the payment flow
 * without completing the payment.
 * @param {string} orderId
 * @returns {Promise<{cancelled: boolean, orderId: string}>}
 */
export const cancelOrder = async (orderId) => {
    return apiClient.delete(`/orders/${orderId}/cancel`);
};

/**
 * Mercado Pago callback URLs (matched in backend back_urls config).
 */
export const MP_CALLBACK_URLS = {
    success: 'techstore://payment/success',
    failure: 'techstore://payment/failure',
    pending: 'techstore://payment/pending',
};
