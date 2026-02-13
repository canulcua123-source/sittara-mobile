import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Users,
    Calendar,
    QrCode,
    TrendingUp,
    ChevronRight,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Star
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AdminService } from '../../src/services/adminService';
import { useAuth } from '../../src/context/AuthContext';

export default function AdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [statsData, resData] = await Promise.all([
                AdminService.getDailyStats(),
                // Usamos un ID de restaurante genérico o el del usuario si lo tenemos
                AdminService.getPendingReservations(user?.id || '')
            ]);
            setStats(statsData);
            setReservations(resData || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderHeader = () => (
        <View className="px-6 pt-4">
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                    <ArrowLeft size={20} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Portal de Staff</Text>
                <View className="w-10 h-10" />
            </View>

            <Text className="text-2xl font-bold text-slate-900 mb-2">¡Hola, Staff! 👋</Text>
            <Text className="text-slate-500 mb-8">Aquí tienes el resumen de hoy en el restaurante.</Text>

            {/* Stats Grid */}
            <View className="flex-row flex-wrap justify-between mb-8">
                <View className="bg-blue-50 w-[31%] p-4 rounded-3xl items-center">
                    <Calendar size={20} className="text-blue-600" />
                    <Text className="text-slate-900 font-bold text-lg mt-2">{stats?.reservas_hoy || 0}</Text>
                    <Text className="text-slate-500 text-[10px] text-center mt-1 uppercase font-bold">Reservas</Text>
                </View>
                <View className="bg-orange-50 w-[31%] p-4 rounded-3xl items-center">
                    <TrendingUp size={20} className="text-orange-600" />
                    <Text className="text-slate-900 font-bold text-lg mt-2">{stats?.ocupacion_actual || 0}%</Text>
                    <Text className="text-slate-500 text-[10px] text-center mt-1 uppercase font-bold">Ocupación</Text>
                </View>
                <View className="bg-green-50 w-[31%] p-4 rounded-3xl items-center">
                    <Star size={20} className="text-green-600" />
                    <Text className="text-slate-900 font-bold text-lg mt-2">{stats?.calificacion_promedio || 0}</Text>
                    <Text className="text-slate-500 text-[10px] text-center mt-1 uppercase font-bold">Rating</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View className="mb-10">
                <Text className="text-lg font-bold text-slate-900 mb-4">Acciones Rápidas</Text>
                <TouchableOpacity
                    className="bg-slate-900 py-6 rounded-[30px] flex-row items-center justify-center shadow-lg shadow-black/20"
                    onPress={() => router.push('/admin/scanner')}
                >
                    <QrCode color="white" size={24} className="mr-3" />
                    <Text className="text-white font-bold text-lg">Escanear QR de Cliente</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-900">Próximas Llegadas</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Text className="text-orange-600 font-semibold">Actualizar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator color="#1f7a66" size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FlatList
                data={reservations}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInUp.delay(index * 100)}
                        className="px-6 mb-4"
                    >
                        <View className="bg-slate-50 p-5 rounded-3xl flex-row items-center justify-between border border-slate-100">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-slate-100 mr-4">
                                    <Clock size={20} color="#64748b" />
                                </View>
                                <View>
                                    <Text className="text-slate-900 font-bold text-lg">{item.time}</Text>
                                    <Text className="text-slate-500 font-medium">
                                        {item.users?.name || 'Comensal'} • {item.guest_count} pers.
                                    </Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <View className={`px-3 py-1 rounded-full mb-1 ${item.status === 'arrived' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                    <Text className={`text-[10px] font-bold uppercase ${item.status === 'arrived' ? 'text-green-700' : 'text-orange-700'}`}>
                                        {item.tables?.number ? `Mesa ${item.tables.number}` : 'Sin mesa'}
                                    </Text>
                                </View>
                                <ChevronRight size={16} color="#cbd5e1" />
                            </View>
                        </View>
                    </Animated.View>
                )}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View className="h-10" />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1f7a66" />
                }
                ListEmptyComponent={
                    <View className="items-center py-10">
                        <Text className="text-slate-400">No hay reservas para hoy aún.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
