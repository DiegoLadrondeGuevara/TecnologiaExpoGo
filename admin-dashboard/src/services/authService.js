/**
 * Admin Dashboard Auth Service
 */
import apiClient, { setAuthToken } from '../../../shared-logic/apiClient';

export const login = async (email, password) => {
    const data = await apiClient.post('/auth/login', { email, password });
    const { access_token, user } = data;

    // Persist token
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
