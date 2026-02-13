import React, { useMemo } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { useRestaurants } from '../../src/hooks/useData';
import { Heart, Search, ChevronRight, Star, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function FavoritesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { favorites, toggleFavorite, isLoading: favoritesLoading } = useFavorites();
    const { data: restaurants, isLoading: restaurantsLoading, refetch, isRefetching } = useRestaurants();

    // Filtrar solo los restaurantes favoritos
    const favoriteRestaurants = useMemo(() => {
        if (!restaurants || !favorites) return [];
        return restaurants.filter((r: any) => favorites.includes(r.id));
    }, [restaurants, favorites]);

    const handleRemoveFavorite = async (restaurantId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await toggleFavorite(restaurantId);
    };

    const isLoading = favoritesLoading || restaurantsLoading;

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-10">
                <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                    <Heart size={40} color="#94a3b8" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-2 text-center">Tus Favoritos</Text>
                <Text className="text-slate-500 text-center mb-8">Guarda tus lugares favoritos para acceder a ellos rápidamente.</Text>
                <TouchableOpacity
                    onPress={() => router.push('/auth')}
                    className="bg-orange-600 w-full py-4 rounded-2xl items-center"
                >
                    <Text className="text-white font-bold text-lg">Iniciar Sesión</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <View className="px-6 pt-4 pb-2">
                <Text className="text-3xl font-extrabold text-slate-900 mb-2">Mis Favoritos</Text>
                <Text className="text-slate-500 mb-6">
                    {favoriteRestaurants.length > 0
                        ? `${favoriteRestaurants.length} restaurante${favoriteRestaurants.length > 1 ? 's' : ''} guardado${favoriteRestaurants.length > 1 ? 's' : ''}`
                        : 'Tus restaurantes favoritos aparecerán aquí'}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1f7a66" />
                }
            >
                {isLoading ? (
                    <View className="items-center justify-center mt-20">
                        <ActivityIndicator size="large" color="#1f7a66" />
                        <Text className="text-slate-500 mt-4">Cargando favoritos...</Text>
                    </View>
                ) : favoriteRestaurants.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
                            <Heart size={40} color="#fca5a5" fill="#fee2e2" />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 mb-2 text-center">Aún no tienes favoritos</Text>
                        <Text className="text-slate-500 text-center mb-8 px-10">
                            Explora y guarda los restaurantes que más te gusten presionando el corazón.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)')}
                            className="bg-slate-900 px-8 py-4 rounded-2xl"
                        >
                            <Text className="text-white font-bold">Descubrir Lugares</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="space-y-4 pb-20">
                        {favoriteRestaurants.map((restaurant: any) => (
                            <TouchableOpacity
                                key={restaurant.id}
                                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                                activeOpacity={0.9}
                                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm mb-4"
                            >
                                <View className="flex-row">
                                    <Image
                                        source={{ uri: restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200' }}
                                        className="w-32 h-32"
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1 p-4 justify-between">
                                        <View>
                                            <View className="flex-row justify-between items-start">
                                                <Text className="text-lg font-bold text-slate-900 flex-1 mr-2" numberOfLines={1}>
                                                    {restaurant.name}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFavorite(restaurant.id);
                                                    }}
                                                    className="p-1"
                                                >
                                                    <Heart size={18} color="#ef4444" fill="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                            <Text className="text-slate-500 text-xs mt-1">{restaurant.cuisine} • {restaurant.zone}</Text>
                                        </View>

                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <Star size={14} color="#eab308" fill="#eab308" />
                                                <Text className="ml-1 text-slate-700 font-bold text-sm">{(restaurant.rating || 0).toFixed(1)}</Text>
                                            </View>
                                            <View className="bg-orange-600 w-8 h-8 rounded-full items-center justify-center">
                                                <ChevronRight size={16} color="white" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
