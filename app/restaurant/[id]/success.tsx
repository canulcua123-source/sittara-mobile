import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Calendar, Clock, Users, Share2, Hash, Download } from 'lucide-react-native';
import Animated, { FadeInUp, ZoomInRotate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

// Helper para formatear fecha
const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString + 'T12:00:00'); // Evitar problemas de zona horaria
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    };
    const formatted = date.toLocaleDateString('es-MX', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Generar código de reserva único si no viene del servidor
const generateReservationCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'STTR-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export default function SuccessScreen() {
    const params = useLocalSearchParams<{
        id: string;
        date?: string;
        time?: string;
        guests?: string;
        table?: string;
        restaurantName?: string;
        qrCode?: string;
        reservationId?: string;
    }>();
    const router = useRouter();

    // Extraer datos de la reserva
    const reservationDate = params.date || new Date().toISOString().split('T')[0];
    const reservationTime = params.time || '19:00';
    const guestCount = params.guests || '2';
    const tableNumber = params.table || '?';
    const restaurantName = params.restaurantName || 'Restaurante';
    const reservationId = params.reservationId || '';

    // Usar código QR del servidor o generar uno
    const reservationCode = useMemo(() => {
        return params.qrCode || generateReservationCode();
    }, [params.qrCode]);

    // Datos para el QR (formato JSON para que el escáner pueda leerlo)
    const qrData = useMemo(() => {
        return JSON.stringify({
            type: 'sittara_reservation',
            code: reservationCode,
            reservationId: reservationId,
            restaurantId: params.id,
            date: reservationDate,
            time: reservationTime,
            guests: parseInt(guestCount),
            table: tableNumber,
        });
    }, [reservationCode, reservationId, params.id, reservationDate, reservationTime, guestCount, tableNumber]);

    useEffect(() => {
        // Haptic feedback on mount
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    const handleDone = () => {
        router.replace('/(tabs)/two'); // Ir a mis reservas
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🍽️ ¡Tengo una reserva en ${restaurantName}!\n\n📅 ${formatDate(reservationDate)}\n⏰ ${reservationTime}\n👥 ${guestCount} personas\n🪑 Mesa ${tableNumber}\n\n📱 Código: ${reservationCode}\n\nReserva tu mesa en Sittara: https://sittara.app`,
                title: 'Mi Reserva en Sittara',
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Success Header - Ahora con estilo de espera */}
                <View className="bg-yellow-50 pt-20 pb-12 items-center rounded-b-[50px]">
                    <Animated.View
                        entering={ZoomInRotate.duration(800)}
                        className="w-24 h-24 bg-yellow-500 rounded-full items-center justify-center shadow-lg shadow-yellow-500/40 mb-6"
                    >
                        <Clock color="white" size={48} strokeWidth={4} />
                    </Animated.View>

                    <Animated.Text
                        entering={FadeInUp.delay(300)}
                        className="text-2xl font-bold text-slate-900 mb-2 px-6 text-center"
                    >
                        Reserva Pendiente por Confirmar
                    </Animated.Text>

                    <Animated.Text
                        entering={FadeInUp.delay(400)}
                        className="text-slate-500 text-lg px-8 text-center"
                    >
                        Hemos recibido tu solicitud. El restaurante te notificará en cuanto sea confirmada.
                    </Animated.Text>
                </View>

                {/* Status Information Card (En lugar del QR) */}
                <View className="px-8 -mt-10">
                    <Animated.View
                        entering={FadeInUp.delay(600)}
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-slate-50 items-center"
                    >
                        <View className="bg-yellow-100 px-4 py-2 rounded-full mb-4">
                            <Text className="text-yellow-700 font-bold uppercase tracking-widest text-[10px]">VERIFICANDO DISPONIBILIDAD</Text>
                        </View>

                        <Text className="text-slate-500 text-center text-sm">
                            Una vez que el administrador acepte tu reserva, recibirás un correo y podrás ver tu código QR en la sección de "Mis Reservas".
                        </Text>
                    </Animated.View>
                </View>

                {/* Reservation Info Card */}
                <View className="px-8 mt-8 pb-12">
                    <Animated.View
                        entering={FadeInUp.delay(800)}
                        className="bg-slate-50 rounded-3xl p-6"
                    >
                        <Text className="text-slate-900 font-bold text-lg mb-2">{restaurantName}</Text>
                        <Text className="text-slate-500 text-sm mb-4">Detalles de tu reserva</Text>

                        <View className="space-y-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4">
                                    <Calendar color="#1f7a66" size={20} />
                                </View>
                                <View>
                                    <Text className="text-slate-400 text-xs font-bold">FECHA</Text>
                                    <Text className="text-slate-900 font-semibold">{formatDate(reservationDate)}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-4">
                                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4">
                                    <Clock color="#1f7a66" size={20} />
                                </View>
                                <View>
                                    <Text className="text-slate-400 text-xs font-bold">HORA</Text>
                                    <Text className="text-slate-900 font-semibold">{reservationTime}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-4">
                                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4">
                                    <Users color="#1f7a66" size={20} />
                                </View>
                                <View>
                                    <Text className="text-slate-400 text-xs font-bold">PERSONAS</Text>
                                    <Text className="text-slate-900 font-semibold">{guestCount} Comensales</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-4">
                                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4">
                                    <Hash color="#1f7a66" size={20} />
                                </View>
                                <View>
                                    <Text className="text-slate-400 text-xs font-bold">MESA</Text>
                                    <Text className="text-slate-900 font-semibold">Mesa #{tableNumber}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Action Buttons */}
                    <View className="flex-row mt-8 space-x-4">
                        <TouchableOpacity
                            onPress={handleShare}
                            className="flex-1 bg-slate-100 h-14 rounded-2xl items-center justify-center flex-row"
                        >
                            <Share2 color="#64748b" size={20} />
                            <Text className="text-slate-600 font-bold ml-2">Compartir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDone}
                            className="flex-1 bg-orange-600 h-14 rounded-2xl items-center justify-center"
                        >
                            <Text className="text-white font-bold">Ver Reservas</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
