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

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: restaurant, isLoading: isLoadingDetails } = useRestaurantDetails(id as string);
    const { data: reviewsData, isLoading: isLoadingReviews } = useRestaurantReviews(id as string);
    const { data: statsData } = useReviewStats(id as string);

    const isLoading = isLoadingDetails || isLoadingReviews;
    const reviews = reviewsData?.data || [];
    const stats = statsData?.data;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#1f7a66" />
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View className="flex-1 items-center justify-center bg-white px-6">
                <Text className="text-xl font-bold text-slate-900 mb-2">Restaurante no encontrado</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-orange-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Volver al inicio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: `¡Mira este restaurante en Sittara!: ${restaurant.name}`,
                url: `https://sittara.app/restaurante/${restaurant.id}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" />

            {/* Header Image */}
            <View className="h-80 relative">
                <Image
                    source={{ uri: restaurant.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/30" />

                {/* Top Buttons */}
                <SafeAreaView className="absolute top-0 left-0 right-0">
                    <View className="flex-row justify-between px-6 pt-2">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/20"
                        >
                            <ArrowLeft size={20} color="white" />
                        </TouchableOpacity>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={handleShare}
                                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/20"
                            >
                                <Share2 size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/20"
                            >
                                <Heart size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Floating Info Card */}
                <View className="absolute -bottom-10 left-6 right-6 bg-white rounded-3xl p-6 shadow-xl shadow-black/10">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-slate-900">{restaurant.name}</Text>
                            <View className="flex-row items-center mt-1">
                                <MapPin size={14} color="#64748b" />
                                <Text className="text-slate-500 text-sm ml-1">{restaurant.zone} • {restaurant.cuisine}</Text>
                            </View>
                        </View>
                        <View className="bg-yellow-50 px-3 py-1.5 rounded-xl flex-row items-center">
                            <Star size={16} color="#eab308" fill="#eab308" />
                            <Text className="text-yellow-700 font-bold ml-1 text-base">{(restaurant.rating || 0).toFixed(1)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 mt-14" showsVerticalScrollIndicator={false}>
                <View className="px-6 pb-32">
                    {/* Quick Stats */}
                    <View className="flex-row justify-between bg-slate-50 rounded-2xl p-4 mb-8">
                        <View className="items-center flex-1 border-r border-slate-200">
                            <Clock size={20} color="#1f7a66" />
                            <Text className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-widest">Abierto</Text>
                            <Text className="text-slate-900 font-bold text-[12px]">{restaurant.openTime} - {restaurant.closeTime}</Text>
                        </View>
                        <View className="items-center flex-1 border-r border-slate-200">
                            <Text className="text-orange-600 font-bold text-lg">{restaurant.priceRange}</Text>
                            <Text className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-widest">Precio</Text>
                        </View>
                        <View className="items-center flex-1">
                            <Info size={20} color="#1f7a66" />
                            <Text className="text-slate-400 text-[10px] mt-1 uppercase font-bold tracking-widest">Info</Text>
                            <Text className="text-slate-900 font-bold text-[12px]">Ver más</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-2">Acerca de</Text>
                        <Text className="text-slate-500 leading-6">
                            {restaurant.description || 'Este restaurante aún no tiene una descripción detallada, pero estamos seguros de que te encantará su propuesta gastronómica única en el corazón de Mérida.'}
                        </Text>
                    </View>

                    {/* Menu Highlights Section */}
                    <MenuHighlights restaurantId={restaurant.id} />

                    {/* Action: Book Now! */}
                    <View className="bg-slate-900 rounded-3xl p-6 mb-8 relative overflow-hidden">
                        <View className="relative z-10">
                            <Text className="text-white text-xl font-bold mb-2">¿Listo para comer?</Text>
                            <Text className="text-white/70 mb-6">Reserva tu mesa ahora y asegura tu lugar favorito.</Text>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => router.push(`/restaurant/${restaurant.id}/reserve`)}
                                className="bg-orange-600 h-14 rounded-2xl items-center justify-center flex-row"
                            >
                                <Calendar size={20} color="white" />
                                <Text className="text-white text-lg font-bold ml-2">Reservar Mesa</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="absolute -right-10 -bottom-10 opacity-20">
                            <Utensils size={150} color="white" />
                        </View>
                    </View>

                    {/* Location */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-slate-900">Ubicación</Text>
                            <TouchableOpacity>
                                <Text className="text-orange-600 font-semibold">Ver mapa</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center bg-slate-50 p-4 rounded-2xl">
                            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm">
                                <MapPin size={20} color="#1f7a66" />
                            </View>
                            <Text className="flex-1 ml-4 text-slate-600 text-sm leading-5">
                                {restaurant.address || 'Calle 60 #123, Centro Histórico, Mérida, Yucatán.'}
                            </Text>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View className="mb-8" id="reviews-section">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-bold text-slate-900">Reseñas</Text>
                                <Text className="text-slate-500 text-sm">{stats?.count || 0} opiniones de la comunidad</Text>
                            </View>
                            <View className="items-end">
                                <View className="flex-row items-center">
                                    <Star size={20} color="#eab308" fill="#eab308" />
                                    <Text className="text-2xl font-bold text-slate-900 ml-1">
                                        {(stats?.averageRating || restaurant.rating || 0).toFixed(1)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Breakdown Stats */}
                        {stats && stats.count > 0 && (
                            <View className="bg-slate-50 rounded-3xl p-6 mb-8">
                                <Text className="text-slate-900 font-bold mb-4 text-sm uppercase tracking-wider">Desglose de satisfacción</Text>
                                <View className="flex-row flex-wrap justify-between gap-y-4">
                                    {[
                                        { label: 'Comida', value: stats.averageFoodRating },
                                        { label: 'Servicio', value: stats.averageServiceRating },
                                        { label: 'Ambiente', value: stats.averageAmbianceRating },
                                        { label: 'Calidad/Precio', value: stats.averageValueRating },
                                    ].map((item, index) => (
                                        <View key={index} className="w-[48%] bg-white p-3 rounded-2xl shadow-sm shadow-slate-200">
                                            <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">{item.label}</Text>
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-slate-900 font-bold">{item.value?.toFixed(1) || '0.0'}</Text>
                                                <View className="flex-row gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <View
                                                            key={s}
                                                            className={`w-1.5 h-1.5 rounded-full ${s <= Math.round(item.value || 0) ? 'bg-yellow-500' : 'bg-slate-200'}`}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {reviews.length > 0 ? (
                            reviews.map((review: any) => (
                                <View key={review.id} className="mb-6 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100">
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-row items-center">
                                            <View className="w-12 h-12 bg-orange-100 rounded-2xl items-center justify-center">
                                                <Text className="text-orange-700 font-bold text-lg">
                                                    {(review.user?.name || review.customerName || 'U').charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View className="ml-3">
                                                <Text className="font-bold text-slate-800 text-base">
                                                    {review.user?.name || review.customerName || 'Usuario'}
                                                </Text>
                                                <View className="flex-row items-center">
                                                    <View className="flex-row mr-2">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star
                                                                key={s}
                                                                size={10}
                                                                color="#eab308"
                                                                fill={s <= (review.rating || 0) ? '#eab308' : 'transparent'}
                                                            />
                                                        ))}
                                                    </View>
                                                    <Text className="text-slate-400 text-[10px]">
                                                        {new Date(review.created_at || review.createdAt).toLocaleDateString('es-MX')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        {review.is_verified && (
                                            <View className="bg-green-50 px-2 py-1 rounded-lg">
                                                <Text className="text-green-600 text-[9px] font-bold uppercase">Verificada</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text className="text-slate-600 leading-5 mb-4 italic">"{review.comment}"</Text>

                                    <View className="flex-row justify-between items-center pt-4 border-t border-slate-50">
                                        <TouchableOpacity
                                            onPress={() => reviewService.markHelpful(review.id)}
                                            className="flex-row items-center bg-slate-50 px-3 py-2 rounded-xl"
                                        >
                                            <Heart size={14} color="#ef4444" />
                                            <Text className="text-slate-600 text-xs font-semibold ml-2">Útil ({review.helpful_count || 0})</Text>
                                        </TouchableOpacity>

                                        <View className="flex-row gap-2">
                                            {review.food_rating && (
                                                <View className="w-6 h-6 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
                                                    <Utensils size={10} color="#1f7a66" />
                                                </View>
                                            )}
                                            {review.service_rating && (
                                                <View className="w-6 h-6 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
                                                    <Clock size={10} color="#1f7a66" />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="bg-slate-50 p-10 rounded-3xl items-center justify-center border border-dashed border-slate-200">
                                <Utensils size={40} color="#cbd5e1" />
                                <Text className="text-slate-400 text-center mt-4">Aún no hay reseñas para este lugar. ¡Sé el primero en calificar tu visita!</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button for Reservation */}
            {/* Opcional según el diseño */}
        </View>
    );
}
