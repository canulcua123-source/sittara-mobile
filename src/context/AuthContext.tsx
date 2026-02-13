import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { User, ApiResponse } from '../types';
import { registerForPushNotificationsAsync } from '../services/notificationService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
    deleteAccount: () => Promise<{ success: boolean; error?: string }>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'sittara_user';
const TOKEN_STORAGE_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSavedSession();
    }, []);

    const loadSavedSession = async () => {
        try {
            const savedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
            const savedToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);

            if (savedUser && savedToken) {
                setUser(JSON.parse(savedUser));
                refreshUser(); // Sync background data from server
            }
        } catch (error) {
            console.error('Error loading saved session:', error);
            await logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/customer/login', {
                email,
                password,
            });

            if (response.data.success) {
                const { user: loggedUser, token } = response.data.data;
                setUser(loggedUser);

                await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(loggedUser));
                await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);

                // Register for Push Notifications automatically
                registerForPushNotificationsAsync();

                return { success: true };
            }
            return { success: false, error: response.data.error || 'Credenciales inválidas' };
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || 'Error de conexión con el servidor';
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, phone: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);
        try {
            const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/customer/register', {
                name,
                email,
                password,
                phone,
            });

            if (response.data.success) {
                const { user: newUser, token } = response.data.data;
                setUser(newUser);

                await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(newUser));
                await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);

                // Register for Push Notifications automatically
                registerForPushNotificationsAsync();

                return { success: true };
            }
            return { success: false, error: response.data.error || 'Error al crear la cuenta' };
        } catch (error: any) {
            console.error('Register error:', error);
            const message = error.response?.data?.error || 'Error de conexión con el servidor';
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    };

    const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await api.delete('/auth/me');
            if (response.data.success) {
                await logout(); // Limpiar sesión local
                return { success: true };
            }
            return { success: false, error: response.data.error || 'No se pudo eliminar la cuenta' };
        } catch (error: any) {
            console.error('Delete account error:', error);
            return { success: false, error: error.response?.data?.error || 'Error al eliminar cuenta' };
        }
    };

    const updateUser = async (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get<ApiResponse<{ user: User }>>('/auth/verify');
            if (response.data.success && response.data.data.user) {
                const remoteUser = response.data.data.user;
                setUser(remoteUser);
                await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(remoteUser));
            }
        } catch (error) {
            console.error('Error refreshing user from server:', error);
            // Fallback to local storage if server fails
            const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                updateUser,
                deleteAccount,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
