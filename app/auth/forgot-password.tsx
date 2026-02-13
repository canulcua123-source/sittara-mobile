import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { ArrowLeft, Mail, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import api from '../../src/services/api';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

type Step = 'email' | 'sent' | 'error';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<Step>('email');
    const [errorMessage, setErrorMessage] = useState('');

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSendResetLink = async () => {
        if (!isValidEmail(email)) {
            Toast.show({
                type: 'error',
                text1: 'Email inválido',
                text2: 'Por favor ingresa un email válido',
            });
            return;
        }

        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const response = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });

            if (response.data.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setStep('sent');
            } else {
                throw new Error(response.data.error || 'Error al enviar');
            }
        } catch (error: any) {
            // Aunque el email no exista, mostramos éxito por seguridad
            // Para evitar enumeration attacks
            if (error?.response?.status === 404) {
                // El email no existe, pero no revelamos eso
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setStep('sent');
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setErrorMessage(error?.message || 'No pudimos procesar tu solicitud');
                setStep('error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTryAgain = () => {
        setStep('email');
        setErrorMessage('');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
                    >
                        <ArrowLeft size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 px-8 pt-4">
                    {step === 'email' && (
                        <Animated.View entering={FadeIn} className="flex-1">
                            <Text className="text-3xl font-bold text-slate-900 mb-3">
                                ¿Olvidaste tu contraseña?
                            </Text>
                            <Text className="text-slate-500 text-lg mb-8">
                                No te preocupes, te enviaremos un enlace para restablecerla.
                            </Text>

                            {/* Email Input */}
                            <View className="mb-6">
                                <Text className="text-slate-900 font-bold mb-2 ml-1">
                                    Correo electrónico
                                </Text>
                                <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4">
                                    <Mail size={20} color="#94a3b8" />
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="tu@email.com"
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 py-4 px-3 text-slate-900 text-base"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleSendResetLink}
                                disabled={!email || isLoading}
                                className={`h-14 rounded-2xl items-center justify-center ${email && isValidEmail(email) ? 'bg-orange-600' : 'bg-slate-200'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className={`font-bold text-lg ${email && isValidEmail(email) ? 'text-white' : 'text-slate-400'}`}>
                                        Enviar enlace de recuperación
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Back to login */}
                            <TouchableOpacity
                                onPress={() => router.replace('/auth')}
                                className="mt-6"
                            >
                                <Text className="text-center text-slate-500">
                                    ¿Recuerdas tu contraseña? <Text className="text-orange-600 font-bold">Iniciar sesión</Text>
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {step === 'sent' && (
                        <Animated.View entering={FadeInUp} className="flex-1 items-center justify-center -mt-20">
                            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                                <CheckCircle2 size={48} color="#16a34a" />
                            </View>
                            <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
                                ¡Correo enviado!
                            </Text>
                            <Text className="text-slate-500 text-lg text-center mb-8 px-4">
                                Si el email <Text className="font-bold text-slate-700">{email}</Text> está registrado, recibirás un enlace para restablecer tu contraseña.
                            </Text>
                            <Text className="text-slate-400 text-sm text-center mb-8 px-8">
                                Revisa también tu carpeta de spam si no lo encuentras en tu bandeja de entrada.
                            </Text>

                            <TouchableOpacity
                                onPress={() => router.replace('/auth')}
                                className="bg-orange-600 h-14 px-10 rounded-2xl items-center justify-center"
                            >
                                <Text className="text-white font-bold text-lg">
                                    Volver a iniciar sesión
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {step === 'error' && (
                        <Animated.View entering={FadeInUp} className="flex-1 items-center justify-center -mt-20">
                            <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
                                <AlertTriangle size={48} color="#dc2626" />
                            </View>
                            <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
                                Algo salió mal
                            </Text>
                            <Text className="text-slate-500 text-lg text-center mb-8 px-4">
                                {errorMessage}
                            </Text>

                            <TouchableOpacity
                                onPress={handleTryAgain}
                                className="bg-orange-600 h-14 px-10 rounded-2xl items-center justify-center"
                            >
                                <Text className="text-white font-bold text-lg">
                                    Intentar de nuevo
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
