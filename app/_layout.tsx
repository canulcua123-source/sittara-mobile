import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';

const queryClient = new QueryClient();

// Stripe Publishable Key (from environment or default to test key)
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51QhvMuE8qd2edytJswMhNMuMkzM3TBNaVSQifJfaYe3QoybJGy5aQ6FV3Y7r9C8ySf9LR0b0J1g0rB8LSAv7vNIE00zYzPuRRG';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Platform-specific Stripe wrapper
function StripeWrapper({ children }: { children: React.ReactNode }) {
  // On web, just render children without Stripe
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  // On native, use StripeProvider (imported dynamically in .native file)
  const { StripeProvider } = require('@stripe/stripe-react-native');
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.sittara"
      urlScheme="sittara"
    >
      {children}
    </StripeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeWrapper>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FavoritesProvider>
              <RootLayoutNav />
              <Toast />
            </FavoritesProvider>
          </AuthProvider>
        </QueryClientProvider>
      </StripeWrapper>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const hasSeenOnboarding = await SecureStore.getItemAsync('has_seen_onboarding');
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!hasSeenOnboarding && !inOnboardingGroup) {
      router.replace('/onboarding');
    }
    setIsReady(true);
  };

  if (!isReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/index" options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="restaurant/[id]/index" />
        <Stack.Screen name="restaurant/[id]/reserve" options={{ presentation: 'modal' }} />
        <Stack.Screen name="restaurant/[id]/success" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="admin/index" />
        <Stack.Screen name="admin/scanner" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </ThemeProvider>
  );
}
