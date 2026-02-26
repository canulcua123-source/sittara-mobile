import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Briefcase,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Gift,
    Heart,
    PartyPopper,
    Users
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInRight,
    FadeOutLeft,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { TableMap } from '../../../components/TableMap';
import { TimeSlotPicker } from '../../../components/TimeSlotPicker';
import { useAuth } from '../../../src/context/AuthContext';
import {
    useAvailableTables,
    useCreateReservation,
    useRestaurantDetails,
    useTimeSlots
} from '../../../src/hooks/useData';
import usePayment from '../../../src/hooks/usePayment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tipos de ocasiones especiales
const occasions = [
    { id: 'romantic', label: 'Cena romántica', icon: Heart, color: '#ec4899' },
    { id: 'birthday', label: 'Cumpleaños', icon: PartyPopper, color: '#f59e0b' },
    { id: 'business', label: 'Negocios', icon: Briefcase, color: '#3b82f6' },
    { id: 'other', label: 'Especial', icon: Gift, color: '#8b5cf6' },
];

type Step = 'date' | 'time' | 'table' | 'details' | 'confirm';

export default function ReservationFlow() {
    const { id, guests: initialGuests, repeatId } = useLocalSearchParams<{ id: string, guests: string, repeatId: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { data: restaurant, isLoading: loadingRestaurant } = useRestaurantDetails(id as string);
    const { initiatePayment, isLoading: paymentLoading, paymentIntentId } = usePayment();

    const [currentStep, setCurrentStep] = useState<Step>('date');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [guestCount, setGuestCount] = useState(initialGuests ? parseInt(initialGuests) : 2);
    const [selectedTables, setSelectedTables] = useState<any[]>([]);
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
    const [specialRequest, setSpecialRequest] = useState('');
    const [depositPaid, setDepositPaid] = useState(false);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);

    // Generar fechas para los próximos 30 días
    const availableDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push({
                full: date.toISOString().split('T')[0],
                day: date.getDate(),
                month: date.toLocaleDateString('es-MX', { month: 'short' }),
                weekday: date.toLocaleDateString('es-MX', { weekday: 'short' }),
            });
        }
        return dates;
    }, []);

    const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots(id as string, selectedDate, guestCount);
    const { data: availableTables, isLoading: loadingTables } = useAvailableTables(
        id as string,
        selectedDate,
        selectedTime || '',
        guestCount
    );
    const createReservation = useCreateReservation();

    // Encontrar el time slot seleccionado para ver si requiere depósito
    const selectedTimeSlot = useMemo(() => {
        if (!timeSlots || !selectedTime) return null;
        if (selectedTables.length === 0) {
            return null;
        }
        // Backend now returns objects with { time, available, requiresDeposit, depositAmount }
        const slot = timeSlots.find((s: any) => {
            const time = typeof s === 'string' ? s : s.time;
            return time === selectedTime;
        });
        return typeof slot === 'string' ? { time: slot, requiresDeposit: false, depositAmount: 0, isJoinedTable: false } : slot;
    }, [timeSlots, selectedTime]);

    // Deposit is determined per-slot by the backend (based on settings.depositRequired + depositHours + depositDays)
    const requiresDeposit = selectedTimeSlot?.requiresDeposit || false;
    const depositAmount = selectedTimeSlot?.depositAmount || restaurant?.settings?.depositAmount || 150;

    const totalSelectedCapacity = useMemo(() => {
        return selectedTables.reduce((sum, table) => sum + table.capacity, 0);
    }, [selectedTables]);

    const isCapacityMet = totalSelectedCapacity >= guestCount;
    const isJoinedRequired = selectedTimeSlot?.isJoinedTable || false;

    const steps: Step[] = ['date', 'time', 'table', 'details', 'confirm'];

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        } else {
            router.back();
        }
    };

    const handlePayDeposit = async () => {
        if (!user) {
            router.push('/auth');
            return;
        }

        if (selectedTables.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Selecciona una mesa',
                text2: 'Por favor selecciona al menos una mesa antes de pagar.',
            });
            return;
        }

        if (!isCapacityMet) {
            Toast.show({
                type: 'error',
                text1: 'Capacidad insuficiente',
                text2: `Has seleccionado capacidad para ${totalSelectedCapacity} personas, pero necesitas para ${guestCount}.`,
            });
            return;
        }

        const success = await initiatePayment(depositAmount, {
            restaurantId: id as string,
            tableId: selectedTables[0].id,
            tableIds: selectedTables.map(t => t.id),
            date: selectedDate,
            time: selectedTime!,
            guestCount,
            specialRequest,
        });

        if (success) {
            setDepositPaid(true);
            Toast.show({
                type: 'success',
                text1: 'Depósito pagado',
                text2: 'Ahora puedes confirmar tu reserva',
            });
        }
    };

    const handleConfirm = async () => {
        console.log('[RESERVE DEBUG] handleConfirm called');
        console.log('[RESERVE DEBUG] User:', user?.id);
        console.log('[RESERVE DEBUG] Selected tables:', selectedTables);
        console.log('[RESERVE DEBUG] Selected time:', selectedTime);

        if (!user) {
            console.log('[RESERVE DEBUG] No user, redirecting to auth');
            router.push('/auth');
            return;
        }

        if (selectedTables.length === 0 || !selectedTime) {
            console.log('[RESERVE DEBUG] Missing table or time');
            Toast.show({
                type: 'error',
                text1: 'Datos incompletos',
                text2: 'Por favor selecciona una hora y al menos una mesa.',
            });
            return;
        }

        if (!isCapacityMet) {
            Toast.show({
                type: 'error',
                text1: 'Capacidad insuficiente',
                text2: `Debes seleccionar mesas con capacidad total para al menos ${guestCount} personas.`,
            });
            return;
        }

        // Si requiere depósito y no se ha pagado, mostrar alerta
        if (requiresDeposit && !depositPaid) {
            console.log('[RESERVE DEBUG] Deposit required but not paid');
            Alert.alert(
                'Depósito requerido',
                `Esta reservación requiere un depósito de $${depositAmount} MXN para confirmar. ¿Deseas pagar ahora?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Pagar ahora', onPress: handlePayDeposit }
                ]
            );
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            console.log('[RESERVE DEBUG] Creating reservation with data:', {
                restaurantId: id,
                userId: user.id,
                tableIds: selectedTables.map(t => t.id),
                date: selectedDate,
                time: selectedTime,
                guestCount,
                occasion: selectedOccasion,
                specialRequest,
                depositPaid: depositPaid,
                depositAmount: requiresDeposit ? depositAmount : 0,
                paymentIntentId: paymentIntentId || undefined,
            });

            const result = await createReservation.mutateAsync({
                restaurantId: id,
                userId: user.id,
                tableId: selectedTables[0].id, // Legacy support
                tableIds: selectedTables.map(t => t.id),
                date: selectedDate,
                time: selectedTime,
                guestCount,
                occasion: selectedOccasion,
                specialRequest,
                depositPaid: depositPaid,
                depositAmount: requiresDeposit ? depositAmount : 0,
                paymentIntentId: paymentIntentId || undefined,
            });

            console.log('[RESERVE DEBUG] Reservation created:', result);

            Toast.show({
                type: 'success',
                text1: '¡Reserva confirmada!',
                text2: 'Te esperamos en Sittara',
            });

            // Pasar datos reales a la pantalla de éxito
            const successParams = new URLSearchParams({
                date: selectedDate,
                time: selectedTime,
                guests: guestCount.toString(),
                table: selectedTables.map(t => t.number).join(', '),
                restaurantName: restaurant?.name || 'Restaurante',
                qrCode: result?.qrCode || result?.qr_code || '',
                reservationId: result?.id || '',
            });
            router.replace(`/restaurant/${id}/success?${successParams.toString()}`);
        } catch (error: any) {
            console.error('[RESERVE DEBUG] Error creating reservation:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'No pudimos procesar tu reserva',
            });
        }
    };

    if (loadingRestaurant) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#1f7a66" />
            </View>
        );
    }

    const isProcessing = createReservation.isPending || paymentLoading;

    const canProceed = () => {
        switch (currentStep) {
            case 'date': return !!selectedDate;
            case 'time': return !!selectedTime;
            case 'table': return selectedTables.length > 0 && isCapacityMet;
            case 'details': return true;
            case 'confirm': return !requiresDeposit || depositPaid;
            default: return false;
        }
    };

    const handleTableSelect = (table: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setSelectedTables(prev => {
            const isAlreadySelected = prev.find(t => t.id === table.id);
            if (isAlreadySelected) {
                // Remove from selection
                return prev.filter(t => t.id !== table.id);
            } else {
                // If not joined table, usually we just want one. 
                // But for "Joined Tables" slots, we allow multiple.
                if (!isJoinedRequired) {
                    return [table];
                }
                return [...prev, table];
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Custom Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
                <TouchableOpacity onPress={handleBack} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
                    <ArrowLeft size={20} color="#64748b" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Nueva Reserva</Text>
                <View className="w-10 h-10" />
            </View>

            {/* Progress Tracker - 5 pasos */}
            <View className="flex-row px-8 py-6 justify-between relative">
                <View className="absolute top-1/2 left-8 right-8 h-[2px] bg-slate-100" />
                {steps.map((step, i) => {
                    const isActive = currentStep === step;
                    const isDone = steps.indexOf(currentStep) > i;
                    return (
                        <View key={step} className="items-center z-10">
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${isActive ? 'bg-orange-600' : isDone ? 'bg-green-500' : 'bg-slate-200'}`}>
                                {isDone ? (
                                    <CheckCircle2 size={16} color="white" />
                                ) : (
                                    <Text className={`font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{i + 1}</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                {currentStep === 'date' && (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="space-y-6">
                        <View className="bg-orange-50 p-6 rounded-3xl mb-6">
                            <Text className="text-orange-900 font-bold text-lg mb-2">Paso 1: ¿Cuándo vienes?</Text>
                            <Text className="text-orange-700/70">Selecciona el día de tu visita para ver disponibilidad.</Text>
                        </View>

                        {/* Quick Date Selector (Horizontal) */}
                        <View className="mb-8">
                            <Text className="text-slate-900 font-bold mb-4">Días próximos</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + offset);
                                    const dateStr = date.toISOString().split('T')[0];
                                    const isSelected = selectedDate === dateStr;
                                    return (
                                        <TouchableOpacity
                                            key={dateStr}
                                            onPress={() => setSelectedDate(dateStr)}
                                            className={`w-20 h-24 rounded-2xl items-center justify-center mr-3 border ${isSelected ? 'bg-orange-600 border-orange-600' : 'bg-white border-slate-100'}`}
                                        >
                                            <Text className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                                {date.toLocaleDateString('es-MX', { weekday: 'short' })}
                                            </Text>
                                            <Text className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                {date.getDate()}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsCalendarVisible(true)}
                            className="flex-row items-center justify-center p-4 border border-slate-100 rounded-2xl"
                        >
                            <CalendarDays size={20} color="#1f7a66" />
                            <Text className="ml-2 text-slate-600 font-semibold">Ver calendario completo</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {currentStep === 'time' && (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="space-y-6">
                        <View className="bg-slate-900 p-6 rounded-3xl mb-6">
                            <Text className="text-white font-bold text-lg mb-2">Paso 2: Hora de llegada</Text>
                            <Text className="text-white/60">Los mejores momentos empiezan puntualmente.</Text>
                        </View>

                        {loadingSlots ? (
                            <ActivityIndicator color="#1f7a66" className="mt-10" />
                        ) : (
                            <TimeSlotPicker
                                timeSlots={timeSlots || []}
                                selectedTime={selectedTime}
                                onSelectTime={setSelectedTime}
                                guestCount={guestCount}
                                restaurantPhone={restaurant?.phone}
                            />
                        )}

                        {/* Guests Selector */}
                        <View className="mt-6">
                            <Text className="text-slate-900 font-bold mb-4">Número de comensales</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <TouchableOpacity
                                        key={num}
                                        onPress={() => setGuestCount(num)}
                                        className={`w-12 h-12 rounded-2xl items-center justify-center ${guestCount === num ? 'bg-orange-600' : 'bg-slate-50'}`}
                                    >
                                        <Text className={`font-bold ${guestCount === num ? 'text-white' : 'text-slate-600'}`}>{num}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                )}

                {currentStep === 'table' && (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                        <View className="bg-blue-50 p-6 rounded-3xl mb-6">
                            <Text className="text-blue-900 font-bold text-lg mb-2">Paso 3: Elige tu mesa</Text>
                            <Text className="text-blue-700/70">Las mesas verdes están disponibles. Toca para seleccionar.</Text>
                        </View>

                        {loadingTables ? (
                            <ActivityIndicator color="#1f7a66" className="mt-10" />
                        ) : (
                            <TableMap
                                tables={availableTables || []}
                                selectedTableIds={selectedTables.map(t => t.id)}
                                onTableSelect={handleTableSelect}
                            />
                        )}
                    </Animated.View>
                )}

                {currentStep === 'details' && (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="space-y-6">
                        <View className="bg-purple-50 p-6 rounded-3xl mb-6">
                            <Text className="text-purple-900 font-bold text-lg mb-2">Paso 4: Detalles</Text>
                            <Text className="text-purple-700/70">¿Es una ocasión especial? Cuéntanos más.</Text>
                        </View>

                        {/* Occasion Selector */}
                        <View className="mb-6">
                            <Text className="text-slate-900 font-bold mb-4">¿Es una ocasión especial? (opcional)</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {occasions.map((occasion) => {
                                    const isSelected = selectedOccasion === occasion.id;
                                    const IconComponent = occasion.icon;
                                    return (
                                        <TouchableOpacity
                                            key={occasion.id}
                                            onPress={() => setSelectedOccasion(isSelected ? null : occasion.id)}
                                            className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${isSelected ? 'border-orange-600 bg-orange-50' : 'border-slate-100 bg-white'}`}
                                        >
                                            <IconComponent size={20} color={isSelected ? '#1f7a66' : occasion.color} />
                                            <Text className={`ml-2 font-semibold ${isSelected ? 'text-orange-600' : 'text-slate-600'}`}>
                                                {occasion.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Special Request */}
                        <View>
                            <Text className="text-slate-900 font-bold mb-4">Notas especiales (opcional)</Text>
                            <TextInput
                                placeholder="Alergias, silla para bebé, cumpleaños sorpresa..."
                                multiline
                                numberOfLines={4}
                                className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-900 h-28"
                                style={{ textAlignVertical: 'top' }}
                                value={specialRequest}
                                onChangeText={setSpecialRequest}
                            />
                        </View>
                    </Animated.View>
                )}

                {currentStep === 'confirm' && (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="space-y-6">
                        <View className="bg-green-50 p-6 rounded-3xl mb-6">
                            <Text className="text-green-900 font-bold text-lg mb-2">Paso 5: Confirmar reserva</Text>
                            <Text className="text-green-700/70">Revisa los detalles y confirma tu mesa.</Text>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                                <Users size={18} color="#64748b" />
                            </View>
                            <View>
                                <Text className="text-slate-400 text-xs uppercase font-bold tracking-wider">Mesa Seleccionada</Text>
                                <Text className="text-slate-900 font-bold">
                                    {selectedTables.length > 0 ? `Mesa(s) ${selectedTables.map(t => t.number).join(', ')}` : 'No seleccionada'}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-slate-50 p-6 rounded-3xl">
                            <Text className="text-slate-900 font-bold text-lg mb-6">Resumen</Text>
                            <View className="space-y-4">
                                <View className="flex-row justify-between">
                                    <Text className="text-slate-500">Restaurante</Text>
                                    <Text className="text-slate-900 font-bold">{restaurant?.name}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-slate-500">Fecha</Text>
                                    <Text className="text-slate-900 font-bold">{selectedDate}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-slate-500">Hora</Text>
                                    <Text className="text-slate-900 font-bold">{selectedTime}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-slate-500">Comensales</Text>
                                    <Text className="text-slate-900 font-bold">{guestCount} personas</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-slate-500">Mesa</Text>
                                    <Text className="text-slate-900 font-bold">
                                        {selectedTables.length > 0 ? `Mesa(s) ${selectedTables.map(t => t.number).join(', ')}` : 'No seleccionada'}
                                    </Text>
                                </View>
                                {selectedOccasion && (
                                    <View className="flex-row justify-between">
                                        <Text className="text-slate-500">Ocasión</Text>
                                        <Text className="text-slate-900 font-bold">
                                            {occasions.find(o => o.id === selectedOccasion)?.label}
                                        </Text>
                                    </View>
                                )}
                                {specialRequest && (
                                    <View className="pt-2 border-t border-slate-200">
                                        <Text className="text-slate-500 mb-1">Notas:</Text>
                                        <Text className="text-slate-700">{specialRequest}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Depósito requerido */}
                        {requiresDeposit && (
                            <View className={`p-5 rounded-3xl border-2 ${depositPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <View className="flex-row items-center mb-3">
                                    {depositPaid ? (
                                        <CheckCircle2 size={24} color="#16a34a" />
                                    ) : (
                                        <CreditCard size={24} color="#d97706" />
                                    )}
                                    <Text className={`ml-3 font-bold text-lg ${depositPaid ? 'text-green-800' : 'text-amber-800'}`}>
                                        {depositPaid ? 'Depósito pagado' : 'Depósito requerido'}
                                    </Text>
                                </View>
                                <Text className={`mb-4 ${depositPaid ? 'text-green-700' : 'text-amber-700'}`}>
                                    {depositPaid
                                        ? `Has pagado $${depositAmount} MXN como depósito. Este monto se descontará de tu cuenta.`
                                        : `Esta reserva requiere un depósito de $${depositAmount} MXN que se descontará de tu consumo final.`
                                    }
                                </Text>
                                {!depositPaid && (
                                    <TouchableOpacity
                                        onPress={handlePayDeposit}
                                        disabled={paymentLoading}
                                        className="bg-amber-600 py-4 rounded-2xl items-center flex-row justify-center"
                                    >
                                        {paymentLoading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <>
                                                <CreditCard size={20} color="white" />
                                                <Text className="text-white font-bold text-lg ml-2">
                                                    Pagar ${depositAmount} MXN
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </Animated.View>
                )}

                <View className="h-20" />
            </ScrollView>

            {/* Footer Actions */}
            <View className="px-6 py-6 border-t border-slate-50">
                <TouchableOpacity
                    onPress={currentStep === 'confirm' ? handleConfirm : handleNext}
                    disabled={!canProceed() || isProcessing}
                    className={`h-16 rounded-2xl items-center justify-center flex-row ${canProceed() ? 'bg-orange-600' : 'bg-slate-200'}`}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className={`text-lg font-bold mr-2 ${canProceed() ? 'text-white' : 'text-slate-400'}`}>
                                {currentStep === 'confirm'
                                    ? (requiresDeposit && !depositPaid ? 'Pagar para confirmar' : 'Confirmar Reserva')
                                    : 'Continuar'}
                            </Text>
                            <ChevronRight size={20} color={canProceed() ? "white" : "#cbd5e1"} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Calendar Modal */}
            <Modal
                visible={isCalendarVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsCalendarVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-12 max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-slate-900">Selecciona una fecha</Text>
                            <TouchableOpacity
                                onPress={() => setIsCalendarVisible(false)}
                                className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
                            >
                                <Text className="text-slate-400 font-bold">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="flex-row flex-wrap gap-4">
                                {availableDates.map((item) => {
                                    const isSelected = selectedDate === item.full;
                                    return (
                                        <TouchableOpacity
                                            key={item.full}
                                            onPress={() => {
                                                setSelectedDate(item.full);
                                                setIsCalendarVisible(false);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                            className={`w-[22%] py-4 rounded-2xl items-center justify-center border ${isSelected
                                                ? 'bg-orange-600 border-orange-600'
                                                : 'bg-white border-slate-100'
                                                }`}
                                        >
                                            <Text className={`text-[10px] uppercase font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                                {item.weekday}
                                            </Text>
                                            <Text className={`text-xl font-bold my-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                {item.day}
                                            </Text>
                                            <Text className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                                {item.month}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
