/**
 * Auth Service — API calls for login, register & Google OAuth
 */
import apiClient from 'shared-logic/apiClient';

/**
 * Login with email/username and password
 * @param {string} identifier - Email or username
 * @param {string} password
 * @returns {{ user: { id, name, email, role }, access_token: string }}
 */
export const loginUser = async (identifier, password) => {
    return apiClient.post('/auth/login', { identifier, password });
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
 * Login or register using a Google ID token
 * @param {string} idToken - The ID token from Google Sign-In
 * @returns {{ user: { id, name, email, role, avatarUrl }, access_token: string }}
 */
export const loginWithGoogle = async (idToken) => {
    return apiClient.post('/auth/google', { idToken });
};

/**
 * Get the current authenticated user's profile
 * @returns {{ id, name, email, role, preferredLanguage, preferredCurrency }}
 */
export const getMe = async () => {
    return apiClient.get('/users/me');
};
