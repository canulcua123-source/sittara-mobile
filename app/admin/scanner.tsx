import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, Zap, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    useEffect(() => {
        requestPermission();
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container} className="bg-slate-900 items-center justify-center p-8">
                <Text className="text-white text-xl font-bold text-center mb-4">Se requiere permiso de cámara</Text>
                <Text className="text-slate-400 text-center mb-8">Necesitamos acceder a tu cámara para poder escanear los códigos de reserva de los clientes.</Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-orange-600 px-8 py-4 rounded-2xl"
                >
                    <Text className="text-white font-bold">Conceder Permiso</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;

        setScanned(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Aquí iría la lógica para validar el QR con el backend

        // Simulamos validación
        setTimeout(() => {
            // Regresamos o vamos a una pantalla de detalle de reserva escaneada
            router.back();
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                <SafeAreaView className="flex-1 justify-between py-8 px-6">
                    <View className="flex-row justify-between items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-12 h-12 bg-black/40 rounded-full items-center justify-center"
                        >
                            <X color="white" size={24} />
                        </TouchableOpacity>
                        <Text className="text-white font-bold text-lg">Escanear QR</Text>
                        <TouchableOpacity className="w-12 h-12 bg-black/40 rounded-full items-center justify-center">
                            <Zap color="white" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View className="items-center">
                        <View style={styles.scannerFrame} className="border-2 border-white rounded-[40px]">
                            {scanned && (
                                <Animated.View entering={ZoomIn} className="flex-1 items-center justify-center bg-green-500/80 rounded-[40px]">
                                    <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
                                        <Check color="#22c55e" size={40} strokeWidth={4} />
                                    </View>
                                    <Text className="text-white font-bold mt-4 text-xl">VALIDADO</Text>
                                </Animated.View>
                            )}
                        </View>
                        <Text className="text-white/60 text-center mt-10 px-10">Apunta la cámara al código QR de la reserva del cliente.</Text>
                    </View>

                    <View className="h-20" />
                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scannerFrame: {
        width: width * 0.7,
        height: width * 0.7,
    }
});
