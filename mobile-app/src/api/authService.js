/**
 * Auth Service — API calls for login & register
 */
import apiClient from 'shared-logic/apiClient';

/**
 * Login with email and password
 * @returns {{ user: { id, name, email, role }, access_token: string }}
 */
export const loginUser = async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
};

/**
 * Register a new customer account
 * @returns {{ user: { id, name, email, role }, access_token: string }}
 */
export const registerUser = async (name, email, password) => {
    return apiClient.post('/auth/register', {
        name,
        email,
        password,
        role: 'CUSTOMER',
    });
};

/**
 * Get the current authenticated user's profile
 * @returns {{ id, name, email, role, preferredLanguage, preferredCurrency }}
 */
export const getMe = async () => {
    return apiClient.get('/users/me');
};
