/**
 * Theme mode state (Zustand + AsyncStorage persistence).
 * 'default' = beige brand look, 'light' = whiter neutrals, 'dark' = dark mode.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/theme';

const STORAGE_KEY = 'nesteye.theme';

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark') {
        set({ mode: raw, hydrated: true });
        return;
      }
    } catch {
      // fall through to default
    }
    set({ hydrated: true });
  },

  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => undefined);
  },
}));
