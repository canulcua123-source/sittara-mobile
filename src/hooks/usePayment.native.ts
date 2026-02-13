// Native version - Stripe is available
import { useState, useCallback } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import PaymentService, { ReservationData } from '../services/paymentService';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export interface UsePaymentResult {
    isLoading: boolean;
    isReady: boolean;
    error: string | null;
    initiatePayment: (amount: number, reservationData: ReservationData) => Promise<boolean>;
    paymentIntentId: string | null;
    isAvailable: boolean;
}

export function usePayment(): UsePaymentResult {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

    const initiatePayment = useCallback(async (
        amount: number,
        reservationData: ReservationData
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Create PaymentIntent on backend
            const { clientSecret, paymentIntentId: intentId } = await PaymentService.createPaymentIntent(
                amount,
                reservationData
            );

            setPaymentIntentId(intentId);

            // 2. Initialize the Payment Sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Sittara',
                paymentIntentClientSecret: clientSecret,
                defaultBillingDetails: {
                    address: {
                        country: 'MX',
                    },
                },
                appearance: {
                    colors: {
                        primary: '#1f7a66',
                        background: '#ffffff',
                        componentBackground: '#f8fafc',
                        componentText: '#0f172a',
                        componentBorder: '#e2e8f0',
                        primaryText: '#0f172a',
                        secondaryText: '#64748b',
                        icon: '#1f7a66',
                        placeholderText: '#94a3b8',
                    },
                    shapes: {
                        borderRadius: 16,
                        borderWidth: 1,
                    },
                },
                returnURL: 'sittara://payment-complete',
            });

            if (initError) {
                setError(initError.message);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Toast.show({
                    type: 'error',
                    text1: 'Error de pago',
                    text2: initError.message,
                });
                setIsLoading(false);
                return false;
            }

            setIsReady(true);

            // 3. Present the Payment Sheet
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code === 'Canceled') {
                    setIsLoading(false);
                    return false;
                }
                setError(paymentError.message);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Toast.show({
                    type: 'error',
                    text1: 'Pago fallido',
                    text2: paymentError.message,
                });
                setIsLoading(false);
                return false;
            }

            // 4. Payment successful!
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: '¡Pago exitoso!',
                text2: `Se han cobrado $${amount} MXN`,
            });

            setIsLoading(false);
            return true;

        } catch (err: any) {
            const errorMessage = err.message || 'Error procesando el pago';
            setError(errorMessage);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
            setIsLoading(false);
            return false;
        }
    }, [initPaymentSheet, presentPaymentSheet]);

    return {
        isLoading,
        isReady,
        error,
        initiatePayment,
        paymentIntentId,
        isAvailable: true,
    };
}

export default usePayment;
