import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, ArrowLeft, Send } from 'lucide-react-native';
import { useCreateReview } from '../../src/hooks/useData';
import { useAuth } from '../../src/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export default function RateScreen() {
    const { restaurantId, reservationId, restaurantName } = useLocalSearchParams<{
        restaurantId: string;
        reservationId: string;
        restaurantName: string;
    }>();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const createReview = useCreateReview();

    const [rating, setRating] = useState(0);
    const [foodRating, setFoodRating] = useState(0);
    const [serviceRating, setServiceRating] = useState(0);
    const [ambianceRating, setAmbianceRating] = useState(0);
    const [valueRating, setValueRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        if (!restaurantId || !reservationId) {
            Alert.alert('Error', 'Faltan datos de la reservación para calificar');
            return;
        }

        if (rating === 0) {
            Alert.alert('Error', 'Por favor selecciona una calificación general');
            return;
        }

        createReview.mutate({
            restaurantId: restaurantId as string,
            reservationId: reservationId as string,
            rating,
            foodRating: foodRating > 0 ? foodRating : undefined,
            serviceRating: serviceRating > 0 ? serviceRating : undefined,
            ambianceRating: ambianceRating > 0 ? ambianceRating : undefined,
            valueRating: valueRating > 0 ? valueRating : undefined,
            comment
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
                Alert.alert(
                    '¡Gracias!',
                    'Tu reseña ha sido enviada exitosamente.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            },
            onError: (error: any) => {
                const errorMessage = error.message || 'Error al enviar la reseña';

                // Si el error es porque ya calificó, tratarlo como informativo
                if (errorMessage.includes('Ya has calificado') || errorMessage.includes('duplicate')) {
                    Alert.alert(
                        'Ya calificado',
                        'Ya has enviado una reseña para esta visita anteriormente.',
                        [{ text: 'Entendido', onPress: () => router.back() }]
                    );
                } else {
                    Alert.alert('Error', errorMessage);
                }
            }
        });
    };

    const CategoryRating = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
        <View className="flex-row items-center justify-between mb-4">
            <Text className="text-slate-600 font-medium text-base">{label}</Text>
            <View className="flex-row gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onChange(star)}
                        className="p-1"
                    >
                        <Star
                            size={24}
                            color={star <= value ? '#eab308' : '#e2e8f0'}
                            fill={star <= value ? '#eab308' : 'transparent'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStars = () => {
        return (
            <View className="items-center mb-8">
                <Text className="text-slate-900 font-bold mb-2 text-center text-lg">Calificación General</Text>
                <View className="flex-row justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            className="p-1"
                        >
                            <Star
                                size={44}
                                color={star <= rating ? '#eab308' : '#cbd5e1'}
                                fill={star <= rating ? '#eab308' : 'transparent'}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-slate-100">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-slate-900">Calificar visita</Text>
                        <Text className="text-xs text-slate-500">{restaurantName}</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    <View className="py-6 items-center">
                        <Text className="text-base text-slate-500 text-center mb-1">
                            ¡Hola {user?.name?.split(' ')[0] || 'Usuario'}!
                        </Text>
                        <Text className="text-xl font-bold text-slate-900 text-center">Cuéntanos cómo fue todo</Text>
                    </View>

                    {renderStars()}

                    <View className="bg-slate-50 rounded-3xl p-6 mb-8">
                        <Text className="text-slate-900 font-bold mb-4 text-base">Detalles de la experiencia</Text>
                        <CategoryRating label="Comida" value={foodRating} onChange={setFoodRating} />
                        <CategoryRating label="Servicio" value={serviceRating} onChange={setServiceRating} />
                        <CategoryRating label="Ambiente" value={ambianceRating} onChange={setAmbianceRating} />
                        <CategoryRating label="Precio / Calidad" value={valueRating} onChange={setValueRating} />
                    </View>

                    <View className="mb-8">
                        <Text className="text-slate-900 font-bold mb-3 text-base">¿Algún comentario adicional?</Text>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            placeholder="Escribe aquí tu opinión sobre el lugar..."
                            value={comment}
                            onChangeText={setComment}
                            className="bg-slate-50 rounded-2xl p-4 text-slate-900 text-base min-h-[120px]"
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={createReview.isPending || rating === 0}
                        className={`h-16 rounded-2xl flex-row items-center justify-center mb-10 ${createReview.isPending || rating === 0 ? 'bg-slate-300' : 'bg-orange-600'
                            }`}
                    >
                        {createReview.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Send size={20} color="white" />
                                <Text className="text-white text-lg font-bold ml-2">Enviar Reseña</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
