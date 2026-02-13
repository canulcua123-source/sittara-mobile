import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface FavoritesContextType {
    favorites: string[];
    isFavorite: (restaurantId: string) => boolean;
    toggleFavorite: (restaurantId: string) => Promise<void>;
    isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@sittara_favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar favoritos al iniciar o cuando cambia el usuario
    useEffect(() => {
        loadFavorites();
    }, [user?.id]);

    const loadFavorites = async () => {
        setIsLoading(true);
        try {
            if (user?.id) {
                // Si hay usuario, intentar cargar desde API
                try {
                    // ✅ HOTFIX: Ruta correcta es GET /favorites/my (auth via token)
                    const response = await api.get('/favorites/my');
                    if (response.data.success && response.data.data) {
                        const favIds = response.data.data.map((f: any) => f.restaurant_id || f.id);
                        setFavorites(favIds);
                        // Sincronizar con storage local
                        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favIds));
                    }
                } catch (apiError) {
                    // Si la API falla, usar storage local
                    console.warn('API favorites load failed, using local storage:', apiError);
                    const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                    if (stored) {
                        setFavorites(JSON.parse(stored));
                    }
                }
            } else {
                // Sin usuario, usar storage local solamente
                const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                if (stored) {
                    setFavorites(JSON.parse(stored));
                }
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isFavorite = useCallback((restaurantId: string) => {
        return favorites.includes(restaurantId);
    }, [favorites]);

    // ✅ HOTFIX: Verificar estado de favorito individual contra el backend
    const checkFavoriteStatus = async (restaurantId: string): Promise<boolean> => {
        if (!user?.id) return favorites.includes(restaurantId);
        try {
            const response = await api.get(`/favorites/check/${restaurantId}`);
            return response.data.success && response.data.data?.isFavorite;
        } catch {
            return favorites.includes(restaurantId);
        }
    };

    const toggleFavorite = async (restaurantId: string) => {
        const isCurrentlyFavorite = isFavorite(restaurantId);

        // Actualización optimista (UI inmediata)
        const newFavorites = isCurrentlyFavorite
            ? favorites.filter(id => id !== restaurantId)
            : [...favorites, restaurantId];

        setFavorites(newFavorites);

        // Persistir localmente
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));

        // Si hay usuario, sincronizar con API
        if (user?.id) {
            try {
                if (isCurrentlyFavorite) {
                    // ✅ HOTFIX: Ruta correcta es DELETE /favorites/:restaurantId
                    await api.delete(`/favorites/${restaurantId}`);
                } else {
                    // ✅ HOTFIX: Ruta correcta es POST /favorites (auth via token)
                    await api.post('/favorites', { restaurantId });
                }
            } catch (error) {
                console.warn('API favorites sync failed:', error);
                // No revertimos porque el storage local ya tiene los datos
            }
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, isLoading }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
