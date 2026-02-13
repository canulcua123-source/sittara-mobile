import api from './api';
import { Review, ApiResponse, PaginatedResponse } from '../types';

export interface ReviewStats {
    count: number;
    averageRating: number;
    averageFoodRating: number;
    averageServiceRating: number;
    averageAmbianceRating: number;
    averageValueRating: number;
    distribution: Record<number, number>;
}

const reviewService = {
    /**
     * Get reviews for a restaurant
     */
    getRestaurantReviews: async (restaurantId: string, limit = 20, offset = 0): Promise<ApiResponse<Review[]>> => {
        try {
            const response = await api.get(`/reviews`, {
                params: { restaurantId, limit, offset }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
            return {
                success: false,
                data: [],
                error: error.response?.data?.error || 'Error al cargar las reseñas'
            };
        }
    },

    /**
     * Get review statistics for a restaurant
     */
    getReviewStats: async (restaurantId: string): Promise<ApiResponse<ReviewStats>> => {
        try {
            const response = await api.get(`/reviews/stats/${restaurantId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching review stats:', error);
            return {
                success: false,
                data: {
                    count: 0,
                    averageRating: 0,
                    averageFoodRating: 0,
                    averageServiceRating: 0,
                    averageAmbianceRating: 0,
                    averageValueRating: 0,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                },
                error: error.response?.data?.error || 'Error al cargar estadísticas'
            };
        }
    },

    /**
     * Create a new review
     */
    createReview: async (reviewData: {
        restaurantId: string;
        reservationId: string;
        rating: number;
        comment?: string;
        foodRating?: number;
        serviceRating?: number;
        ambianceRating?: number;
        valueRating?: number;
        tags?: string[];
        photos?: string[];
    }): Promise<ApiResponse<Review>> => {
        try {
            const response = await api.post('/reviews', reviewData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating review:', error);
            const message = error.response?.data?.error || 'Error al enviar la reseña';
            throw new Error(message);
        }
    },

    /**
     * Mark a review as helpful
     */
    markHelpful: async (reviewId: string): Promise<ApiResponse<Review>> => {
        try {
            const response = await api.post(`/reviews/${reviewId}/helpful`);
            return response.data;
        } catch (error: any) {
            console.error('Error marking review as helpful:', error);
            return {
                success: false,
                data: {} as Review,
                error: error.response?.data?.error || 'Error al marcar como útil'
            };
        }
    }
};

export default reviewService;
