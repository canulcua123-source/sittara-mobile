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

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, featured }) => {
    const router = useRouter();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { id, name, image, cuisine, rating, reviewCount, zone, isOpen, priceRange, hasOffers, offerText } = restaurant;

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
            className={`bg-white rounded-3xl overflow-hidden shadow-sm mb-4 border border-slate-100 ${featured ? 'mx-4' : ''}`}
        >
            {/* Image Container */}
            <View className="relative h-48">
                <Image
                    source={{ uri: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600' }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Gradient Overlay (Simulado con View) */}
                <View className="absolute inset-0 bg-black/20" />

                {/* Top Badges */}
                <View className="absolute top-3 left-3 flex-row gap-2">
                    {hasOffers && (
                        <View className="bg-orange-600 px-3 py-1 rounded-full flex-row items-center border border-white/20">
                            <Tag size={12} color="white" />
                            <Text className="text-white text-[10px] font-bold ml-1">{offerText || 'Oferta'}</Text>
                        </View>
                    )}
                    <View className={`${isOpen ? 'bg-green-500' : 'bg-slate-500'} px-3 py-1 rounded-full flex-row items-center border border-white/20`}>
                        <Clock size={12} color="white" />
                        <Text className="text-white text-[10px] font-bold ml-1">{isOpen ? 'Abierto' : 'Cerrado'}</Text>
                    </View>
                </View>

                {/* Favorite Button */}
                <TouchableOpacity
                    onPress={handleToggleFavorite}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
                >
                    <Heart
                        size={20}
                        color={isRestaurantFavorite ? "#ef4444" : "#64748b"}
                        fill={isRestaurantFavorite ? "#ef4444" : "transparent"}
                    />
                </TouchableOpacity>

                {/* Info on Image */}
                <View className="absolute bottom-3 left-4 right-4">
                    <Text className="text-white text-xl font-bold shadow-sm">{name}</Text>
                    <View className="flex-row items-center mt-1">
                        <MapPin size={12} color="white" />
                        <Text className="text-white/90 text-[12px] ml-1">{zone} • {cuisine}</Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <View className="p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="bg-yellow-50 px-2 py-1 rounded-lg flex-row items-center mr-2">
                        <Star size={14} color="#eab308" fill="#eab308" />
                        <Text className="text-yellow-700 font-bold ml-1 text-sm">{(rating || 0).toFixed(1)}</Text>
                    </View>
                    <Text className="text-slate-400 text-[12px]">({reviewCount || 0} opiniones)</Text>
                </View>

                <View className="flex-row items-center">
                    <Text className="text-orange-600 font-bold mr-1">{priceRange}</Text>
                    <ChevronRight size={16} color="#1f7a66" />
                </View>
            </View>
        </TouchableOpacity>
    );
};
