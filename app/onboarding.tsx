import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ChevronRight, ArrowRight } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolation,
    interpolateColor,
    useAnimatedScrollHandler
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Encuentra el lugar perfecto',
        description: 'Explora los mejores restaurantes de la región con fotos reales y reseñas auténticas.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
        color: '#fff7ed'
    },
    {
        id: '2',
        title: 'Reserva tu mesa favorita',
        description: 'Elige exactamente dónde sentarte con nuestro mapa interactivo de mesas en tiempo real.',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop',
        color: '#fffaf5'
    },
    {
        id: '3',
        title: 'Disfruta sin esperas',
        description: 'Llega, muestra tu código QR y tu mesa estará lista esperándote. Gestión premium sin complicaciones.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop',
        color: '#ffffff'
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const flatListRef = useRef<FlatList>(null);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleNext = async () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await SecureStore.setItemAsync('has_seen_onboarding', 'true');
            router.replace('/(tabs)');
        }
    };

    const handleSkip = async () => {
        await SecureStore.setItemAsync('has_seen_onboarding', 'true');
        router.replace('/(tabs)');
    };

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={{ width }} className="flex-1 items-center justify-center px-8">
                <View className="w-full h-80 rounded-[40px] overflow-hidden shadow-2xl mb-12">
                    <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                </View>
                <Text className="text-3xl font-bold text-slate-900 text-center mb-4">
                    {item.title}
                </Text>
                <Text className="text-lg text-slate-500 text-center leading-7 px-4">
                    {item.description}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <TouchableOpacity
                onPress={handleSkip}
                className="absolute top-16 right-8 z-10"
            >
                <Text className="text-slate-400 font-bold text-lg">Saltar</Text>
            </TouchableOpacity>

            <Animated.FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                onMomentumScrollEnd={(e) => {
                    setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                }}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id}
            />

            <View className="pb-16 px-8">
                {/* Pagination Dots */}
                <View className="flex-row justify-center mb-10">
                    {SLIDES.map((_, index) => {
                        const dotStyle = useAnimatedStyle(() => {
                            const range = [(index - 1) * width, index * width, (index + 1) * width];
                            const dotWidth = interpolate(
                                scrollX.value,
                                range,
                                [10, 24, 10],
                                Extrapolation.CLAMP
                            );
                            const opacity = interpolate(
                                scrollX.value,
                                range,
                                [0.3, 1, 0.3],
                                Extrapolation.CLAMP
                            );
                            return {
                                width: dotWidth,
                                opacity,
                                backgroundColor: '#1f7a66',
                                height: 10,
                                borderRadius: 5,
                                marginHorizontal: 4,
                            };
                        });
                        return <Animated.View key={index} style={dotStyle} />;
                    })}
                </View>

                {/* Bottom Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.8}
                    className="bg-orange-600 h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-600/30"
                >
                    <Text className="text-white font-bold text-lg mr-2">
                        {currentIndex === SLIDES.length - 1 ? 'Empezar ahora' : 'Siguiente'}
                    </Text>
                    {currentIndex === SLIDES.length - 1 ? (
                        <ArrowRight color="white" size={20} strokeWidth={3} />
                    ) : (
                        <ChevronRight color="white" size={20} strokeWidth={3} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
