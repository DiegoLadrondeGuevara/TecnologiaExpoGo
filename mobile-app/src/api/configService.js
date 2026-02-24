/**
 * Mobile App — Config Service (WebSocket + HTTP)
 *
 * Connects to the backend WebSocket gateway for real-time config updates.
 * When the admin changes language/currency in the dashboard, this service
 * receives the update and notifies the LanguageContext to update the app state.
 */
import { io } from 'socket.io-client';
import apiClient from '../../../shared-logic/apiClient';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3001';

let socket = null;

/**
 * Fetch current app config from the backend.
 */
export const getConfig = async () => {
    const data = await apiClient.get('/config');
    return data;
};

/**
 * Connect to the WebSocket server and listen for config updates.
 * @param {Function} onUpdate - callback(config) called when config changes
 * @returns {Function} disconnect function
 */
export const subscribeToConfigUpdates = (onUpdate) => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(WS_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
        console.log('🔌 WebSocket connected for config updates');
    });

    socket.on('config.updated', (config) => {
        console.log('📡 Config update received:', config);
        if (onUpdate) {
            onUpdate(config);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.warn('⚠️ WebSocket connection error:', error.message);
    });

    // Return cleanup function
    return () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    };
};

/**
 * Disconnect from the WebSocket server.
 */
export const disconnectConfig = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
