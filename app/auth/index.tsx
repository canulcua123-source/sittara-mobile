import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    ImageBackground,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Utensils, User, Phone } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Haptics from 'expo-haptics';

// Make sure to complete auth session on web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
// Note: You need to set up Google OAuth in Google Cloud Console
// and add your client IDs in your app.json or here
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';

export default function LoginScreen() {
    const router = useRouter();
    const { login, register } = useAuth();

    const [isLoginTab, setIsLoginTab] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Google Auth
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_CLIENT_ID_WEB,
        iosClientId: GOOGLE_CLIENT_ID_IOS,
        androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            handleGoogleAuthSuccess(response.authentication?.accessToken);
        } else if (response?.type === 'error') {
            setIsGoogleLoading(false);
            Toast.show({
                type: 'error',
                text1: 'Error de autenticación',
                text2: 'No pudimos conectar con Google',
            });
        }
    }, [response]);

    const handleGoogleAuthSuccess = async (accessToken: string | undefined) => {
        if (!accessToken) {
            setIsGoogleLoading(false);
            return;
        }

        try {
            // Fetch user info from Google
            const userInfoResponse = await fetch(
                'https://www.googleapis.com/userinfo/v2/me',
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const userInfo = await userInfoResponse.json();

            // TODO: Call your backend to authenticate/register with Google
            // For now, show success message
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: `¡Hola ${userInfo.given_name}!`,
                text2: 'Conectado con Google exitosamente',
            });

            // Mock: You would call your backend here
            // const result = await api.post('/auth/google', { accessToken, userInfo });
            // if (result.success) router.replace('/(tabs)');

            setIsGoogleLoading(false);
        } catch (error) {
            setIsGoogleLoading(false);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No pudimos obtener tu información de Google',
            });
        }
    };

    const handleGoogleLogin = async () => {
        if (!GOOGLE_CLIENT_ID_WEB && !GOOGLE_CLIENT_ID_IOS && !GOOGLE_CLIENT_ID_ANDROID) {
            Toast.show({
                type: 'info',
                text1: 'Configuración pendiente',
                text2: 'Google OAuth requiere configuración de cliente ID',
            });
            return;
        }
        setIsGoogleLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await promptAsync();
    };

    const handleFacebookLogin = async () => {
        setIsFacebookLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Facebook requires more setup with Facebook Developer Console
        // For now, show info message
        Toast.show({
            type: 'info',
            text1: 'Próximamente',
            text2: 'Facebook login estará disponible pronto',
        });
        setIsFacebookLoading(false);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Campos incompletos',
                text2: 'Por favor ingresa tu correo y contraseña',
            });
            return;
        }

        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: '¡Bienvenido!',
                text2: 'Has iniciado sesión correctamente',
            });
            router.replace('/(tabs)');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: result.error || 'Credenciales incorrectas',
            });
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !name || !phone) {
            Toast.show({
                type: 'error',
                text1: 'Campos incompletos',
                text2: 'Por favor llena todos los datos requeridos',
            });
            return;
        }

        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const result = await register(name, email, password, phone);
        setIsLoading(false);

        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({
                type: 'success',
                text1: '¡Cuenta creada!',
                text2: 'Bienvenido a Sittara. Ya puedes empezar a reservar.',
            });
            router.replace('/(tabs)');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: result.error || 'No se pudo crear la cuenta',
            });
        }
    };

    const handleForgotPassword = () => {
        router.push('/auth/forgot-password' as Href);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Header Image Section */}
                    <View className="h-60 bg-black relative">
                        <ImageBackground
                            source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' }}
                            className="w-full h-full opacity-60"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/40" />

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="absolute top-12 left-6 w-10 h-10 rounded-full bg-black/20 items-center justify-center border border-white/20"
                        >
                            <ArrowLeft size={20} color="white" />
                        </TouchableOpacity>

                        <View className="absolute bottom-6 left-6">
                            <View className="flex-row items-center gap-2 mb-2">
                                <View className="w-8 h-8 bg-orange-600 rounded-lg items-center justify-center">
                                    <Utensils size={18} color="white" />
                                </View>
                                <Text className="text-2xl font-bold text-white">Sittara</Text>
                            </View>
                            <Text className="text-white/80 text-lg">Reserva los mejores lugares</Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View className="flex-1 px-6 pt-8 -mt-6 bg-white rounded-t-3xl">
                        {/* Tabs */}
                        <View className="flex-row bg-slate-100 p-1 rounded-xl mb-8">
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setIsLoginTab(true)}
                                className={`flex-1 py-3 rounded-lg items-center ${isLoginTab ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`font-semibold ${isLoginTab ? 'text-orange-600' : 'text-slate-500'}`}>Ingresar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setIsLoginTab(false)}
                                className={`flex-1 py-3 rounded-lg items-center ${!isLoginTab ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`font-semibold ${!isLoginTab ? 'text-orange-600' : 'text-slate-500'}`}>Registro</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mb-6">
                            <Text className="text-2xl font-bold text-slate-900 mb-2">
                                {isLoginTab ? 'Hola de nuevo' : 'Crea tu cuenta'}
                            </Text>
                            <Text className="text-slate-500">
                                {isLoginTab ? 'Ingresa tus datos para continuar' : 'Regístrate para reservar en los mejores restaurantes'}
                            </Text>
                        </View>

                        {/* Form Fields */}
                        <View className="space-y-4">
                            {!isLoginTab && (
                                <View className="mb-4">
                                    <Text className="text-slate-700 font-medium mb-2">Nombre completo</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-12">
                                        <User size={20} color="#64748b" />
                                        <TextInput
                                            placeholder="Juan Pérez"
                                            value={name}
                                            onChangeText={setName}
                                            className="flex-1 ml-3 text-slate-900 h-full"
                                        />
                                    </View>
                                </View>
                            )}

                            <View className="mb-4">
                                <Text className="text-slate-700 font-medium mb-2">Email</Text>
                                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-12">
                                    <Mail size={20} color="#64748b" />
                                    <TextInput
                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="flex-1 ml-3 text-slate-900 h-full"
                                    />
                                </View>
                            </View>

                            {!isLoginTab && (
                                <View className="mb-4">
                                    <Text className="text-slate-700 font-medium mb-2">Teléfono</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-12">
                                        <Phone size={20} color="#64748b" />
                                        <TextInput
                                            placeholder="+52 999 000 0000"
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                            className="flex-1 ml-3 text-slate-900 h-full"
                                        />
                                    </View>
                                </View>
                            )}

                            <View className="mb-6">
                                <Text className="text-slate-700 font-medium mb-2">Contraseña</Text>
                                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-12">
                                    <Lock size={20} color="#64748b" />
                                    <TextInput
                                        placeholder="••••••••"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        className="flex-1 ml-3 text-slate-900 h-full"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {isLoginTab && (
                                <TouchableOpacity onPress={handleForgotPassword} className="self-end mb-8">
                                    <Text className="text-orange-600 font-semibold">¿Olvidaste tu contraseña?</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={isLoginTab ? handleLogin : handleRegister}
                                disabled={isLoading}
                                activeOpacity={0.8}
                                className="bg-orange-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-orange-600/30"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">
                                        {isLoginTab ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Social Login */}
                        <View className="mt-8">
                            <View className="flex-row items-center mb-6">
                                <View className="flex-1 h-[1px] bg-slate-200" />
                                <Text className="px-4 text-slate-400 text-sm">O continúa con</Text>
                                <View className="flex-1 h-[1px] bg-slate-200" />
                            </View>

                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={handleGoogleLogin}
                                    disabled={isGoogleLoading}
                                    className="flex-1 h-12 border border-slate-200 rounded-xl items-center justify-center flex-row"
                                >
                                    {isGoogleLoading ? (
                                        <ActivityIndicator size="small" color="#64748b" />
                                    ) : (
                                        <>
                                            <Text className="text-lg mr-2">🌐</Text>
                                            <Text className="font-semibold text-slate-700">Google</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleFacebookLogin}
                                    disabled={isFacebookLoading}
                                    className="flex-1 h-12 border border-slate-200 rounded-xl items-center justify-center flex-row"
                                >
                                    {isFacebookLoading ? (
                                        <ActivityIndicator size="small" color="#64748b" />
                                    ) : (
                                        <>
                                            <Text className="text-lg mr-2">📘</Text>
                                            <Text className="font-semibold text-slate-700">Facebook</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="h-10" />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
