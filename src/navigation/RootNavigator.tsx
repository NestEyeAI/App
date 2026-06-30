import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/theme';
import { LoadingState } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { AuthNavigator } from './AuthNavigator';
import { BarnDetailScreen } from '@/screens/BarnDetailScreen';
import { AlertDetailScreen } from '@/screens/AlertDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.forest,
  },
};

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const restore = useAuthStore((s) => s.restore);
  const hydratePrefs = usePreferencesStore((s) => s.hydrate);

  useEffect(() => {
    restore();
    hydratePrefs();
  }, [restore, hydratePrefs]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingState message="Starting Nesteye…" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {status === 'authenticated' ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.forest,
            headerTitleStyle: { fontWeight: '700', color: colors.textPrimary },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="BarnDetail"
            component={BarnDetailScreen}
            options={{ title: 'Barn', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="AlertDetail"
            component={AlertDetailScreen}
            options={{ title: 'Alert', headerBackTitle: 'Back' }}
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
