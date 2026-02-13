import api from './api';

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
}

export interface ReservationData {
    restaurantId: string;
    tableId: string;
    date: string;
    time: string;
    guestCount: number;
    specialRequest?: string;
}

interface PaymentApiResponse {
    success: boolean;
    clientSecret?: string;
    paymentIntentId?: string;
    amount?: number;
    error?: string;
    refund?: {
        id: string;
        amount: number;
        status: string;
        currency: string;
    };
}

export const PaymentService = {
    /**
     * Create a PaymentIntent for deposit
     * @param amount Amount in MXN (e.g. 150 for $150 MXN)
     * @param reservationData Data for the reservation
     */
    createPaymentIntent: async (amount: number, reservationData: ReservationData): Promise<PaymentIntentResponse> => {
        const response = await api.post<PaymentApiResponse>('/payments/create-intent', {
            amount,
            currency: 'mxn',
            reservationData,
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error creating payment intent');
        }

        if (!response.data.clientSecret || !response.data.paymentIntentId) {
            throw new Error('Invalid payment intent response');
        }

        return {
            clientSecret: response.data.clientSecret,
            paymentIntentId: response.data.paymentIntentId,
            amount: response.data.amount || amount,
        };
    },

    /**
     * Confirm payment and update reservation
     */
    confirmPayment: async (paymentIntentId: string, reservationId: string): Promise<void> => {
        const response = await api.post<PaymentApiResponse>('/payments/confirm', {
            paymentIntentId,
            reservationId,
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error confirming payment');
        }
    },

    /**
     * Request a refund for a reservation
     */
    requestRefund: async (paymentIntentId: string, reservationId: string, reason?: string): Promise<PaymentApiResponse['refund']> => {
        const response = await api.post<PaymentApiResponse>('/payments/refund', {
            paymentIntentId,
            reservationId,
            reason,
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error processing refund');
        }

        return response.data.refund;
    },
};

export default PaymentService;
