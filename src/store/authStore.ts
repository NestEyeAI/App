/**
 * Global auth state (Zustand).
 * Wraps the swappable authProvider so screens never call the provider directly.
 */
import { create } from 'zustand';
import { AuthSession, AuthUser } from '@/types';
import { authProvider } from '@/services/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;

  restore: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

function applySession(set: (p: Partial<AuthState>) => void, session: AuthSession) {
  set({
    user: session.user,
    token: session.token,
    status: 'authenticated',
    error: null,
  });
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  status: 'loading',
  error: null,

  restore: async () => {
    const session = await authProvider.restoreSession();
    if (session) applySession(set, session);
    else set({ status: 'unauthenticated' });
  },

  signIn: async (email, password) => {
    set({ error: null });
    try {
      const session = await authProvider.signIn(email, password);
      applySession(set, session);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Sign in failed' });
      throw e;
    }
  },

  signUp: async (name, email, password) => {
    set({ error: null });
    try {
      const session = await authProvider.signUp(name, email, password);
      applySession(set, session);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Sign up failed' });
      throw e;
    }
  },

  requestPasswordReset: async (email) => {
    await authProvider.requestPasswordReset(email);
  },

  signOut: async () => {
    await authProvider.signOut();
    set({ user: null, token: null, status: 'unauthenticated' });
  },
}));
