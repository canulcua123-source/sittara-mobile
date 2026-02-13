import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Gift,
    Star,
    Award,
    Zap,
    History,
    ChevronRight,
    Search,
    Info,
    CheckCircle2
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

const perks = [
    {
        id: 'priority',
        title: 'Prioridad en Reservas',
        desc: 'Acceso exclusivo a mesas en horas pico.',
        icon: Zap,
        color: '#f59e0b',
        level: 'Gourmet Pro'
    },
    {
        id: 'drinks',
        title: 'Bebida de Bienvenida',
        desc: 'Una bebida artesanal de cortesía en cada visita.',
        icon: Star,
        color: '#1f7a66',
        level: 'Platinum VIP'
    },
    {
        id: 'points_x2',
        title: 'Multiplicador x2',
        desc: 'Gana el doble de puntos los fines de semana.',
        icon: Award,
        color: '#6366f1',
        level: 'Foodie Activo'
    },
];

export default function LoyaltyScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadLoyaltyData();
    }, []);

    const loadLoyaltyData = async () => {
        try {
            setLoading(true);
            // Simulación de carga de datos de lealtad (en el futuro vendrá de /api/user/growth-perks)
            const response = await api.get('/reservations/my');
            if (response.data.success) {
                const reservations = response.data.data;
                const completed = reservations.filter((r: any) => r.status === 'completed');
                const totalPoints = completed.length * 10;
                setPoints(totalPoints);

                // Simular historial
                const mockHistory = completed.map((r: any) => ({
                    id: r.id,
                    title: 'Visita Completada',
                    points: 10,
                    date: r.date,
                    restaurant: r.restaurants?.name || 'Restaurante'
                }));
                setHistory(mockHistory);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const currentLevel = points >= 100 ? 'Platinum VIP' : points >= 50 ? 'Gourmet Pro' : 'Foodie Activo';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Custom Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
                >
                    <ArrowLeft size={20} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Sittara Rewards</Text>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                    <Info size={18} color="#64748b" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1f7a66" />
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Level Badge Section */}
                    <View className="items-center py-10">
                        <Animated.View entering={FadeInUp} className="w-32 h-32 rounded-full border-4 border-slate-900 items-center justify-center relative shadow-2xl bg-white">
                            <Award size={60} color="#0f172a" />
                            <View className="absolute -bottom-2 bg-slate-900 px-4 py-1 rounded-full">
                                <Text className="text-white text-[10px] font-black uppercase tracking-tighter">{currentLevel}</Text>
                            </View>
                        </Animated.View>
                        <Text className="text-4xl font-black text-slate-900 mt-6">{points}</Text>
                        <Text className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Puntos Disponibles</Text>
                    </View>

                    {/* Benefits Section */}
                    <View className="px-6 mb-10">
                        <Text className="text-xl font-bold text-slate-900 mb-6">Tus Beneficios</Text>
                        <View className="gap-4">
                            {perks.map((perk, i) => {
                                const isUnlocked = points >= (perk.level === 'Platinum VIP' ? 100 : perk.level === 'Gourmet Pro' ? 50 : 0);
                                return (
                                    <Animated.View
                                        key={perk.id}
                                        entering={FadeInRight.delay(i * 100)}
                                        className={`flex-row p-5 rounded-3xl border ${isUnlocked ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-transparent opacity-50'}`}
                                    >
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center`} style={{ backgroundColor: `${perk.color}15` }}>
                                            <perk.icon size={24} color={perk.color} />
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <View className="flex-row justify-between items-start">
                                                <Text className="text-slate-900 font-bold text-lg">{perk.title}</Text>
                                                {isUnlocked && <CheckCircle2 size={16} color="#16a34a" />}
                                            </View>
                                            <Text className="text-slate-500 text-sm mt-1">{perk.desc}</Text>
                                            {!isUnlocked && (
                                                <Text className="text-orange-600 text-[10px] font-bold mt-2 uppercase">Bloqueado • Nivel {perk.level}</Text>
                                            )}
                                        </View>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </View>

                    {/* History Section */}
                    <View className="px-6 pb-20">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-slate-900">Historial de Puntos</Text>
                            <TouchableOpacity>
                                <History size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {history.length === 0 ? (
                            <View className="py-10 items-center bg-slate-50 rounded-3xl">
                                <Gift size={32} color="#cbd5e1" />
                                <Text className="text-slate-400 font-medium mt-4">Aún no has ganado puntos</Text>
                            </View>
                        ) : (
                            <View className="bg-slate-50 rounded-3xl p-2">
                                {history.map((item, i) => (
                                    <View key={i} className={`flex-row items-center justify-between p-4 ${i !== history.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                        <View>
                                            <Text className="text-slate-900 font-bold">{item.restaurant}</Text>
                                            <Text className="text-slate-400 text-xs">{item.date}</Text>
                                        </View>
                                        <View className="bg-green-100 px-3 py-1 rounded-full">
                                            <Text className="text-green-700 font-bold">+{item.points}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}

            {/* Explainer / Action */}
            <View className="px-6 py-6 border-t border-slate-50 bg-white">
                <TouchableOpacity className="bg-orange-600 h-16 rounded-2xl items-center justify-center flex-row shadow-lg">
                    <Gift size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Canjear Premios</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
