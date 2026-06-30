/**
 * Alert / notification preferences (Zustand + AsyncStorage persistence).
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertPreferences } from '@/types';

const STORAGE_KEY = 'nesteye.preferences';

const DEFAULT_PREFERENCES: AlertPreferences = {
  pilingEnabled: true,
  mortalityEnabled: true,
  environmentEnabled: true,
  activityEnabled: true,
  systemEnabled: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
  tempHighC: 30,
  ammoniaHighPpm: 25,
};

interface PreferencesState {
  preferences: AlertPreferences;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<AlertPreferences>) => void;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ preferences: { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }, hydrated: true });
        return;
      }
    } catch {
      // ignore and fall through to defaults
    }
    set({ hydrated: true });
  },

  update: (patch) => {
    const next = { ...get().preferences, ...patch };
    set({ preferences: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  },
}));
