import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from '@/navigation/RootNavigator';
import { registerForPushNotifications } from '@/services/notifications';
import { ThemeProvider } from '@/theme/ThemeContext';
import { useThemeStore } from '@/store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const hydrateTheme = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrateTheme();
    // Scaffold push registration. Safe no-op if permissions are denied / on web.
    // TODO[BACKEND]: send returned token to backend so FCM can target device.
    registerForPushNotifications();
  }, [hydrateTheme]);

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={mode}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
