import api from './api';
import { ApiResponse } from '../types';

export interface Notification {
    id: string;
    user_id: string;
    type: 'reservation_confirmed' | 'reservation_cancelled' | 'review_response' | 'promo' | 'system';
    title: string;
    message: string;
    is_read: boolean;
    data: any;
    created_at: string;
}

const notificationService = {
    /**
     * Get all notifications for current user
     */
    getNotifications: async (limit = 20, offset = 0): Promise<ApiResponse<Notification[]>> => {
        try {
            const response = await api.get('/notifications', {
                params: { limit, offset }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            return {
                success: false,
                data: [],
                error: error.response?.data?.error || 'Error al cargar las notificaciones'
            };
        }
    },

    /**
     * Get unread notifications count
     */
    getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
        try {
            const response = await api.get('/notifications/unread');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching unread count:', error);
            return {
                success: false,
                data: { unreadCount: 0 },
                error: error.response?.data?.error || 'Error'
            };
        }
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
        try {
            const response = await api.patch(`/notifications/${id}/read`);
            return response.data;
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            return {
                success: false,
                data: {} as Notification,
                error: error.response?.data?.error || 'Error'
            };
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await api.patch('/notifications/read-all');
            return response.data;
        } catch (error: any) {
            console.error('Error marking all as read:', error);
            return {
                success: false,
                data: {},
                error: error.response?.data?.error || 'Error'
            };
        }
    }
};

export default notificationService;
