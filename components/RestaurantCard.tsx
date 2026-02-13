import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Star, MapPin, Tag, Heart, ChevronRight, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Restaurant } from '../src/types';
import { useFavorites } from '../src/context/FavoritesContext';
import * as Haptics from 'expo-haptics';

interface RestaurantCardProps {
    restaurant: Restaurant;
    featured?: boolean;
}

const getTodayStatus = (restaurant: Restaurant) => {
    // Helper to parse time strings "HH:MM"
    const parseTime = (t?: string) => {
        if (!t) return null;
        const [hours, minutes] = t.split(':').map(Number);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
    };

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const dayName = days[now.getDay()];

    let openTime = restaurant.open_time || restaurant.openTime;
    let closeTime = restaurant.close_time || restaurant.closeTime;

    // 1. Try JSONB opening_hours
    if (restaurant.opening_hours && restaurant.opening_hours[dayName]) {
        const hours = restaurant.opening_hours[dayName];
        if (hours.closed) return { isOpen: false, text: 'Cerrado hoy' };
        openTime = hours.open;
        closeTime = hours.close;
    }

    if (!openTime || !closeTime) return { isOpen: false, text: 'Cons. horario' };

    const start = parseTime(openTime);
    const end = parseTime(closeTime);

    // Handle late night closing (e.g. 02:00 AM next day)
    if (end && start && end < start) {
        end.setDate(end.getDate() + 1);
    }

    const isOpen = now >= (start as Date) && now <= (end as Date);
    return { isOpen, text: isOpen ? `Cierra ${closeTime.substring(0, 5)}` : `Abre ${openTime.substring(0, 5)}` };
};

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, featured }) => {
    const router = useRouter();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { id, name, image, cuisine, rating, reviewCount, zone, priceRange, hasOffers, offerText, image_url } = restaurant;

    const { isOpen, text: statusText } = getTodayStatus(restaurant);
    const isRestaurantFavorite = isFavorite(id);

    const handleToggleFavorite = async (e: any) => {
        e.stopPropagation();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await toggleFavorite(id);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/restaurant/${id}`)}
            className="mb-6 bg-white rounded-[32px] overflow-hidden shadow-sm shadow-slate-200 border border-slate-100"
            style={{
                shadowColor: "#64748b",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4
            }}
        >
            {/* Image Container */}
            <View className="relative h-56 w-full">
                <Image
                    source={{ uri: image || image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Dark Overlay for Text Readability */}
                <View className="absolute inset-0 bg-black/20" />
                <View className="absolute bottom-0 left-0 right-0 h-32 bg-black/40" />

                {/* Status Badge */}
                <View className="absolute top-4 left-4 flex-row gap-2">
                    <View className={`${isOpen ? 'bg-emerald-500/90' : 'bg-slate-500/90'} backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center border border-white/10 shadow-sm`}>
                        <Clock size={12} color="white" strokeWidth={2.5} />
                        <Text className="text-white text-[11px] font-bold ml-1.5 uppercase tracking-wide">
                            {isOpen ? 'Abierto' : 'Cerrado'}
                        </Text>
                    </View>
                    {hasOffers && (
                        <View className="bg-orange-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center border border-white/10 shadow-sm">
                            <Tag size={12} color="white" strokeWidth={2.5} />
                            <Text className="text-white text-[11px] font-bold ml-1.5">{offerText || 'Promo'}</Text>
                        </View>
                    )}
                </View>

                {/* Favorite Button */}
                <TouchableOpacity
                    onPress={handleToggleFavorite}
                    className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center border border-white/20 active:bg-white/40 transition-all"
                >
                    <Heart
                        size={22}
                        color={isRestaurantFavorite ? "#ef4444" : "#ffffff"}
                        fill={isRestaurantFavorite ? "#ef4444" : "transparent"}
                        strokeWidth={2.5}
                    />
                </TouchableOpacity>

                {/* Info Overlay */}
                <View className="absolute bottom-4 left-5 right-5">
                    <Text className="text-white text-2xl font-extrabold tracking-tight mb-1 shadow-md" numberOfLines={1}>{name}</Text>
                    <View className="flex-row items-center">
                        <MapPin size={14} color="#fbbf24" fill="#fbbf24" />
                        <Text className="text-slate-100 text-sm font-semibold ml-1.5 backdrop-blur-none shadow-sm">{zone} • {cuisine}</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Content */}
            <View className="px-5 py-4 bg-white flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
                        <Star size={16} color="#eab308" fill="#eab308" />
                        <Text className="text-slate-900 font-bold ml-1.5 text-sm">{(rating || 0).toFixed(1)}</Text>
                    </View>
                    <Text className="text-slate-500 text-xs font-medium">
                        {statusText}
                    </Text>
                </View>

                <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-xl">
                    <Text className="text-slate-900 font-bold text-sm tracking-tight">{priceRange || '$$'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
