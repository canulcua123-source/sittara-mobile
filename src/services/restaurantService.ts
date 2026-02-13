import api from './api';
import { Restaurant, ApiResponse, Offer, TimeSlot, Table } from '../types';

export const RestaurantService = {
    getRestaurants: async () => {
        const response = await api.get<ApiResponse<Restaurant[]>>('/restaurants');
        return response.data.data;
    },

    getFeaturedRestaurants: async () => {
        const response = await api.get<ApiResponse<Restaurant[]>>('/restaurants/featured');
        return response.data.data;
    },

    getRestaurantDetails: async (id: string) => {
        const response = await api.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
        return response.data.data;
    },

    getTimeSlots: async (restaurantId: string, date: string, guests: number = 2) => {
        // El backend requiere 'guests' además de 'date'
        const response = await api.get<ApiResponse<TimeSlot[]>>(`/restaurants/${restaurantId}/timeslots?date=${date}&guests=${guests}`);
        return response.data.data;
    },

    getAvailableTables: async (restaurantId: string, date: string, time: string, guests: number) => {
        try {
            const response = await api.get<ApiResponse<any[]>>(`/restaurants/${restaurantId}/tables/available?date=${date}&time=${time}&guests=${guests}`);

            // Transformar datos del backend al formato esperado por el frontend
            const tables = (response.data.data || []).map((table: any) => ({
                id: table.id,
                restaurantId: table.restaurant_id,
                number: table.number,
                capacity: table.capacity,
                status: table.status || 'available',
                zone: table.zone || 'main',
                x: table.position_x || table.x || 0,
                y: table.position_y || table.y || 0,
                shape: table.shape || 'round',
                width: table.width || 60,
                height: table.height || 60,
            }));

            return tables;
        } catch (error: any) {
            throw error;
        }
    },

    getOffers: async (restaurantId?: string) => {
        // El backend usa /offers para todas las ofertas activas
        // y /offers/restaurants/:id para ofertas de un restaurante específico
        const url = restaurantId ? `/offers/restaurants/${restaurantId}` : '/offers';
        const response = await api.get<ApiResponse<Offer[]>>(url);
        return response.data.data;
    },

    getMenu: async (restaurantId: string) => {
        const response = await api.get<ApiResponse<any[]>>(`/restaurants/${restaurantId}/menu`);
        return response.data.data;
    },

    getMenuHighlights: async (restaurantId: string) => {
        const response = await api.get<ApiResponse<any[]>>(`/restaurants/${restaurantId}/menu/highlights`);
        return response.data.data;
    }
};

export const ReservationService = {
    create: async (data: any) => {
        const response = await api.post<ApiResponse<any>>('/reservations', data);
        return response.data.data;
    },

    // Obtener reservas del usuario autenticado (usa /my que es más seguro)
    getMyReservations: async () => {
        const response = await api.get<ApiResponse<any[]>>('/reservations/my');
        return response.data.data;
    },

    // Cancelar una reserva
    cancel: async (reservationId: string, reason?: string) => {
        const response = await api.post<ApiResponse<any>>(`/reservations/${reservationId}/cancel`, { reason });
        return response.data;
    },

    // Obtener detalle de una reserva
    getById: async (reservationId: string) => {
        const response = await api.get<ApiResponse<any>>(`/reservations/${reservationId}`);
        return response.data.data;
    },

    // Legacy: mantener por compatibilidad
    getUserReservations: async (userId: string) => {
        const response = await api.get<ApiResponse<any[]>>(`/reservations/user/${userId}`);
        return response.data.data;
    },

    getLatest: async () => {
        const response = await api.get<ApiResponse<any>>('/reservations/my/latest');
        return response.data.data;
    },

    repeat: async (reservationId: string, date: string, time: string) => {
        const response = await api.post<ApiResponse<any>>(`/reservations/repeat/${reservationId}`, { date, time });
        return response.data;
    }
};
