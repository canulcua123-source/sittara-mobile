import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Check, Calendar, Clock, Users, Share2, Hash, ArrowLeft, MapPin, Phone, AlertCircle, Star } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { useMyReservations } from '../../../src/hooks/useData';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Helper para formatear fecha
const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString + 'T12:00:00');
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    const formatted = date.toLocaleDateString('es-MX', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Helper para obtener el color del status
const getStatusConfig = (status: string) => {
    switch (status) {
        case 'confirmed':
            return {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                label: 'Confirmada',
                description: 'Tu reserva ha sido aceptada por el restaurante. ¡Te esperamos!'
            };
        case 'pending':
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                label: 'Pendiente',
                description: 'El restaurante está revisando tu solicitud. Te avisaremos pronto.'
            };
        case 'arrived':
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
                label: 'En curso',
                description: '¡Ya estás en el restaurante! Disfruta tu comida.'
            };
        case 'completed':
            return {
                bg: 'bg-slate-100',
                text: 'text-slate-700',
                border: 'border-slate-200',
                label: 'Completada',
                description: 'Esta visita ya ha finalizado.'
            };
        case 'cancelled':
            return {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                label: 'Cancelada',
                description: 'Esta reserva ha sido cancelada.'
            };
        default:
            return {
                bg: 'bg-slate-100',
                text: 'text-slate-700',
                border: 'border-slate-200',
                label: status,
                description: ''
            };
    }
};

