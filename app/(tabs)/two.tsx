import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useMyReservations, useCancelReservation } from '../../src/hooks/useData';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronRight,
  Ticket,
  Search,
  History,
  X,
  AlertCircle,
  MessageSquare
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Helper para formatear fecha de forma legible
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T12:00:00');
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short'
  };
  return date.toLocaleDateString('es-MX', options);
};

// Helper para obtener el color del status
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { bg: 'bg-green-50', text: 'text-green-600', label: 'Confirmado' };
    case 'pending':
      return { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pendiente' };
    case 'arrived':
      return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'En curso' };
    case 'completed':
      return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Completado' };
    case 'cancelled':
      return { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelado' };
    case 'no_show':
      return { bg: 'bg-red-50', text: 'text-red-500', label: 'No asistió' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-500', label: status };
  }
};

export default function ReservationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: reservations, isLoading, refetch, isRefetching } = useMyReservations();
  const cancelReservation = useCancelReservation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Auto-refetch al enfocar la pantalla para asegurar estados actualizados
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  // Filtrar reservas
  const localNow = new Date();
  const todayString = localNow.getFullYear() + '-' +
    String(localNow.getMonth() + 1).padStart(2, '0') + '-' +
    String(localNow.getDate()).padStart(2, '0');

  const upcomingReservations = reservations?.filter((r: any) => {
    // El usuario solicitó explícitamente que las completadas pasen a historial
    // PERO si falta review, la mantenemos en Upcoming para incentivar la acción (Sticky Rating)
    const isActiveStatus = ['pending', 'confirmed', 'arrived', 'seated'].includes(r.status);
    const needsReview = r.status === 'completed' && !r.has_review;

    // Mostramos en "Próximas" si está activa O si necesita reseña
    return isActiveStatus || needsReview;
  }) || [];

  const pastReservations = reservations?.filter((r: any) => {
    // Todo lo que no está en próximas va al historial
    return !upcomingReservations.find((up: any) => up.id === r.id);
  }) || [];

  const displayedReservations = activeTab === 'upcoming' ? upcomingReservations : pastReservations;

  // Handler para cancelar reserva
  const handleCancelReservation = (reservation: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Cancelar Reserva',
      `¿Estás seguro de que quieres cancelar tu reserva en ${reservation.restaurants?.name || 'el restaurante'} para el ${formatDate(reservation.date)} a las ${reservation.time}?`,
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(reservation.id);
            try {
              await cancelReservation.mutateAsync({
                reservationId: reservation.id,
                reason: 'Cancelado por el usuario desde la app móvil'
              });

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Toast.show({
                type: 'success',
                text1: 'Reserva cancelada',
                text2: 'Tu reserva ha sido cancelada exitosamente',
              });
            } catch (error: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'No se pudo cancelar la reserva',
              });
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-10">
        <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
          <Ticket size={40} color="#94a3b8" />
        </View>
        <Text className="text-2xl font-bold text-slate-900 mb-2 text-center">Tus Reservas</Text>
        <Text className="text-slate-500 text-center mb-8">Inicia sesión para ver y gestionar tus reservas en Sittara.</Text>
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
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-extrabold text-slate-900 mb-6">Mis Reservas</Text>

        {/* Tabs */}
        <View className="flex-row bg-slate-50 p-1 rounded-2xl mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'upcoming' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'upcoming' ? 'text-orange-600' : 'text-slate-500'}`}>
              Próximas ({upcomingReservations.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('past')}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'past' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'past' ? 'text-orange-600' : 'text-slate-500'}`}>
              Historial ({pastReservations.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1f7a66" />
        }
      >
        {isLoading ? (
          <ActivityIndicator color="#1f7a66" className="mt-10" />
        ) : displayedReservations.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6">
              {activeTab === 'upcoming' ? <Search size={40} color="#cbd5e1" /> : <History size={40} color="#cbd5e1" />}
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">
              {activeTab === 'upcoming' ? 'Sin reservas próximas' : 'No tienes historial'}
            </Text>
            <Text className="text-slate-500 text-center mb-8 px-10">
              {activeTab === 'upcoming'
                ? '¿Hambre? Reserva una mesa en los mejores restaurantes de Yucatán.'
                : 'Tus visitas pasadas aparecerán aquí una vez que comiences a reservar.'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)')}
                className="bg-slate-900 px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-bold">Explorar Restaurantes</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="space-y-4 pb-10">
            {displayedReservations.map((res: any) => {
              const statusConfig = getStatusConfig(res.status);
              const isCancelling = cancellingId === res.id;
              const canCancel = ['pending', 'confirmed'].includes(res.status) && activeTab === 'upcoming';

              return (
                <View
                  key={res.id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm shadow-blue-500/5 mb-4"
                >
                  <View className="flex-row items-center mb-4">
                    <Image
                      source={{ uri: res.restaurants?.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200' }}
                      className="w-16 h-16 rounded-2xl"
                    />
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-slate-900">{res.restaurants?.name || 'Restaurante'}</Text>
                      <View className="flex-row items-center mt-1">
                        <MapPin size={12} color="#64748b" />
                        <Text className="text-slate-500 text-xs ml-1">{res.restaurants?.address || 'Mérida'}</Text>
                      </View>
                    </View>
                    <View className={`px-3 py-1.5 rounded-xl ${statusConfig.bg}`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-widest ${statusConfig.text}`}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between bg-slate-50 rounded-2xl p-4">
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#1f7a66" />
                      <Text className="text-slate-700 font-bold text-xs ml-2">{formatDate(res.date)}</Text>
                    </View>
                    <View className="flex-row items-center border-x border-slate-200 px-4 mx-4">
                      <Clock size={14} color="#1f7a66" />
                      <Text className="text-slate-700 font-bold text-xs ml-2">{res.time}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Users size={14} color="#1f7a66" />
                      <Text className="text-slate-700 font-bold text-xs ml-2">{res.guest_count || res.guestCount} p.</Text>
                    </View>
                  </View>

                  {/* Acciones */}
                  <View className="flex-row mt-4 space-x-3">
                    {/* Ver Ticket (solo para confirmados/pendientes) */}
                    {['confirmed', 'pending', 'arrived'].includes(res.status) && (
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center bg-orange-50 py-3 rounded-xl"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          router.push({
                            pathname: "/reservation/[id]/details",
                            params: { id: res.id }
                          });
                        }}
                      >
                        <Ticket size={16} color="#1f7a66" />
                        <Text className="ml-2 text-orange-600 font-semibold text-sm">
                          {res.status === 'confirmed' ? 'Ver Ticket QR' : 'Ver Detalles'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Botón Cancelar (solo para pendientes/confirmados en upcoming) */}
                    {canCancel && (
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center bg-red-50 py-3 rounded-xl"
                        onPress={() => handleCancelReservation(res)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                          <>
                            <X size={16} color="#ef4444" />
                            <Text className="ml-2 text-red-500 font-semibold text-sm">Cancelar</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* Botón Calificar - SIEMPRE visible si está completada y sin reseña */}
                    {res.status === 'completed' && !res.has_review && (
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center bg-yellow-400 py-3 rounded-xl shadow-sm"
                        onPress={() => {
                          console.log('[Mobile] Navigating to rate reservation:', res.id);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          router.push({
                            pathname: "/restaurant/rate",
                            params: {
                              restaurantId: res.restaurant_id || res.restaurantId,
                              reservationId: res.id,
                              restaurantName: res.restaurants?.name || res.restaurant?.name || 'Restaurante'
                            }
                          });
                        }}
                      >
                        <MessageSquare size={16} color="#ffffff" strokeWidth={2.5} />
                        <Text className="ml-2 text-white font-bold text-sm">CALIFICAR AHORA</Text>
                      </TouchableOpacity>
                    )}

                    {/* Botón Repetir (solo para completados) */}
                    {res.status === 'completed' && (
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center bg-orange-50 py-3 rounded-xl"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          router.push({
                            pathname: "/restaurant/[id]/reserve",
                            params: {
                              id: res.restaurant_id,
                              guests: res.guest_count,
                              repeatId: res.id
                            }
                          });
                        }}
                      >
                        <History size={16} color="#c2410c" />
                        <Text className="ml-2 text-orange-700 font-semibold text-sm">Repetir</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Mensaje para cancelados */}
                  {res.status === 'cancelled' && (
                    <View className="flex-row items-center mt-3 bg-red-50 p-3 rounded-xl">
                      <AlertCircle size={14} color="#ef4444" />
                      <Text className="ml-2 text-red-500 text-xs">Esta reserva fue cancelada</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
