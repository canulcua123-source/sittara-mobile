import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    ActionSheetIOS
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Camera,
    Check,
    X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import api from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_STORAGE_KEY = '@sittara_user_avatar';

export default function EditProfileScreen() {
    const { user, updateUser } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState(user?.name || user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSavedAvatar();
    }, []);

    useEffect(() => {
        // Detectar cambios
        const nameChanged = fullName !== (user?.name || user?.full_name || '');
        const phoneChanged = phone !== (user?.phone || '');
        setHasChanges(nameChanged || phoneChanged);
    }, [fullName, phone, user]);

    const loadSavedAvatar = async () => {
        try {
            const savedAvatar = await AsyncStorage.getItem(`${AVATAR_STORAGE_KEY}_${user?.id}`);
            if (savedAvatar) {
                setAvatarUri(savedAvatar);
            }
        } catch (error) {
            console.error('Error loading avatar:', error);
        }
    };

    const handlePickImage = async () => {
        const options = ['Tomar foto', 'Elegir de galería', 'Cancelar'];

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: 2,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 0) {
                        await takePhoto();
                    } else if (buttonIndex === 1) {
                        await pickFromGallery();
                    }
                }
            );
        } else {
            Alert.alert('Cambiar foto', 'Elige una opción', [
                { text: 'Tomar foto', onPress: takePhoto },
                { text: 'Elegir de galería', onPress: pickFromGallery },
                { text: 'Cancelar', style: 'cancel' },
            ]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Permiso denegado',
                text2: 'Necesitamos acceso a la cámara',
            });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await saveAvatar(result.assets[0].uri);
        }
    };

    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Permiso denegado',
                text2: 'Necesitamos acceso a tu galería',
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await saveAvatar(result.assets[0].uri);
        }
    };

    const saveAvatar = async (uri: string) => {
        try {
            // 1. Guardar localmente para persistencia rápida en este dispositivo
            await AsyncStorage.setItem(`${AVATAR_STORAGE_KEY}_${user?.id}`, uri);
            setAvatarUri(uri);

            // 2. Preparar FormData para la subida al servidor
            const formData = new FormData();
            const fileName = uri.split('/').pop() || 'avatar.jpg';
            const fileExt = fileName.split('.').pop() || 'jpg';

            // @ts-ignore - FormData expects a specific object structure in React Native
            formData.append('image', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: fileName,
                type: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
            });

            // 3. Subir al backend
            const response = await api.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success && response.data.data.url) {
                const newAvatarUrl = response.data.data.url;

                // 4. Actualizar el contexto global para reflejar el cambio en toda la app
                if (updateUser) {
                    updateUser({
                        avatar: newAvatarUrl,
                        avatar_url: newAvatarUrl
                    });
                }

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Toast.show({
                    type: 'success',
                    text1: 'Foto sincronizada',
                    text2: 'Tu foto de perfil ha sido respaldada en la nube',
                });
            } else {
                throw new Error(response.data.error || 'Fallo en la respuesta del servidor');
            }
        } catch (error: any) {
            console.error('Error saving/syncing avatar:', error);
            Toast.show({
                type: 'error',
                text1: 'Error parcial',
                text2: 'La foto se guardó localmente pero no pudo sincronizarse',
            });
        }
    };

    const handleSave = async () => {
        if (!hasChanges) return;

        setIsLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            // El endpoint correcto es /auth/profile (requiere token en headers)
            const response = await api.patch('/auth/profile', {
                name: fullName.trim(),
                phone: phone.trim(),
            });

            if (response.data.success) {
                // Actualizar el contexto con los nuevos datos devueltos por la API
                if (updateUser && response.data.data) {
                    updateUser({
                        name: response.data.data.name,
                        phone: response.data.data.phone,
                    });
                }

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Toast.show({
                    type: 'success',
                    text1: 'Perfil actualizado',
                    text2: 'Tus datos han sido guardados correctamente',
                });
                router.back();
            } else {
                throw new Error(response.data.error || 'Error al actualizar');
            }
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'No pudimos actualizar tu perfil',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            Alert.alert(
                'Descartar cambios',
                '¿Estás seguro de que quieres salir sin guardar?',
                [
                    { text: 'Seguir editando', style: 'cancel' },
                    { text: 'Descartar', style: 'destructive', onPress: () => router.back() }
                ]
            );
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
                    <TouchableOpacity
                        onPress={handleCancel}
                        className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
                    >
                        <ArrowLeft size={20} color="#64748b" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900">Editar Perfil</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!hasChanges || isLoading}
                        className={`w-10 h-10 rounded-full items-center justify-center ${hasChanges ? 'bg-orange-600' : 'bg-slate-100'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Check size={20} color={hasChanges ? "white" : "#cbd5e1"} />
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <View className="items-center mb-8">
                        <View className="relative">
                            <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                                {avatarUri ? (
                                    <Image
                                        source={{ uri: avatarUri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text className="text-4xl font-bold text-slate-400">
                                        {(fullName || user?.email || 'U').charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 w-10 h-10 bg-orange-600 rounded-full items-center justify-center border-3 border-white shadow-sm"
                                onPress={handlePickImage}
                            >
                                <Camera size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-slate-400 text-sm mt-3">Toca para cambiar foto</Text>
                    </View>

                    {/* Form Fields */}
                    <View className="space-y-6">
                        {/* Full Name */}
                        <View>
                            <Text className="text-slate-900 font-bold mb-2 ml-1">Nombre completo</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4">
                                <User size={20} color="#94a3b8" />
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Tu nombre completo"
                                    placeholderTextColor="#94a3b8"
                                    className="flex-1 py-4 px-3 text-slate-900 text-base"
                                    autoCapitalize="words"
                                />
                                {fullName !== (user?.name || user?.full_name || '') && fullName.length > 0 && (
                                    <TouchableOpacity onPress={() => setFullName(user?.name || user?.full_name || '')}>
                                        <X size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Email (Read-only) */}
                        <View>
                            <Text className="text-slate-900 font-bold mb-2 ml-1">Correo electrónico</Text>
                            <View className="flex-row items-center bg-slate-100 border border-slate-100 rounded-2xl px-4 opacity-60">
                                <Mail size={20} color="#94a3b8" />
                                <TextInput
                                    value={user?.email || ''}
                                    editable={false}
                                    className="flex-1 py-4 px-3 text-slate-500 text-base"
                                />
                            </View>
                            <Text className="text-slate-400 text-xs mt-1 ml-1">
                                El email no puede ser modificado
                            </Text>
                        </View>

                        {/* Phone */}
                        <View>
                            <Text className="text-slate-900 font-bold mb-2 ml-1">Teléfono</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4">
                                <Phone size={20} color="#94a3b8" />
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="999 123 4567"
                                    placeholderTextColor="#94a3b8"
                                    className="flex-1 py-4 px-3 text-slate-900 text-base"
                                    keyboardType="phone-pad"
                                />
                                {phone !== (user?.phone || '') && phone.length > 0 && (
                                    <TouchableOpacity onPress={() => setPhone(user?.phone || '')}>
                                        <X size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Save Button (for non-iOS) */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!hasChanges || isLoading}
                        className={`mt-10 h-14 rounded-2xl items-center justify-center ${hasChanges ? 'bg-orange-600' : 'bg-slate-200'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`font-bold text-lg ${hasChanges ? 'text-white' : 'text-slate-400'}`}>
                                Guardar Cambios
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="h-20" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
