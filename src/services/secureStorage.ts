/**
 * Platform-aware secure storage shim.
 * - Native: SecureStore (Keychain / Keystore)
 * - Web: localStorage (fine for demo / dev — NOT for production secrets)
 *
 * TODO[BACKEND]: on web with a real backend, use http-only cookies or a
 * server-managed session instead of localStorage.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

function webGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}
function webSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
function webDelete(key: string): void {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) return webGet(key);
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) return webSet(key, value);
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (isWeb) return webDelete(key);
  await SecureStore.deleteItemAsync(key);
}