export default function ReservationDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: reservations, isLoading } = useMyReservations();

    // Buscar la reserva específica en el cache local
    const reservation = useMemo(() => {
        return reservations?.find((r: any) => r.id === id);
    }, [reservations, id]);

    const statusConfig = useMemo(() => {
        return reservation ? getStatusConfig(reservation.status) : null;
    }, [reservation]);

    // Datos para el QR (Texto plano es más confiable para el escáner web)
    const qrData = useMemo(() => {
        if (!reservation) return '';
        // Priorizamos el qr_code del servidor, si no, usamos el ID corto
        return reservation.qr_code || reservation.id;
    }, [reservation]);

    const handleShare = async () => {
        if (!reservation) return;
        try {
            await Share.share({
                message: `🍽️ Mi reserva en ${reservation.restaurants?.name}\n📅 ${formatDate(reservation.date)}\n⏰ ${reservation.time}\n\n📱 Código: ${reservation.qr_code || 'Ver en Sittara'}`,
                title: 'Mi Reserva en Sittara',
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#1f7a66" />
                <Text className="mt-4 text-slate-500 font-medium">Cargando detalles...</Text>
            </View>
        );
    }

    if (!reservation) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-10">
                <AlertCircle size={48} color="#ef4444" />
                <Text className="text-xl font-bold text-slate-900 mt-4 text-center">Reserva no encontrada</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-slate-900 px-8 py-3 rounded-xl">
                    <Text className="text-white font-bold">Regresar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header Superior */}
                <View className="bg-slate-900 pt-14 pb-12 px-6 rounded-b-[40px]">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-6"
                    >
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>

                    <Animated.Text entering={FadeInUp} className="text-white text-3xl font-bold mb-2">
                        Tu Reserva
                    </Animated.Text>
                    <Animated.Text entering={FadeInUp.delay(100)} className="text-slate-400 text-lg">
                        Muestra este código al llegar
                    </Animated.Text>
                </View>

                {/* Card de Estado y QR */}
                <View className="px-6 -mt-8">
                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        className="bg-white rounded-3xl p-6 shadow-xl shadow-black/10 border border-slate-100 items-center"
                    >
                        {/* Status Badge */}
                        <View className={`px-4 py-2 rounded-full mb-6 flex-row items-center border ${statusConfig?.bg} ${statusConfig?.border}`}>
                            <View className={`w-2 h-2 rounded-full mr-2 ${statusConfig?.text.replace('text', 'bg')}`} />
                            <Text className={`font-bold uppercase tracking-widest text-[10px] ${statusConfig?.text}`}>
                                {statusConfig?.label}
                            </Text>
                        </View>

                        {/* Código QR con máximo contraste y corrección de errores */}
                        <View className="bg-white p-6 rounded-3xl border-2 border-slate-100 mb-4 shadow-sm">
                            <QRCode
                                value={qrData}
                                size={240} // Más grande
                                color="#000000" // Negro puro
                                backgroundColor="#FFFFFF"
                                ecl="H" // High Error Correction para que sea más fácil de leer
                            />
                        </View>

                        <Text className="text-slate-900 font-bold text-2xl tracking-[4px] mb-2">
                            {reservation.qr_code || reservation.id.split('-')[0].toUpperCase()}
                        </Text>

                        <Text className="text-slate-400 text-sm text-center px-4">
                            {statusConfig?.description}
                        </Text>
                    </Animated.View>
                </View>

                {/* Detalles de la reserva */}
                <View className="px-6 mt-8 pb-12">
                    <Text className="text-slate-900 font-bold text-xl mb-4">Detalles del Restaurante</Text>

                    <View className="bg-slate-50 rounded-3xl p-6 space-y-6">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm shadow-black/5">
                                <MapPin color="#1f7a66" size={24} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">{reservation.restaurants?.name}</Text>
                                <Text className="text-slate-500 text-sm">{reservation.restaurants?.address}</Text>
                            </View>
                        </View>

                        <View className="h-[1px] bg-slate-200" />

                        <View className="grid grid-cols-2 gap-4 flex-row flex-wrap">
                            <View className="w-[48%] mb-4">
                                <View className="flex-row items-center mb-1">
                                    <Calendar color="#64748b" size={14} />
                                    <Text className="text-slate-400 text-[10px] font-bold ml-1 uppercase">Fecha</Text>
                                </View>
                                <Text className="text-slate-900 font-semibold">{formatDate(reservation.date)}</Text>
                            </View>

                            <View className="w-[48%] mb-4">
                                <View className="flex-row items-center mb-1">
                                    <Clock color="#64748b" size={14} />
                                    <Text className="text-slate-400 text-[10px] font-bold ml-1 uppercase">Hora</Text>
                                </View>
                                <Text className="text-slate-900 font-semibold">{reservation.time}</Text>
                            </View>

                            <View className="w-[48%]">
                                <View className="flex-row items-center mb-1">
                                    <Users color="#64748b" size={14} />
                                    <Text className="text-slate-400 text-[10px] font-bold ml-1 uppercase">Personas</Text>
                                </View>
                                <Text className="text-slate-900 font-semibold">{reservation.guest_count || reservation.guestCount} Comensales</Text>
                            </View>

                            <View className="w-[48%]">
                                <View className="flex-row items-center mb-1">
                                    <Hash color="#64748b" size={14} />
                                    <Text className="text-slate-400 text-[10px] font-bold ml-1 uppercase">Mesa</Text>
                                </View>
                                <Text className="text-slate-900 font-semibold">
                                    {reservation.tables?.number ? `Mesa #${reservation.tables.number}` : 'Asignada al llegar'}
                                </Text>
                            </View>
                        </View>

                        {reservation.special_request && (
                            <>
                                <View className="h-[1px] bg-slate-200" />
                                <View>
                                    <Text className="text-slate-400 text-[10px] font-bold mb-1 uppercase">Notas especiales</Text>
                                    <Text className="text-slate-700 italic">"{reservation.special_request}"</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Botones de acción */}
                    <View className="flex-col mt-8 gap-4">
                        {reservation.status === 'completed' && !reservation.has_review && (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/restaurant/rate',
                                    params: {
                                        restaurantId: reservation.restaurant_id || reservation.restaurantId,
                                        reservationId: reservation.id,
                                        restaurantName: (reservation as any).restaurants?.name || (reservation as any).restaurant?.name || 'Restaurante'
                                    }
                                })}
                                className="w-full bg-yellow-500 h-16 rounded-2xl items-center justify-center flex-row shadow-lg shadow-yellow-200"
                            >
                                <Star color="white" size={24} fill="white" />
                                <Text className="text-white font-bold text-lg ml-2">Calificar mi visita</Text>
                            </TouchableOpacity>
                        )}

                        <View className="flex-row gap-4">
                            {reservation.status === 'completed' && (
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: "/restaurant/[id]/reserve",
                                        params: {
                                            id: reservation.restaurant_id,
                                            guests: reservation.guest_count,
                                            repeatId: reservation.id
                                        }
                                    })}
                                    className="flex-1 bg-orange-50 h-14 rounded-2xl items-center justify-center flex-row border border-orange-100"
                                >
                                    <Clock color="#c2410c" size={20} />
                                    <Text className="text-orange-700 font-bold ml-2">Repetir</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={handleShare}
                                className="flex-1 bg-slate-100 h-14 rounded-2xl items-center justify-center flex-row"
                            >
                                <Share2 color="#64748b" size={20} />
                                <Text className="text-slate-600 font-bold ml-2">Compartir</Text>
                            </TouchableOpacity>
                        </View>

                        {reservation.restaurants?.phone && (
                            <TouchableOpacity className="w-full bg-orange-600 h-14 rounded-2xl items-center justify-center flex-row">
                                <Phone color="white" size={20} />
                                <Text className="text-white font-bold text-lg ml-2">Llamar al restaurante</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
