import apiClient from '../../../shared-logic/apiClient';

/**
 * Register the Expo push token with the backend.
 */
export const registerPushToken = async (token) => {
    return apiClient.post('/users/me/push-token', { token });
};
