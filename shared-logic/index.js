/**
 * TechStore Shared Logic
 * Re-exports all shared modules for convenient importing.
 */

export { default as i18n } from './i18n';
export { convertCurrency, formatPrice, getCurrencyFromLocale, EXCHANGE_RATES, CURRENCY_SYMBOLS, CURRENCY_LOCALES } from './currency';
export { CATEGORIES, ORDER_STATUS, PAYMENT_STATUS, SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES, TAX_RATE } from './constants';
