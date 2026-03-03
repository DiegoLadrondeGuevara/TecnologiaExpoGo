/**
 * Admin Dashboard Auth Service
 */
import apiClient, { setAuthToken } from '../../../shared-logic/apiClient';

/**
 * Login with email/username and password
 * @param {string} identifier - Email or username
 * @param {string} password
 */
export const login = async (identifier, password) => {
    const data = await apiClient.post('/auth/login', { identifier, password });
    const { access_token, user } = data;

    // Persist token
    localStorage.setItem('techstore_token', access_token);
    setAuthToken(access_token);

    return { token: access_token, user };
};

/**
 * Login or register using a Google ID token
 * @param {string} idToken
 */
export const loginWithGoogle = async (idToken) => {
    const data = await apiClient.post('/auth/google', { idToken });
    const { access_token, user } = data;

    localStorage.setItem('techstore_token', access_token);
    setAuthToken(access_token);

    return { token: access_token, user };
};

export const logout = () => {
    localStorage.removeItem('techstore_token');
    setAuthToken(null);
    window.location.href = '/login';
};

export const getStoredToken = () => {
    return localStorage.getItem('techstore_token');
};

export const isAuthenticated = () => {
    return !!getStoredToken();
};
