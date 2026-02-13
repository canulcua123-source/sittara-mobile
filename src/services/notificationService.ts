import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api from './api';

// Configurar comportamiento global de notificaciones (cómo se ven cuando la app está abierta)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true, // Only for iOS to show banner
        shouldShowList: true, // Only for iOS to show in list
    } as Notifications.NotificationBehavior),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permisos de notificación denegados');
            return;
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            const pushTokenString = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;

            console.log('Expo Push Token:', pushTokenString);
            token = pushTokenString;

            // Enviar token al backend si el usuario está logueado
            // Esto se puede llamar también desde AuthContext después del login
            await sendTokenToBackend(token);

        } catch (e) {
            console.error('Error obteniendo push token', e);
        }
    } else {
        console.log('Debes usar un dispositivo físico para Push Notifications');
    }

    return token;
}

export async function sendTokenToBackend(token: string) {
    try {
        await api.post('/users/push-token', { pushToken: token });
        console.log('Token enviado al backend exitosamente');
    } catch (error) {
    }
}

// API Methods for Notifications
const getNotifications = async () => {
    return api.get('/notifications');
};

const getUnreadCount = async () => {
    try {
        const response = await api.get('/notifications/unread-count');
        return response.data?.count || 0;
    } catch (e) {
        return 0;
    }
};

const markAsRead = async (id: string) => {
    return api.patch(`/notifications/${id}/read`, {});
};

const markAllAsRead = async () => {
    return api.patch('/notifications/read-all', {});
};

const notificationService = {
    registerForPushNotificationsAsync,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    sendTokenToBackend
};

export default notificationService;
