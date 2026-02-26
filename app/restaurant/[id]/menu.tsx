import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Utensils } from 'lucide-react-native';
import { useRestaurantMenu, useRestaurantDetails } from '../../../src/hooks/useData';

export default function MenuScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: menuItems, isLoading: isMenuLoading } = useRestaurantMenu(id as string);
    const { data: restaurant } = useRestaurantDetails(id as string);

    if (isMenuLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#ea580c" />
                <Text className="mt-4 text-slate-500">Cargando menú...</Text>
            </View>
        );
    }

    // Group items by category
    const grouped: Record<string, any[]> = {};
    (menuItems || []).forEach((item: any) => {
        const cat = item.category || 'Sin categoría';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    const categories = Object.keys(grouped);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <SafeAreaView className="bg-white border-b border-slate-100">
                <View className="flex-row items-center px-5 py-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3"
                    >
                        <ArrowLeft size={20} color="#1e293b" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900">Menú</Text>
                        <Text className="text-xs text-slate-500">{restaurant?.name || 'Restaurante'}</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
                        <Utensils size={18} color="#ea580c" />
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {categories.length === 0 ? (
                    <View className="flex-1 items-center justify-center p-12">
                        <Utensils size={48} color="#cbd5e1" />
                        <Text className="text-slate-400 text-center mt-4 text-base">
                            El menú aún no está disponible.
                        </Text>
                    </View>
                ) : (
                    categories.map((category) => (
                        <View key={category} className="mb-6">
                            {/* Category Header */}
                            <View className="px-5 py-3 bg-white border-b border-slate-100">
                                <Text className="text-base font-bold text-slate-900 uppercase tracking-wider">
                                    {category}
                                </Text>
                                <Text className="text-xs text-slate-400">{grouped[category].length} platillos</Text>
                            </View>

                            {/* Items */}
                            {grouped[category].map((item: any) => (
                                <View
                                    key={item.id}
                                    className="flex-row bg-white mx-4 mt-3 rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
                                    style={{
                                        shadowColor: '#64748b',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 4,
                                        elevation: 1,
                                    }}
                                >
                                    {/* Item Image */}
                                    <Image
                                        source={{
                                            uri: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                                        }}
                                        className="w-28 h-28"
                                        resizeMode="cover"
                                    />
                                    {/* Item Details */}
                                    <View className="flex-1 p-3 justify-between">
                                        <View>
                                            <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            {item.description ? (
                                                <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>
                                                    {item.description}
                                                </Text>
                                            ) : null}
                                        </View>
                                        <View className="flex-row items-center justify-between mt-2">
                                            <Text className="text-orange-600 font-extrabold text-sm">
                                                ${item.price}
                                            </Text>
                                            {item.is_highlighted && (
                                                <View className="bg-orange-100 px-2 py-0.5 rounded-full">
                                                    <Text className="text-orange-700 text-[10px] font-bold">
                                                        ⭐ Sugerido
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
