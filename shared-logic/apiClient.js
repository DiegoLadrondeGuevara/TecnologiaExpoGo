/**
 * Shared API Client
 * Configurado para TechStore: NestJS + Vite Dashboard + Expo Mobile
 */
import axios from 'axios';

// ─── Lógica de URL Base Dinámica ───
let _customBaseUrl = null;

/** Call this BEFORE any API request to override the base URL (used by Vite dashboard) */
export const setBaseUrl = (url) => {
    _customBaseUrl = url;
    if (apiClient) apiClient.defaults.baseURL = url;
};

const getBaseUrl = () => {
    // 1. Custom URL set by the host app (e.g., Vite dashboard)
    if (_customBaseUrl) return _customBaseUrl;

    // 2. Variables de entorno de Expo (Mobile)
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // 3. Fallback: localhost (para desarrollo local)
    return 'http://localhost:1545/api';
};

const apiClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Gestión de Tokens ───
let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const getAuthToken = () => authToken;

export const clearAuthToken = () => {
    authToken = null;
};

// ─── Interceptor de Peticiones: Adjuntar JWT ───
apiClient.interceptors.request.use((config) => {
    // Busca el token en memoria (Mobile/Web) o en localStorage (Web)
    const token = authToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('techstore_token') : null);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Interceptor de Respuestas: Manejo de Errores ───
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                // Token expirado o inválido: Limpiar sesión
                clearAuthToken();
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem('techstore_token');
                }

                // Redirigir al login solo si estamos en navegador
                if (typeof window !== 'undefined' && window.location && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            const message = data?.message || `Error ${status}`;
            return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
        }

        return Promise.reject(new Error('Network error — check if backend is running and reachable'));
    }
);

export default apiClient;