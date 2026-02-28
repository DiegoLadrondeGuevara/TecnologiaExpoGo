import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, clearAuthToken } from 'shared-logic/apiClient';
import { loginUser, registerUser, getMe } from '../api/authService';

const AuthContext = createContext();

const TOKEN_KEY = 'techstore_jwt';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    // On mount: try to restore session from AsyncStorage
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
                if (storedToken) {
                    setAuthToken(storedToken);
                    const userData = await getMe();
                    setUser(userData);
                }
            } catch (error) {
                // Token expired or invalid — clear it
                console.warn('Session restore failed:', error.message);
                await AsyncStorage.removeItem(TOKEN_KEY);
                clearAuthToken();
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = useCallback(async (email, password) => {
        const response = await loginUser(email, password);
        const { user: userData, access_token } = response;

        // Persist token
        await AsyncStorage.setItem(TOKEN_KEY, access_token);
        setAuthToken(access_token);
        setUser(userData);
        setJustLoggedIn(true);

        return userData;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const response = await registerUser(name, email, password);
        const { user: userData, access_token } = response;

        // Persist token
        await AsyncStorage.setItem(TOKEN_KEY, access_token);
        setAuthToken(access_token);
        setUser(userData);
        setJustLoggedIn(true);

        return userData;
    }, []);

    const logout = useCallback(async () => {
        await AsyncStorage.removeItem(TOKEN_KEY);
        clearAuthToken();
        setUser(null);
        setJustLoggedIn(false);
    }, []);

    // Update user data locally (used by SettingsScreen after PATCH /users/me)
    const updateUser = useCallback((data) => {
        setUser((prev) => (prev ? { ...prev, ...data } : data));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser: updateUser,
                isLoading,
                isAuthenticated: !!user,
                justLoggedIn,
                setJustLoggedIn,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
