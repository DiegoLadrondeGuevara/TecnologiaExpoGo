/**
 * Mercado Pago Payment Service (Mock)
 *
 * This service simulates creating a Mercado Pago Checkout Pro preference.
 * In production, this would call your backend API which uses the
 * Mercado Pago SDK to generate the preference with the real access token.
 *
 * Replace the mock with a real API call when your backend is ready:
 *   const res = await fetch(`${API_URL}/payments/create-preference`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ items, payer }),
 *   });
 *   return res.json();
 */

const MOCK_DELAY = 1000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Mercado Pago init_point URL for testing
const MOCK_INIT_POINT = 'https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=MOCK_PREFERENCE_ID';

/**
 * Creates a payment preference for Mercado Pago Checkout Pro.
 * @param {Array} cartItems - List of cart items
 * @param {number} total    - Total amount in USD
 * @param {string} currency - 'USD' | 'PEN'
 * @returns {Promise<{id: string, init_point: string, sandbox_init_point: string}>}
 */
export const createPaymentPreference = async (cartItems, total, currency = 'USD') => {
    await delay(MOCK_DELAY);

    // In production, your backend creates the preference using the MercadoPago SDK:
    // const preference = new Preference(client);
    // const result = await preference.create({ body: { items, back_urls, ... } });

    const preferenceId = `PREF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
        id: preferenceId,
        init_point: MOCK_INIT_POINT,
        sandbox_init_point: `https://sandbox.mercadopago.com.pe/checkout/v1/redirect?pref_id=${preferenceId}`,
    };
};

/**
 * Check payment status (mock).
 * @param {string} paymentId
 * @returns {Promise<{status: string, statusDetail: string}>}
 */
export const getPaymentStatus = async (paymentId) => {
    await delay(MOCK_DELAY / 2);

    return {
        status: 'approved',
        statusDetail: 'accredited',
        paymentId,
        externalReference: `ORDER_${Date.now()}`,
    };
};

/**
 * Mercado Pago callback URLs (used by backend to set back_urls).
 */
export const MP_CALLBACK_URLS = {
    success: 'techstore://payment/success',
    failure: 'techstore://payment/failure',
    pending: 'techstore://payment/pending',
};
