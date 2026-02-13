import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOffers, useRestaurants } from '../../src/hooks/useData';
import {
    Tag,
    Clock,
    MapPin,
    ChevronRight,
    Percent,
    Gift,
    Sparkles,
    AlertCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Helper para calcular días restantes
const getDaysRemaining = (validUntil: string): string => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'Expirada';
    if (diff === 0) return '¡Último día!';
    if (diff === 1) return 'Termina mañana';
    if (diff <= 7) return `${diff} días restantes`;
    return `Hasta ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
};

// Helper para obtener el icono según tipo de descuento
const getOfferIcon = (discountType?: string) => {
    switch (discountType) {
        case 'percentage':
            return <Percent size={20} color="white" />;
        case 'bogo':
            return <Gift size={20} color="white" />;
        case 'special':
            return <Sparkles size={20} color="white" />;
        default:
            return <Tag size={20} color="white" />;
    }
};

// Colores para las tarjetas de ofertas
const OFFER_COLORS = [
    { bg: 'bg-orange-600', light: 'bg-orange-500' },
    { bg: 'bg-violet-600', light: 'bg-violet-500' },
    { bg: 'bg-emerald-600', light: 'bg-emerald-500' },
    { bg: 'bg-rose-600', light: 'bg-rose-500' },
    { bg: 'bg-blue-600', light: 'bg-blue-500' },
];

export default function OffersScreen() {
    const router = useRouter();
    const { data: offers, isLoading, refetch, isRefetching, isError } = useOffers();
    const { data: restaurants } = useRestaurants();

    // Crear mapa de restaurantes para lookup rápido
    const restaurantMap = React.useMemo(() => {
        if (!restaurants) return {};
        return restaurants.reduce((acc: any, r: any) => {
            acc[r.id] = r;
            return acc;
        }, {});
    }, [restaurants]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#1f7a66" />
                <Text className="mt-4 text-slate-500">Cargando ofertas...</Text>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-10">
                <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
                    <AlertCircle size={40} color="#ef4444" />
                </View>
                <Text className="text-xl font-bold text-slate-900 mb-2 text-center">Error al cargar</Text>
                <Text className="text-slate-500 text-center mb-8">No pudimos obtener las ofertas. Intenta de nuevo.</Text>
                <TouchableOpacity
                    onPress={() => refetch()}
                    className="bg-orange-600 px-8 py-4 rounded-2xl"
                >
                    <Text className="text-white font-bold">Reintentar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const activeOffers = offers?.filter((o: any) => o.is_active !== false) || [];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="px-6 pt-4 pb-2">
                <Text className="text-3xl font-extrabold text-slate-900 mb-2">Ofertas</Text>
                <Text className="text-slate-500 mb-6">Promociones exclusivas en los mejores restaurantes</Text>
            </View>

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1f7a66" />
                }
            >
                {activeOffers.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6">
                            <Tag size={40} color="#cbd5e1" />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 mb-2">No hay ofertas activas</Text>
                        <Text className="text-slate-500 text-center mb-8 px-10">
                            Las promociones de los restaurantes aparecerán aquí. ¡Vuelve pronto!
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)')}
                            className="bg-slate-900 px-8 py-4 rounded-2xl"
                        >
                            <Text className="text-white font-bold">Explorar Restaurantes</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="pb-10">
                        {/* Ofertas destacadas (las primeras 2) */}
                        {activeOffers.slice(0, 2).map((offer: any, index: number) => {
                            const restaurant = restaurantMap[offer.restaurant_id];
                            const colorScheme = OFFER_COLORS[index % OFFER_COLORS.length];
                            const daysRemaining = getDaysRemaining(offer.valid_until);

                            return (
                                <TouchableOpacity
                                    key={offer.id}
                                    activeOpacity={0.9}
                                    onPress={() => router.push(`/restaurant/${offer.restaurant_id}`)}
                                    className={`${colorScheme.bg} rounded-3xl p-6 mb-4 overflow-hidden`}
                                >
                                    {/* Decoración de fondo */}
                                    <View className={`absolute -right-10 -top-10 w-40 h-40 ${colorScheme.light} rounded-full opacity-30`} />
                                    <View className={`absolute -right-5 -bottom-5 w-24 h-24 ${colorScheme.light} rounded-full opacity-20`} />

                                    <View className="flex-row items-start justify-between mb-4">
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-2">
                                                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                                                    {getOfferIcon(offer.discount_type)}
                                                </View>
                                                <View>
                                                    <Text className="text-white/80 text-xs font-bold uppercase tracking-widest">
                                                        {restaurant?.name || 'Restaurante'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-white text-2xl font-bold mb-2">{offer.title}</Text>
                                            <Text className="text-white/80 text-sm">{offer.description}</Text>
                                        </View>
                                        <View className="bg-white rounded-2xl px-4 py-2 items-center">
                                            <Text className="text-2xl font-bold" style={{ color: colorScheme.bg.replace('bg-', '#').replace('-600', '') }}>
                                                {offer.discount || '-20%'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-white/20">
                                        <View className="flex-row items-center">
                                            <Clock size={14} color="rgba(255,255,255,0.7)" />
                                            <Text className="text-white/70 text-xs ml-2 font-medium">{daysRemaining}</Text>
                                        </View>
                                        <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full">
                                            <Text className="text-white text-xs font-bold mr-1">Ver restaurante</Text>
                                            <ChevronRight size={14} color="white" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Resto de ofertas en formato lista */}
                        {activeOffers.length > 2 && (
                            <View className="mt-4">
                                <Text className="text-lg font-bold text-slate-900 mb-4">Más ofertas</Text>
                                {activeOffers.slice(2).map((offer: any, index: number) => {
                                    const restaurant = restaurantMap[offer.restaurant_id];
                                    const daysRemaining = getDaysRemaining(offer.valid_until);

                                    return (
                                        <TouchableOpacity
                                            key={offer.id}
                                            activeOpacity={0.9}
                                            onPress={() => router.push(`/restaurant/${offer.restaurant_id}`)}
                                            className="bg-white border border-slate-100 rounded-2xl p-4 mb-3 flex-row items-center"
                                        >
                                            <Image
                                                source={{ uri: restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200' }}
                                                className="w-16 h-16 rounded-xl"
                                            />
                                            <View className="flex-1 ml-4">
                                                <Text className="text-sm font-bold text-slate-900">{offer.title}</Text>
                                                <Text className="text-xs text-slate-500 mt-1">{restaurant?.name}</Text>
                                                <View className="flex-row items-center mt-2">
                                                    <Clock size={12} color="#94a3b8" />
                                                    <Text className="text-xs text-slate-400 ml-1">{daysRemaining}</Text>
                                                </View>
                                            </View>
                                            <View className="bg-orange-50 px-3 py-2 rounded-xl">
                                                <Text className="text-orange-600 font-bold text-sm">{offer.discount}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
