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
import { ChevronLeft, MapPin, Plus, Trash2, Home, Briefcase, Star, Edit2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
    id: string;
    label: 'home' | 'work' | 'other';
    name: string;
    street: string;
    neighborhood: string;
    city: string;
    postalCode: string;
    reference?: string;
    isDefault: boolean;
}

const STORAGE_KEY = '@sittara_addresses';

export default function AddressesScreen() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
        label: 'home',
        name: '',
        street: '',
        neighborhood: '',
        city: 'Mérida, Yucatán',
        postalCode: '',
        reference: '',
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setAddresses(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAddresses = async (newAddresses: Address[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAddresses));
            setAddresses(newAddresses);
        } catch (error) {
            console.error('Error saving addresses:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.street.trim() || !formData.neighborhood.trim()) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Por favor completa los campos requeridos' });
            return;
        }

        let updated: Address[];

        if (editingId) {
            // Edit existing
            updated = addresses.map(a =>
                a.id === editingId ? { ...a, ...formData } : a
            );
        } else {
            // Add new
            const newAddress: Address = {
                id: Date.now().toString(),
                ...formData,
                isDefault: addresses.length === 0,
            };
            updated = [...addresses, newAddress];
        }

        await saveAddresses(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
            type: 'success',
            text1: editingId ? 'Dirección actualizada' : 'Dirección agregada'
        });
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            label: 'home',
            name: '',
            street: '',
            neighborhood: '',
            city: 'Mérida, Yucatán',
            postalCode: '',
            reference: '',
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEdit = (address: Address) => {
        setFormData({
            label: address.label,
            name: address.name,
            street: address.street,
            neighborhood: address.neighborhood,
            city: address.city,
            postalCode: address.postalCode,
            reference: address.reference || '',
        });
        setEditingId(address.id);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Eliminar dirección',
            '¿Estás seguro de eliminar esta dirección?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const updated = addresses.filter(a => a.id !== id);
                        if (updated.length > 0 && !updated.some(a => a.isDefault)) {
                            updated[0].isDefault = true;
                        }
                        await saveAddresses(updated);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Toast.show({ type: 'success', text1: 'Dirección eliminada' });
                    }
                }
            ]
        );
    };

    const handleSetDefault = async (id: string) => {
        const updated = addresses.map(a => ({
            ...a,
            isDefault: a.id === id
        }));
        await saveAddresses(updated);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Toast.show({ type: 'success', text1: 'Dirección principal actualizada' });
    };

    const getLabelIcon = (label: string) => {
        switch (label) {
            case 'home': return <Home size={20} color="#1f7a66" />;
            case 'work': return <Briefcase size={20} color="#8b5cf6" />;
            default: return <MapPin size={20} color="#64748b" />;
        }
    };

    const getLabelText = (label: string) => {
        switch (label) {
            case 'home': return 'Casa';
            case 'work': return 'Trabajo';
            default: return 'Otro';
        }
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
                <Text className="text-xl font-bold text-slate-900">Mis Direcciones</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                {/* Saved Addresses */}
                {!isEditing && addresses.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                            Direcciones Guardadas
                        </Text>
                        {addresses.map((address) => (
                            <TouchableOpacity
                                key={address.id}
                                onPress={() => handleSetDefault(address.id)}
                                className={`bg-white rounded-2xl p-4 mb-3 border-2 ${address.isDefault ? 'border-orange-500' : 'border-transparent'
                                    }`}
                            >
                                <View className="flex-row items-start">
                                    <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center">
                                        {getLabelIcon(address.label)}
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <View className="flex-row items-center mb-1">
                                            <Text className="text-base font-semibold text-slate-900">
                                                {address.name || getLabelText(address.label)}
                                            </Text>
                                            {address.isDefault && (
                                                <View className="ml-2 bg-orange-100 px-2 py-0.5 rounded-full">
                                                    <Text className="text-xs text-orange-600 font-medium">Principal</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-sm text-slate-500">{address.street}</Text>
                                        <Text className="text-sm text-slate-500">
                                            {address.neighborhood}, {address.city}
                                        </Text>
                                        {address.reference && (
                                            <Text className="text-xs text-slate-400 mt-1">
                                                Ref: {address.reference}
                                            </Text>
                                        )}
                                    </View>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity onPress={() => handleEdit(address)}>
                                            <Edit2 size={18} color="#64748b" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(address.id)}>
                                            <Trash2 size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Add/Edit Form */}
                {isEditing ? (
                    <View className="bg-white rounded-2xl p-6">
                        <Text className="text-lg font-bold text-slate-900 mb-4">
                            {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
                        </Text>

                        {/* Label Selection */}
                        <View className="mb-4">
                            <Text className="text-sm text-slate-500 mb-2">Tipo de lugar</Text>
                            <View className="flex-row gap-2">
                                {(['home', 'work', 'other'] as const).map((label) => (
                                    <TouchableOpacity
                                        key={label}
                                        onPress={() => setFormData({ ...formData, label })}
                                        className={`flex-1 py-3 rounded-xl items-center ${formData.label === label ? 'bg-orange-100' : 'bg-slate-50'
                                            }`}
                                    >
                                        {getLabelIcon(label)}
                                        <Text className={`text-xs mt-1 ${formData.label === label ? 'text-orange-600 font-medium' : 'text-slate-500'
                                            }`}>
                                            {getLabelText(label)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm text-slate-500 mb-2">Nombre (opcional)</Text>
                            <TextInput
                                className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                placeholder="Ej: Casa de mamá"
                                value={formData.name}
                                onChangeText={(t) => setFormData({ ...formData, name: t })}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm text-slate-500 mb-2">Calle y número *</Text>
                            <TextInput
                                className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                placeholder="Calle 60 #123 x 45 y 47"
                                value={formData.street}
                                onChangeText={(t) => setFormData({ ...formData, street: t })}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm text-slate-500 mb-2">Colonia *</Text>
                            <TextInput
                                className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                placeholder="Centro"
                                value={formData.neighborhood}
                                onChangeText={(t) => setFormData({ ...formData, neighborhood: t })}
                            />
                        </View>

                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="text-sm text-slate-500 mb-2">Ciudad</Text>
                                <TextInput
                                    className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                    placeholder="Mérida, Yucatán"
                                    value={formData.city}
                                    onChangeText={(t) => setFormData({ ...formData, city: t })}
                                />
                            </View>
                            <View className="w-28">
                                <Text className="text-sm text-slate-500 mb-2">C.P.</Text>
                                <TextInput
                                    className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                    placeholder="97000"
                                    keyboardType="numeric"
                                    maxLength={5}
                                    value={formData.postalCode}
                                    onChangeText={(t) => setFormData({ ...formData, postalCode: t })}
                                />
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm text-slate-500 mb-2">Referencia (opcional)</Text>
                            <TextInput
                                className="bg-slate-50 px-4 py-3 rounded-xl text-slate-900"
                                placeholder="Frente al parque, casa azul..."
                                value={formData.reference}
                                onChangeText={(t) => setFormData({ ...formData, reference: t })}
                            />
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={resetForm}
                                className="flex-1 py-4 rounded-xl bg-slate-100"
                            >
                                <Text className="text-center font-semibold text-slate-600">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                className="flex-1 py-4 rounded-xl bg-orange-600"
                            >
                                <Text className="text-center font-semibold text-white">
                                    {editingId ? 'Actualizar' : 'Guardar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => setIsEditing(true)}
                        className="bg-white rounded-2xl p-4 flex-row items-center border-2 border-dashed border-slate-200"
                    >
                        <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center">
                            <Plus size={24} color="#1f7a66" />
                        </View>
                        <View className="ml-4">
                            <Text className="text-base font-semibold text-slate-900">Agregar dirección</Text>
                            <Text className="text-sm text-slate-500">Casa, trabajo u otro lugar</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
