import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, SlidersHorizontal, Bell, Utensils } from 'lucide-react-native';
import { RestaurantCard } from '../../components/RestaurantCard';
import { useRestaurants, useFeaturedRestaurants, useUnreadNotifications } from '../../src/hooks/useData';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: restaurants, isLoading, isError, refetch, isRefetching } = useRestaurants();
  const { data: featured } = useFeaturedRestaurants();
  const { data: unreadResponse } = useUnreadNotifications();
  const [search, setSearch] = useState('');

  const unreadCount = unreadResponse?.data?.unreadCount || 0;

  const filteredRestaurants = restaurants?.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine?.toLowerCase().includes(search.toLowerCase()) ||
    r.zone?.toLowerCase().includes(search.toLowerCase())
  );

  const renderHeader = () => (
    <View className="px-6 pt-4 pb-6">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-slate-500 text-sm">Bienvenido de vuelta,</Text>
          <Text className="text-slate-900 text-xl font-bold">{user?.name || 'Comensal'} 👋</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center relative"
        >
          <Bell size={20} color="#64748b" />
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-orange-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row gap-3 mb-8">
        <View className="flex-1 flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl">
          <Search size={20} color="#94a3b8" />
          <TextInput
            placeholder="Buscar restaurante, comida..."
            className="flex-1 ml-2 text-slate-900"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity className="bg-orange-600 w-12 h-12 rounded-2xl items-center justify-center">
          <SlidersHorizontal size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Categories (Quick filters) */}
      <View className="mb-8">
        <Text className="text-lg font-bold text-slate-900 mb-4">Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {['Todos', 'Yucateca', 'Mariscos', 'Cortes', 'Italiana'].map((cat, i) => (
            <TouchableOpacity
              key={cat}
              className={`px-6 py-2 rounded-full mr-3 border ${i === 0 ? 'bg-orange-600 border-orange-600' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-semibold ${i === 0 ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Section */}
      {featured && featured.length > 0 && (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-slate-900">Destacados</Text>
            <TouchableOpacity>
              <Text className="text-orange-600 font-semibold">Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-6 px-6">
            {featured.map(r => (
              <View key={r.id} className="w-72 mr-4">
                <RestaurantCard restaurant={r} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Text className="text-lg font-bold text-slate-900 mb-4 mt-4">Todos los Restaurantes</Text>
    </View>
  );

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <ActivityIndicator size="large" color="#1f7a66" />
        <Text className="mt-4 text-slate-500">Cargando delicias...</Text>
      </View>
    );
  }

  if (isError && !isRefetching) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-xl font-bold text-slate-900 mb-2">¡Ups! Algo salió mal</Text>
        <Text className="text-slate-500 text-center mb-6">
          No pudimos conectar con la cocina. Por favor, verifica tu internet o intenta de nuevo.
        </Text>
        <TouchableOpacity
          className="bg-orange-600 px-8 py-3 rounded-2xl"
          onPress={() => refetch()}
        >
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-6">
            <RestaurantCard restaurant={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1f7a66" />
        }
        ListFooterComponent={<View className="h-10" />}
      />
    </SafeAreaView>
  );
}
