import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Plus, Trash2, Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentMethod {
    id: string;
    type: 'visa' | 'mastercard' | 'amex';
    lastFour: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
    cardholderName: string;
}

const STORAGE_KEY = '@sittara_payment_methods';

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newCard, setNewCard] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: '',
    });

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setPaymentMethods(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const savePaymentMethods = async (methods: PaymentMethod[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
            setPaymentMethods(methods);
        } catch (error) {
            console.error('Error saving payment methods:', error);
        }
    };

    const detectCardType = (number: string): 'visa' | 'mastercard' | 'amex' => {
        const cleaned = number.replace(/\s/g, '');
        if (cleaned.startsWith('4')) return 'visa';
        if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
        if (cleaned.startsWith('3')) return 'amex';
        return 'visa';
    };

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    const handleAddCard = async () => {
        const cleanNumber = newCard.number.replace(/\s/g, '');

        if (cleanNumber.length < 15) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Número de tarjeta inválido' });
            return;
        }
        if (newCard.expiry.length < 5) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Fecha de expiración inválida' });
            return;
        }
        if (newCard.cvv.length < 3) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'CVV inválido' });
            return;
        }
        if (!newCard.name.trim()) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa el nombre del titular' });
            return;
        }

        const [month, year] = newCard.expiry.split('/');
        const newMethod: PaymentMethod = {
            id: Date.now().toString(),
            type: detectCardType(cleanNumber),
            lastFour: cleanNumber.slice(-4),
            expiryMonth: month,
            expiryYear: year,
            isDefault: paymentMethods.length === 0,
            cardholderName: newCard.name.trim(),
        };

        await savePaymentMethods([...paymentMethods, newMethod]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: 'success', text1: 'Tarjeta agregada', text2: 'Tu tarjeta ha sido guardada' });
        setNewCard({ number: '', expiry: '', cvv: '', name: '' });
        setIsAdding(false);
    };

    const handleDeleteCard = (id: string) => {
        Alert.alert(
            'Eliminar tarjeta',
            '¿Estás seguro de eliminar esta tarjeta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const updated = paymentMethods.filter(m => m.id !== id);
                        if (updated.length > 0 && !updated.some(m => m.isDefault)) {
                            updated[0].isDefault = true;
                        }
                        await savePaymentMethods(updated);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Toast.show({ type: 'success', text1: 'Tarjeta eliminada' });
                    }
                }
            ]
        );
    };

    const handleSetDefault = async (id: string) => {
        const updated = paymentMethods.map(m => ({
            ...m,
            isDefault: m.id === id
        }));
        await savePaymentMethods(updated);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Toast.show({ type: 'success', text1: 'Tarjeta principal actualizada' });
    };

    const getCardIcon = (type: string) => {
        const colors: Record<string, string> = {
            visa: '#1A1F71',
            mastercard: '#EB001B',
            amex: '#006FCF',
        };
        return <CreditCard size={24} color={colors[type] || '#64748b'} />;
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#1f7a66" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-6 py-4 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Métodos de Pago</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                {/* Saved Cards */}
                {paymentMethods.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                            Tarjetas Guardadas
                        </Text>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                onPress={() => handleSetDefault(method.id)}
                                className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center border-2 ${method.isDefault ? 'border-orange-500' : 'border-transparent'
                                    }`}
                            >
                                <View className="w-12 h-12 bg-slate-50 rounded-xl items-center justify-center">
                                    {getCardIcon(method.type)}
                                </View>
                                <View className="flex-1 ml-4">
                                    <Text className="text-base font-semibold text-slate-900">
                                        •••• •••• •••• {method.lastFour}
                                    </Text>
                                    <Text className="text-sm text-slate-500">
                                        {method.cardholderName} · Exp {method.expiryMonth}/{method.expiryYear}
                                    </Text>
                                </View>
                                {method.isDefault && (
                                    <View className="bg-orange-100 px-2 py-1 rounded-full mr-2">
                                        <Text className="text-xs text-orange-600 font-medium">Principal</Text>
                                    </View>
                                )}
                                <TouchableOpacity onPress={() => handleDeleteCard(method.id)}>
                                    <Trash2 size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Add Card Section */}
                {isAdding ? (
                    <View className="bg-white rounded-2xl p-6">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Agregar Tarjeta</Text>

                        <View className="mb-4">
                            <Text className="text-sm text-slate-500 mb-2">Número de tarjeta</Text>
                            <TextInput
                                className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                placeholder="0000 0000 0000 0000"
                                keyboardType="numeric"
                                maxLength={19}
                                value={newCard.number}
                                onChangeText={(t) => setNewCard({ ...newCard, number: formatCardNumber(t) })}
                            />
                        </View>

                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="text-sm text-slate-500 mb-2">Expiración</Text>
                                <TextInput
                                    className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                    placeholder="MM/YY"
                                    keyboardType="numeric"
                                    maxLength={5}
                                    value={newCard.expiry}
                                    onChangeText={(t) => setNewCard({ ...newCard, expiry: formatExpiry(t) })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-slate-500 mb-2">CVV</Text>
                                <TextInput
                                    className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                    placeholder="123"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                    value={newCard.cvv}
                                    onChangeText={(t) => setNewCard({ ...newCard, cvv: t.replace(/\D/g, '') })}
                                />
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm text-slate-500 mb-2">Nombre del titular</Text>
                            <TextInput
                                className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                placeholder="Como aparece en la tarjeta"
                                autoCapitalize="characters"
                                value={newCard.name}
                                onChangeText={(t) => setNewCard({ ...newCard, name: t })}
                            />
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setIsAdding(false)}
                                className="flex-1 py-4 rounded-xl bg-slate-100"
                            >
                                <Text className="text-center font-semibold text-slate-600">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddCard}
                                className="flex-1 py-4 rounded-xl bg-orange-600"
                            >
                                <Text className="text-center font-semibold text-white">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setIsAdding(true)}
                        className="bg-white rounded-2xl p-4 flex-row items-center border-2 border-dashed border-slate-200"
                    >
                        <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center">
                            <Plus size={24} color="#1f7a66" />
                        </View>
                        <View className="ml-4">
                            <Text className="text-base font-semibold text-slate-900">Agregar tarjeta</Text>
                            <Text className="text-sm text-slate-500">Visa, Mastercard o AMEX</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Info */}
                <View className="mt-6 p-4 bg-blue-50 rounded-2xl">
                    <Text className="text-sm text-blue-800">
                        🔒 Tus datos de pago están seguros. No almacenamos los números completos de tarjeta.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
