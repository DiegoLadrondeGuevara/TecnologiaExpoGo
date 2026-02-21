/**
 * Currency conversion & formatting module.
 *
 * Base currency for all product prices is USD.
 * Supported currencies: USD ($) and PEN (S/.)
 */

const EXCHANGE_RATES = {
    USD: 1,
    PEN: 3.80,
};

const CURRENCY_SYMBOLS = {
    USD: '$',
    PEN: 'S/.',
};

const CURRENCY_LOCALES = {
    USD: 'en-US',
    PEN: 'es-PE',
};

/**
 * Convert an amount from one currency to another.
 * @param {number} amount
 * @param {string} from - 'USD' | 'PEN'
 * @param {string} to   - 'USD' | 'PEN'
 * @returns {number}
 */
export const convertCurrency = (amount, from = 'USD', to = 'USD') => {
    if (from === to) return amount;
    // Convert to USD first, then to target
    const inUSD = amount / EXCHANGE_RATES[from];
    return inUSD * EXCHANGE_RATES[to];
};

/**
 * Format a price for display.
 * @param {number} amountUSD - Price in USD (base currency)
 * @param {string} currency  - Target currency: 'USD' | 'PEN'
 * @returns {string} e.g. "$2,499.00" or "S/.9,496.20"
 */
export const formatPrice = (amountUSD, currency = 'USD') => {
    const converted = convertCurrency(amountUSD, 'USD', currency);
    const symbol = CURRENCY_SYMBOLS[currency];
    const locale = CURRENCY_LOCALES[currency];
    const formatted = converted.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
};

/**
 * Get currency code from locale.
 * @param {string} locale - 'en' | 'es'
 * @returns {string} 'USD' | 'PEN'
 */
export const getCurrencyFromLocale = (locale) => {
    return locale === 'es' ? 'PEN' : 'USD';
};

export { EXCHANGE_RATES, CURRENCY_SYMBOLS, CURRENCY_LOCALES };
