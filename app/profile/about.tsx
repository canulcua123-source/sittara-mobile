import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ChevronLeft,
    ChevronRight,
    Star,
    Instagram,
    Facebook,
    Globe,
    Heart,
    Code,
    Sparkles
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

export default function AboutScreen() {
    const router = useRouter();
    const appVersion = Constants.expoConfig?.version || '1.0.0';

    const handleOpenLink = (url: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Linking.openURL(url);
    };

    const handleRateApp = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // En producción, esto llevaría a la App Store/Play Store
        Linking.openURL('https://apps.apple.com');
    };

    const TEAM_MEMBERS = [
        { name: 'Desarrollo', role: 'Equipo Técnico' },
        { name: 'Diseño', role: 'UI/UX' },
        { name: 'Producto', role: 'Estrategia' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-6 py-4 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Sobre Sittara</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Logo & Version */}
                <View className="items-center py-8 bg-white">
                    <View className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl items-center justify-center mb-4 shadow-lg">
                        <Text className="text-4xl">🍽️</Text>
                    </View>
                    <Text className="text-2xl font-bold text-slate-900">Sittara</Text>
                    <Text className="text-slate-500">Versión {appVersion}</Text>
                </View>

                {/* Mission */}
                <View className="px-6 py-6">
                    <View className="bg-white rounded-2xl p-6">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center">
                                <Sparkles size={20} color="#1f7a66" />
                            </View>
                            <Text className="text-lg font-bold text-slate-900 ml-3">Nuestra Misión</Text>
                        </View>
                        <Text className="text-slate-600 leading-6">
                            Transformar la experiencia gastronómica en Yucatán, conectando a comensales
                            con los mejores restaurantes de manera simple, rápida y memorable.
                        </Text>
                    </View>
                </View>

                {/* Features */}
                <View className="px-6 mb-6">
                    <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                        ¿Qué ofrecemos?
                    </Text>
                    <View className="bg-white rounded-2xl p-4">
                        {[
                            { emoji: '📱', text: 'Reservaciones en segundos' },
                            { emoji: '🗺️', text: 'Mapa interactivo de mesas' },
                            { emoji: '💳', text: 'Pagos seguros' },
                            { emoji: '⭐', text: 'Reseñas verificadas' },
                            { emoji: '🎁', text: 'Ofertas exclusivas' },
                        ].map((item, index) => (
                            <View key={index} className={`flex-row items-center py-3 ${index < 4 ? 'border-b border-slate-50' : ''
                                }`}>
                                <Text className="text-2xl mr-4">{item.emoji}</Text>
                                <Text className="text-slate-700">{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Social Links */}
                <View className="px-6 mb-6">
                    <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                        Síguenos
                    </Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => handleOpenLink('https://instagram.com/sittaraapp')}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 items-center"
                        >
                            <Instagram size={28} color="white" />
                            <Text className="text-white font-medium mt-2">Instagram</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleOpenLink('https://facebook.com/sittaraapp')}
                            className="flex-1 bg-blue-600 rounded-2xl p-4 items-center"
                        >
                            <Facebook size={28} color="white" />
                            <Text className="text-white font-medium mt-2">Facebook</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleOpenLink('https://sittara.com')}
                            className="flex-1 bg-slate-800 rounded-2xl p-4 items-center"
                        >
                            <Globe size={28} color="white" />
                            <Text className="text-white font-medium mt-2">Web</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rate App */}
                <View className="px-6 mb-6">
                    <TouchableOpacity
                        onPress={handleRateApp}
                        className="bg-white rounded-2xl p-4 flex-row items-center border border-slate-100"
                    >
                        <View className="w-12 h-12 bg-yellow-50 rounded-xl items-center justify-center">
                            <Star size={24} color="#eab308" fill="#eab308" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-900 font-bold">¿Te gusta Sittara?</Text>
                            <Text className="text-slate-500 text-sm">Déjanos una reseña en la App Store</Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Credits */}
                <View className="px-6 mb-6">
                    <View className="bg-orange-50 rounded-2xl p-6 items-center">
                        <Heart size={24} color="#1f7a66" fill="#1f7a66" />
                        <Text className="text-orange-800 font-medium mt-2 text-center">
                            Hecho con amor en Mérida, Yucatán 🇲🇽
                        </Text>
                        <Text className="text-orange-600 text-sm mt-1">
                            © 2024 Sittara. Todos los derechos reservados.
                        </Text>
                    </View>
                </View>

                {/* Legal */}
                <View className="px-6 mb-10">
                    <TouchableOpacity
                        onPress={() => handleOpenLink('https://sittara.com/terminos')}
                        className="py-3"
                    >
                        <Text className="text-slate-500 text-center">Términos y Condiciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleOpenLink('https://sittara.com/privacidad')}
                        className="py-3"
                    >
                        <Text className="text-slate-500 text-center">Política de Privacidad</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
