import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Share
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Star,
    MapPin,
    Phone,
    Clock,
    Heart,
    Share2,
    Calendar,
    ChevronRight,
    Info,
    Utensils
} from 'lucide-react-native';
import { useRestaurantDetails, useRestaurantReviews, useReviewStats, useMenuHighlights } from '../../../src/hooks/useData';
import reviewService from '../../../src/services/reviewService';

const MenuHighlights = ({ restaurantId }: { restaurantId: string }) => {
    const { data: items, isLoading } = useMenuHighlights(restaurantId);

    if (isLoading || !items || items.length === 0) return null;

    return (
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-slate-900">Menú Sugerido</Text>
                <TouchableOpacity>
                    <Text className="text-orange-600 font-semibold">Ver todo</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                {items.map((item: any) => (
                    <View key={item.id} className="mr-4 w-40 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                        <Image
                            source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' }}
                            className="w-full h-28"
                        />
                        <View className="p-3">
                            <Text className="text-slate-900 font-bold text-xs" numberOfLines={1}>{item.name}</Text>
                            <Text className="text-orange-600 font-bold text-xs mt-1">${item.price}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const getTodayHours = (restaurant: any) => {
    if (!restaurant) return { text: '-', isOpen: false };

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const dayName = days[now.getDay()];

    // 1. Try JSONB opening_hours
    if (restaurant.opening_hours && restaurant.opening_hours[dayName]) {
        const hours = restaurant.opening_hours[dayName];
        if (hours.closed) return { text: 'Cerrado hoy', isOpen: false };
        return {
            text: `${hours.open} - ${hours.close}`,
            isOpen: checkIfOpen(hours.open, hours.close)
        };
    }

    // 2. Fallback to simple columns (fixing the bug: snake_case support)
    const openTime = restaurant.open_time || restaurant.openTime;
    const closeTime = restaurant.close_time || restaurant.closeTime;

    if (openTime && closeTime) {
        // Format time strings (remove seconds if present)
        const format = (t: string) => t.substring(0, 5);
        return {
            text: `${format(openTime)} - ${format(closeTime)}`,
            isOpen: checkIfOpen(openTime, closeTime)
        };
    }

    return { text: 'Consultar Horario', isOpen: false };
};

const checkIfOpen = (open: string, close: string) => {
    if (!open || !close) return false;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Handle overnight hours (e.g. 19:00 - 02:00)
    if (close < open) {
        return currentTime >= open || currentTime <= close;
    }
    return currentTime >= open && currentTime <= close;
};

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: restaurant, isLoading: isLoadingDetails } = useRestaurantDetails(id as string);
    const { data: reviewsData, isLoading: isLoadingReviews } = useRestaurantReviews(id as string);
    const { data: statsData } = useReviewStats(id as string);

    const isLoading = isLoadingDetails || isLoadingReviews;
    const reviews = reviewsData?.data || [];
    const stats = statsData?.data;

    // Derived state for UI
    const todayHours = React.useMemo(() => getTodayHours(restaurant), [restaurant]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#ea580c" />
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View className="flex-1 items-center justify-center bg-white px-6">
                <Text className="text-xl font-bold text-slate-900 mb-2">Restaurante no encontrado</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-orange-600 px-6 py-3 rounded-full shadow-lg shadow-orange-200"
                >
                    <Text className="text-white font-bold">Volver al inicio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: `¡Vamos a comer a ${restaurant.name}! Lo encontré en Sittara.`,
                url: `https://sittara.app/restaurante/${restaurant.id}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Section */}
                <View className="h-96 relative">
                    <Image
                        source={{ uri: restaurant.image || restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    {/* Gradient Overlay */}
                    <View className="absolute inset-0 bg-black/40" />

                    {/* Header Controls */}
                    <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
                        <View className="flex-row justify-between px-6 pt-2">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md items-center justify-center"
                            >
                                <ArrowLeft size={20} color="white" />
                            </TouchableOpacity>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handleShare}
                                    className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md items-center justify-center"
                                >
                                    <Share2 size={20} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md items-center justify-center"
                                >
                                    <Heart size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>

                    {/* Main Info Overlay */}
                    <View className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-black/40">
                        {/* <View className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" /> */}
                        <View className="flex-row justify-between items-end mb-1">
                            <View className="flex-1 mr-4">
                                <Text className="text-3xl font-extrabold text-white shadow-sm mb-2">{restaurant.name}</Text>
                                <View className="flex-row items-center flex-wrap gap-2">
                                    <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                                        <MapPin size={12} color="white" />
                                        <Text className="text-white text-xs font-semibold ml-1">{restaurant.zone || 'Mérida'}</Text>
                                    </View>
                                    <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                                        <Utensils size={12} color="white" />
                                        <Text className="text-white text-xs font-semibold ml-1">{restaurant.cuisine || 'Variada'}</Text>
                                    </View>
                                </View>
                            </View>
                            <View className="bg-yellow-400 px-3 py-2 rounded-2xl items-center shadow-lg">
                                <View className="flex-row items-center">
                                    <Star size={16} color="black" fill="black" />
                                    <Text className="text-black font-extrabold ml-1 text-lg">{(restaurant.rating || 0).toFixed(1)}</Text>
                                </View>
                                <Text className="text-black/80 text-[9px] font-bold mt-0.5">{reviews?.length || 0} reviews</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Container */}
                <View className="px-6 -mt-6">
                    {/* Status Card */}
                    <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200 border border-slate-100 flex-row justify-between items-center mb-6">
                        <View className="flex-1 pr-4 border-r border-slate-100">
                            <View className="flex-row items-center mb-1">
                                <Clock size={16} color={todayHours.isOpen ? '#16a34a' : '#ef4444'} />
                                <Text className={`text-xs font-bold uppercase ml-2 ${todayHours.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                                    {todayHours.isOpen ? 'Abierto' : 'Cerrado'}
                                </Text>
                            </View>
                            <Text className="text-slate-900 font-bold text-sm ml-6">{todayHours.text}</Text>
                        </View>
                        <View className="pl-4 items-center justify-center">
                            <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Precio Promedio</Text>
                            <Text className="text-slate-900 font-extrabold text-lg">{restaurant.priceRange || restaurant.price_range || '$$'}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-slate-900 mb-3">Acerca de</Text>
                        <Text className="text-slate-500 leading-7 text-base">
                            {restaurant.description || 'Disfruta de una experiencia gastronómica inigualable. Este restaurante destaca por su atención al detalle y sabores auténticos.'}
                        </Text>
                    </View>

                    {/* Menu Section */}
                    <MenuHighlights restaurantId={restaurant.id} />

                    {/* Reviews */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-slate-900">Lo que dicen</Text>
                            <TouchableOpacity onPress={() => {/* Navigate to all reviews */ }}>
                                <Text className="text-orange-600 font-semibold">Ver todas</Text>
                            </TouchableOpacity>
                        </View>

                        {reviews.length > 0 ? (
                            reviews.slice(0, 3).map((review: any) => (
                                <View key={review.id} className="mb-4 bg-white p-4 rounded-2xl border border-slate-100/50 shadow-sm shadow-slate-100">
                                    <View className="flex-row items-start justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                                                <Text className="text-slate-600 font-bold">
                                                    {(review.user?.name || review.customerName || 'A').charAt(0)}
                                                </Text>
                                            </View>
                                            <View className="ml-3">
                                                <Text className="font-bold text-slate-900 text-sm">
                                                    {review.user?.name || review.customerName || 'Anónimo'}
                                                </Text>
                                                <View className="flex-row">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={10} color="#fbbf24" fill={s <= (review.rating || 0) ? '#fbbf24' : '#e2e8f0'} />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        <Text className="text-slate-300 text-xs">
                                            {new Date(review.created_at || review.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text className="text-slate-600 text-sm italic border-l-2 border-orange-100 pl-3 py-1">
                                        "{review.comment}"
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <View className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 items-center">
                                <Text className="text-slate-400 text-center">Sé el primero en opinar sobre este lugar.</Text>
                            </View>
                        )}
                    </View>

                    {/* Location Simple */}
                    <View className="mb-24">
                        <Text className="text-xl font-bold text-slate-900 mb-3">Ubicación</Text>
                        <View className="bg-white p-4 rounded-2xl border border-slate-100 flex-row items-center">
                            <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-4">
                                <MapPin size={20} color="#ea580c" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-medium">{restaurant.address || 'Ubicación no disponible'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Reserve Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 border-t border-slate-100 backdrop-blur-lg">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        /* Haptic feedback if available */
                        router.push(`/restaurant/${restaurant.id}/reserve`);
                    }}
                    className="bg-slate-900 h-14 rounded-2xl items-center justify-center flex-row shadow-xl shadow-slate-900/20"
                >
                    <Calendar size={20} color="white" />
                    <Text className="text-white text-lg font-bold ml-2">Reservar Mesa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
