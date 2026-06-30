/**
 * Platform-aware confirm dialog.
 * - Native: React Native's Alert.alert (Cancel + destructive action).
 * - Web: window.confirm (Alert.alert is a no-op on react-native-web).
 */
import { Alert, Platform } from 'react-native';

interface ConfirmOpts {
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export function confirm({
  title,
  message,
  confirmLabel = 'Confirm',
  destructive,
}: ConfirmOpts): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined'
          ? window.confirm(message ? `${title}\n\n${message}` : title)
          : false;
      resolve(ok);
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
