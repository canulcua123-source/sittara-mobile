// Web version - Stripe is not available
import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { ReservationData } from '../services/paymentService';

export interface UsePaymentResult {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    initiatePayment: (amount: number, reservationData: ReservationData) => Promise<boolean>;
    paymentIntentId: string | null;
    isAvailable: boolean;
}

export function usePayment(): UsePaymentResult {
    const [isLoading] = useState(false);
    const [isReady] = useState(false);
    const [error] = useState<string | null>(null);
    const [paymentIntentId] = useState<string | null>(null);

    const initiatePayment = useCallback(async (
        _amount: number,
        _reservationData: ReservationData
    ): Promise<boolean> => {
        Toast.show({
            type: 'info',
            text1: 'Pagos móvil',
            text2: 'Los pagos con tarjeta solo están disponibles en la app móvil',
        });
        return false;
    }, []);

    return {
        isLoading,
        isReady,
        error,
        initiatePayment,
        paymentIntentId,
        isAvailable: false,
    };
}

export default usePayment;
