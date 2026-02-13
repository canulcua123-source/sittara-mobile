import api from './api';
import { ApiResponse } from '../types';

export const AdminService = {
    getDailyStats: async () => {
        const response = await api.get<ApiResponse<any>>('/admin/dashboard');
        return response.data.data;
    },

    getPendingReservations: async (restaurantId: string) => {
        // Usamos el endpoint de staff que es el que gestiona el día a día
        const response = await api.get<ApiResponse<any[]>>(`/staff/reservations/today?restaurantId=${restaurantId}`);
        return response.data.data;
    },

    checkInReservation: async (reservationId: string) => {
        // En el backend el check-in se hace a través de /staff/reservations/:id/arrive
        const response = await api.patch<ApiResponse<any>>(`/staff/reservations/${reservationId}/arrive`);
        return response.data.data;
    },

    getTables: async (restaurantId: string) => {
        const response = await api.get<ApiResponse<any[]>>(`/staff/tables?restaurantId=${restaurantId}`);
        return response.data.data;
    }
};
