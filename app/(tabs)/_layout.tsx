import React, { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Ticket, User, Heart, Tag } from 'lucide-react-native';
import { View, Alert } from 'react-native';
import { useMyReservations } from '../../src/hooks/useData';
import * as SecureStore from 'expo-secure-store';

/**
 * Observador global que monitorea si una reserva ha sido completada
 * para disparar automáticamente la pantalla de calificación.
 */
function RatingObserver() {
  const { data: reservations } = useMyReservations();
  const router = useRouter();
  const processedId = useRef<string | null>(null);

  useEffect(() => {
    if (!reservations) {
      console.log('[RatingObserver] No reservations data yet');
      return;
    }

    const checkReservations = async () => {
      // Filtrar reservaciones completadas sin reseña
      const completedNoReview = reservations.filter(
        (res: any) => res.status === 'completed' && !res.has_review
      );

      if (completedNoReview.length > 0) {
        console.log(`[RatingObserver] Found ${completedNoReview.length} potential reservations needing rating`);
        console.log(`[RatingObserver] Top one: ID=${completedNoReview[0].id}, Time=${completedNoReview[0].time}, CreatedAt=${completedNoReview[0].created_at}`);
      }

      const needsRating = completedNoReview[0]; // Tomar la más reciente

      if (needsRating && processedId.current !== needsRating.id) {
        // Validación para evitar notificaciones prematuras durante pruebas rápidas
        const createdAt = new Date(needsRating.created_at);
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1 minute in milliseconds

        if (createdAt > oneMinuteAgo) {
          console.log(`[RatingObserver] Reservation ${needsRating.id} created less than 1 minute ago. Skipping to avoid premature rating prompt.`);
          return;
        }

        // Verificar en almacenamiento persistente si ya notificamos esta reserva
        const notifiedKey = `rating_notified_${needsRating.id}`;
        const alreadyNotified = await SecureStore.getItemAsync(notifiedKey);

        console.log(`[RatingObserver] Checking res ${needsRating.id}, alreadyNotified: ${alreadyNotified}`);

        if (!alreadyNotified) {
          processedId.current = needsRating.id;

          // Marcar como notificado antes de navegar para evitar duplicados por re-renders
          await SecureStore.setItemAsync(notifiedKey, 'true');

          console.log(`[RatingObserver] NAVIGATING to rate screen for ${needsRating.restaurants?.name}`);

          Alert.alert(
            "¡Visita Terminada!",
            `Esperamos que hayas disfrutado en ${needsRating.restaurants?.name || 'el restaurante'}. Por favor, califica tu experiencia.`,
            [{
              text: "Calificar ahora", onPress: () => {
                router.push({
                  pathname: "/restaurant/rate",
                  params: {
                    restaurantId: needsRating.restaurant_id,
                    reservationId: needsRating.id,
                    restaurantName: needsRating.restaurants?.name || 'el restaurante'
                  }
                });
              }
            }]
          );
        }
      }
    };

    checkReservations();
  }, [reservations]);

  return null;
}

export default function TabLayout() {
  return (
    <>
      <RatingObserver />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1f7a66', // primary-orange
          tabBarInactiveTintColor: '#94a3b8', // slate-400
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingBottom: 25,
            paddingTop: 10,
            backgroundColor: '#ffffff',
            // @ts-ignore - New boxShadow prop format for RN 0.75+
            boxShadow: [
              {
                offsetX: 0,
                offsetY: -2,
                blurRadius: 10,
                color: 'rgba(0, 0, 0, 0.05)',
              },
            ],
          },
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color, focused }) => (
              <View className={focused ? 'scale-110' : ''}>
                <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="offers"
          options={{
            title: 'Ofertas',
            tabBarIcon: ({ color, focused }) => (
              <View className={focused ? 'scale-110' : ''}>
                <Tag size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favoritos',
            tabBarIcon: ({ color, focused }) => (
              <View className={focused ? 'scale-110' : ''}>
                <Heart size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'Reservas',
            tabBarIcon: ({ color, focused }) => (
              <View className={focused ? 'scale-110' : ''}>
                <Ticket size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <View className={focused ? 'scale-110' : ''}>
                <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
