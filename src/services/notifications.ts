/**
 * Push notifications scaffold (Expo Notifications).
 *
 * Registers for push, sets a foreground handler, and exposes a mock trigger so
 * the alert pipeline can be demoed end-to-end without a backend.
 *
 * TODO[BACKEND]: replace mock push with FCM payload from backend. Send the
 * Expo push token (from registerForPushNotifications) to the backend so it can
 * target this device.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Alert } from '@/types';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Ask for permission + return the Expo push token.
 * TODO[BACKEND]: POST this token to /devices so FCM can target the device.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!isNative) return null; // Expo push tokens are mobile-only
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Barn Alerts',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    // In a bare/standalone build this returns a real Expo push token.
    // Wrapped in try/catch because Expo Go in some envs lacks a projectId.
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Locally schedule a notification mirroring an Alert — used to demo the
 * "alert -> push" flow without a backend.
 * TODO[BACKEND]: this is replaced by server-sent FCM/APNs payloads.
 */
export async function triggerMockAlertNotification(alert: Alert): Promise<void> {
  if (!isNative) return; // skipped on web
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titleForAlert(alert),
      body: alert.message,
      data: { alertId: alert.id, barnId: alert.barnId },
    },
    trigger: null, // fire immediately
  });
}

function titleForAlert(alert: Alert): string {
  const map: Record<string, string> = {
    piling: '🐔 Piling Detected',
    mortality: '⚠️ Possible Mortality',
    high_temperature: '🌡️ High Temperature',
    low_activity: '📉 Low Activity',
    weight_anomaly: '⚖️ Weight Anomaly',
    camera_offline: '📷 Camera Offline',
    system_health: '✅ System Health',
  };
  return map[alert.type] ?? 'Nesteye Alert';
}
