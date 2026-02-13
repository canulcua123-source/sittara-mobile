import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    Switch,
    Alert
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
    User,
    Settings,
    Bell,
    Shield,
    HelpCircle,
    LogOut,
    ChevronRight,
    CreditCard,
    MapPin,
    ExternalLink,
    Info
} from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import api from '../../src/services/api';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const [reservationsCount, setReservationsCount] = useState(0);
    const [points, setPoints] = useState(0);

    // Cargar estadísticas del usuario
    useEffect(() => {
        if (user) {
            loadUserStats();
        }
    }, [user]);

    const loadUserStats = async () => {
        try {
            // Obtener reservaciones del usuario
            const response = await api.get('/reservations/my');
            if (response.data.success && response.data.data) {
                const reservations = response.data.data;
                setReservationsCount(reservations.length);
                // Calcular puntos: 10 puntos por cada reservación completada
                const completedReservations = reservations.filter(
                    (r: any) => r.status === 'completed' || r.status === 'confirmed'
                );
                setPoints(completedReservations.length * 10);
            }
        } catch (error) {
            // Si falla, usar valores por defecto (0)
        }
    };

    const handleLogout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres salir de tu cuenta?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace('/auth');
                    }
                }
            ]
        );
    };

    const menuItems = [
        { icon: <User size={20} color="#64748b" />, title: 'Información Personal', subtitle: 'Nombre, email y teléfono', onPress: () => router.push('/profile/edit' as Href) },
        { icon: <CreditCard size={20} color="#64748b" />, title: 'Métodos de Pago', subtitle: 'Gestiona tus tarjetas', onPress: () => router.push('/profile/payment-methods' as Href) },
        { icon: <MapPin size={20} color="#64748b" />, title: 'Direcciones', subtitle: 'Tus lugares frecuentes', onPress: () => router.push('/profile/addresses' as Href) },
        { icon: <Shield size={20} color="#64748b" />, title: 'Privacidad y Seguridad', subtitle: 'Contraseña y más', onPress: () => router.push('/auth/forgot-password' as Href) },
    ];

    const supportItems = [
        { icon: <HelpCircle size={20} color="#64748b" />, title: 'Centro de Ayuda', onPress: () => router.push('/profile/help' as Href) },
        { icon: <Info size={20} color="#64748b" />, title: 'Sobre Sittara', onPress: () => router.push('/profile/about' as Href) },
        { icon: <ExternalLink size={20} color="#64748b" />, title: 'Términos y Condiciones', onPress: () => router.push('/profile/terms' as Href) },
    ];

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-10">
                <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                    <User size={40} color="#94a3b8" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-2 text-center">Tu Perfil</Text>
                <Text className="text-slate-500 text-center mb-8">Únete a Sittara para disfrutar de una experiencia personalizada.</Text>
                <TouchableOpacity
                    onPress={() => router.push('/auth')}
                    className="bg-orange-600 w-full py-4 rounded-2xl items-center"
                >
                    <Text className="text-white font-bold text-lg">Iniciar Sesión</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* User Info Header */}
                <View className="px-6 py-8 items-center border-b border-slate-50">
                    <View className="relative">
                        <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            {user.avatar_url ? (
                                <Image source={{ uri: user.avatar_url }} className="w-full h-full" />
                            ) : (
                                <Text className="text-3xl font-bold text-slate-400">
                                    {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => router.push('/profile/edit' as Href)} className="absolute bottom-0 right-0 w-8 h-8 bg-orange-600 rounded-full items-center justify-center border-2 border-white shadow-sm">
                            <Settings size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-2xl font-bold text-slate-900 mt-4">{user.name || user.full_name || 'Usuario Sittara'}</Text>
                    <Text className="text-slate-500 font-medium">{user.email}</Text>

                    {/* Loyalty Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/profile/loyalty')}
                        className="w-full mt-6 bg-slate-900 rounded-3xl p-6 overflow-hidden relative shadow-lg"
                    >
                        <View className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/20 rounded-full" />
                        <View className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-600/10 rounded-full" />

                        <View className="flex-row justify-between items-start mb-6">
                            <View>
                                <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Nivel Actual</Text>
                                <Text className="text-white text-2xl font-bold">
                                    {points >= 100 ? 'Platinum VIP' : points >= 50 ? 'Gourmet Pro' : 'Foodie Activo'}
                                </Text>
                            </View>
                            <View className="bg-orange-600 px-3 py-1 rounded-full">
                                <Text className="text-white font-bold text-xs">PUNTOS</Text>
                            </View>
                        </View>

                        <View className="flex-row items-end justify-between mb-2">
                            <Text className="text-white text-4xl font-black">{points}</Text>
                            <Text className="text-white/40 text-xs font-bold mb-1">PRÓXIMO NIVEL: {points >= 100 ? 'MAX' : points >= 50 ? '100' : '50'} pts</Text>
                        </View>

                        <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-orange-600"
                                style={{ width: `${Math.min((points / (points >= 100 ? points : points >= 50 ? 100 : 50)) * 100, 100)}%` }}
                            />
                        </View>

                        <View className="flex-row justify-between mt-4 items-center">
                            <View className="flex-row items-center">
                                <Shield size={14} color="#f97316" />
                                <Text className="text-white/80 text-[10px] font-bold ml-1 uppercase tracking-tighter">Beneficios exclusivos activados</Text>
                            </View>
                            <ChevronRight size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Menu Sections */}
                <View className="px-6 py-6">
                    {user?.email?.includes('admin') && (
                        <View className="mb-8">
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Administración</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/admin')}
                                className="flex-row items-center justify-between py-4 border-b border-orange-50 bg-orange-50/50 px-4 -mx-2 rounded-2xl"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center">
                                        <Shield size={20} color="#1f7a66" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-orange-900 font-bold">Portal de Staff</Text>
                                        <Text className="text-orange-700/60 text-xs">Gestión de mesas y QR</Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color="#1f7a66" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cuenta</Text>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity key={i} onPress={item.onPress} className="flex-row items-center justify-between py-4 border-b border-slate-50">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center">
                                    {item.icon}
                                </View>
                                <View className="ml-4">
                                    <Text className="text-slate-900 font-bold">{item.title}</Text>
                                    <Text className="text-slate-500 text-xs">{item.subtitle}</Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}

                    <View className="flex-row items-center justify-between py-4 border-b border-slate-50">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center">
                                <Bell size={20} color="#64748b" />
                            </View>
                            <Text className="ml-4 text-slate-900 font-bold">Notificaciones</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#f1f5f9', true: '#fed7aa' }}
                            thumbColor={notifications ? '#1f7a66' : '#ffffff'}
                        />
                    </View>

                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4">Soporte</Text>
                    {supportItems.map((item, i) => (
                        <TouchableOpacity key={i} onPress={item.onPress} className="flex-row items-center justify-between py-4 border-b border-slate-50">
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center">
                                    {item.icon}
                                </View>
                                <Text className="ml-4 text-slate-900 font-bold">{item.title}</Text>
                            </View>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}

                    {/* Logout */}
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-8 flex-row items-center justify-center p-5 rounded-2xl border border-red-50"
                    >
                        <LogOut size={20} color="#ef4444" />
                        <Text className="ml-2 text-red-500 font-bold text-lg">Cerrar Sesión</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-slate-300 text-xs mt-10 mb-20 font-bold tracking-widest">SITTARA V1.0.0 (MOBILE)</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
