import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RestaurantService, ReservationService } from '../services/restaurantService';
import reviewService from '../services/reviewService';

export const useRestaurants = () => {
    return useQuery({
        queryKey: ['restaurants'],
        queryFn: RestaurantService.getRestaurants,
    });
};

export const useFeaturedRestaurants = () => {
    return useQuery({
        queryKey: ['restaurants', 'featured'],
        queryFn: RestaurantService.getFeaturedRestaurants,
    });
};

export const useOffers = () => {
    return useQuery({
        queryKey: ['offers'],
        queryFn: () => RestaurantService.getOffers(),
    });
};

export const useRestaurantDetails = (id: string) => {
    return useQuery({
        queryKey: ['restaurant', id],
        queryFn: () => RestaurantService.getRestaurantDetails(id),
        enabled: !!id,
    });
};

export const useTimeSlots = (restaurantId: string, date: string, guests: number = 2) => {
    return useQuery({
        queryKey: ['time-slots', restaurantId, date, guests],
        queryFn: () => RestaurantService.getTimeSlots(restaurantId, date, guests),
        enabled: !!restaurantId && !!date,
    });
};

export const useAvailableTables = (restaurantId: string, date: string, time: string, guests: number) => {
    return useQuery({
        queryKey: ['available-tables', restaurantId, date, time, guests],
        queryFn: () => RestaurantService.getAvailableTables(restaurantId, date, time, guests),
        enabled: !!restaurantId && !!date && !!time,
    });
};

export const useCreateReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ReservationService.create,
        onSuccess: () => {
            // Invalidar cache de reservas para recargar la lista
            queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
};

// Usar el endpoint /my que es más seguro (no requiere userId en params)
export const useMyReservations = () => {
    return useQuery({
        queryKey: ['my-reservations'],
        queryFn: ReservationService.getMyReservations,
        // refetchInterval: 1000, // Refresco cada 1 segundo para debug en tiempo real
    });
};

// Hook para cancelar reserva
export const useCancelReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reservationId, reason }: { reservationId: string; reason?: string }) =>
            ReservationService.cancel(reservationId, reason),
        onSuccess: () => {
            // Invalidar cache para recargar la lista de reservas
            queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
};

// Legacy: mantener por compatibilidad
export const useUserReservations = (userId: string) => {
    return useQuery({
        queryKey: ['reservations', userId],
        queryFn: () => ReservationService.getUserReservations(userId),
        enabled: !!userId,
    });
};

// Review Hooks
export const useRestaurantReviews = (restaurantId: string) => {
    return useQuery({
        queryKey: ['reviews', restaurantId],
        queryFn: () => reviewService.getRestaurantReviews(restaurantId),
        enabled: !!restaurantId,
    });
};

export const useReviewStats = (restaurantId: string) => {
    return useQuery({
        queryKey: ['review-stats', restaurantId],
        queryFn: () => reviewService.getReviewStats(restaurantId),
        enabled: !!restaurantId,
    });
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reviewService.createReview,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.restaurantId] });
            queryClient.invalidateQueries({ queryKey: ['review-stats', variables.restaurantId] });
            queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
        },
    });
};

// Menu Hooks
export const useRestaurantMenu = (restaurantId: string) => {
    return useQuery({
        queryKey: ['restaurant-menu', restaurantId],
        queryFn: () => RestaurantService.getMenu(restaurantId),
        enabled: !!restaurantId,
    });
};

export const useMenuHighlights = (restaurantId: string) => {
    return useQuery({
        queryKey: ['restaurant-menu-highlights', restaurantId],
        queryFn: () => RestaurantService.getMenuHighlights(restaurantId),
        enabled: !!restaurantId,
    });
};

// Repeat Reservation Hooks
export const useLatestReservation = () => {
    return useQuery({
        queryKey: ['latest-reservation'],
        queryFn: ReservationService.getLatest,
    });
};

export const useRepeatReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reservationId, date, time }: { reservationId: string; date: string; time: string }) =>
            ReservationService.repeat(reservationId, date, time),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
            queryClient.invalidateQueries({ queryKey: ['latest-reservation'] });
        },
    });
};

// Notification Hooks
// Notification Hooks
import notificationService from '../services/notificationService';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
    });
};

export const useUnreadNotifications = () => {
    return useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30000, // Cada 30 segundos
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
        },
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
        },
    });
};

