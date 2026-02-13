import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Bell,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Zap,
    ArrowLeft,
    Inbox,
    Trash2,
    CheckCircle
} from 'lucide-react-native';
import {
    useNotifications,
    useUnreadNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead
} from '../../src/hooks/useData';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const formatTimeAgo = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'hace un momento';
        if (minutes < 60) return `hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `hace ${hours} hr${hours > 1 ? 's' : ''}`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `hace ${days} día${days > 1 ? 's' : ''}`;
        return date.toLocaleDateString('es-MX');
    } catch (e) {
        return '';
    }
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'reservation_confirmed':
            return { icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' };
        case 'reservation_cancelled':
            return { icon: XCircle, color: '#dc2626', bg: '#fef2f2' };
        case 'review_response':
            return { icon: MessageSquare, color: '#1f7a66', bg: '#f0fdfa' };
        case 'promo':
            return { icon: Zap, color: '#eab308', bg: '#fefce8' };
        default:
            return { icon: Bell, color: '#64748b', bg: '#f8fafc' };
    }
};

export default function NotificationsScreen() {
    const router = useRouter();
    const { data: response, isLoading, refetch, isRefetching } = useNotifications();
    const { refetch: refetchUnread } = useUnreadNotifications();
    const markAsRead = useMarkNotificationAsRead();
    const markAllAsRead = useMarkAllNotificationsAsRead();

    const notifications = response?.data || [];

    useEffect(() => {
        refetch();
    }, []);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (!isRead) {
            await markAsRead.mutateAsync(id);
            refetchUnread();
        }
    };

    const handleMarkAllAsRead = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await markAllAsRead.mutateAsync();
        refetch();
        refetchUnread();
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const { icon: Icon, color, bg } = getNotificationIcon(item.type);
        const timeAgo = formatTimeAgo(item.created_at);

        return (
            <Animated.View entering={FadeInRight.delay(index * 50)}>
                <TouchableOpacity
                    onPress={() => handleMarkAsRead(item.id, item.is_read)}
                    className={`flex-row p-5 border-b border-slate-50 ${item.is_read ? 'bg-white' : 'bg-orange-50/30'}`}
                >
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center`} style={{ backgroundColor: bg }}>
                        <Icon size={24} color={color} />
                    </View>
                    <View className="ml-4 flex-1">
                        <View className="flex-row justify-between items-start">
                            <Text className={`text-slate-900 font-bold flex-1 ${item.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                                {item.title}
                            </Text>
                            {!item.is_read && <View className="w-2 h-2 rounded-full bg-orange-600 mt-1.5" />}
                        </View>
                        <Text className={`text-slate-500 text-sm mt-1 leading-5 ${item.is_read ? 'text-slate-400' : 'text-slate-500'}`}>
                            {item.message}
                        </Text>
                        <Text className="text-slate-400 text-[10px] mt-2 font-medium uppercase tracking-wider">{timeAgo}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center text-slate-900"
                >
                    <ArrowLeft size={20} color="#000" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Notificaciones</Text>
                <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    disabled={notifications.length === 0}
                >
                    <CheckCircle size={20} color={notifications.length > 0 ? "#1f7a66" : "#cbd5e1"} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1f7a66" />
                </View>
            ) : notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                        <Inbox size={40} color="#cbd5e1" />
                    </View>
                    <Text className="text-xl font-bold text-slate-900 mb-2">Bandeja vacía</Text>
                    <Text className="text-slate-500 text-center">Te avisaremos cuando haya actualizaciones sobre tus reservas o reseñas.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1f7a66" />
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </SafeAreaView>
    );
}
