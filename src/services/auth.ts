/**
 * Mock auth provider.
 *
 * Stores a token in SecureStore. Structured so Firebase Auth or Cognito can
 * replace `authProvider` later without touching the store or screens.
 *
 * TODO[BACKEND]: replace mock auth with Firebase Auth / Cognito.
 */

import { AuthSession, AuthUser } from '@/types';
import { deleteItem, getItem, setItem } from './secureStorage';

const TOKEN_KEY = 'nesteye.auth.token';
const USER_KEY = 'nesteye.auth.user';

export interface AuthProvider {
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(name: string, email: string, password: string): Promise<AuthSession>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  restoreSession(): Promise<AuthSession | null>;
}

function makeMockSession(email: string, name: string): AuthSession {
  const user: AuthUser = {
    id: 'user-demo',
    email,
    name,
    farmId: 'farm-willow-creek',
  };
  return { token: `mock-token-${Date.now()}`, user };
}

async function persist(session: AuthSession): Promise<void> {
  await setItem(TOKEN_KEY, session.token);
  await setItem(USER_KEY, JSON.stringify(session.user));
}

export const mockAuthProvider: AuthProvider = {
  async signIn(email: string) {
    // TODO[BACKEND]: POST /auth/login -> { token, user }
    const name = email.split('@')[0].replace(/\b\w/g, (c) => c.toUpperCase());
    const session = makeMockSession(email, name || 'Farmer');
    await persist(session);
    return session;
  },

  async signUp(name: string, email: string) {
    // TODO[BACKEND]: POST /auth/register -> { token, user }
    const session = makeMockSession(email, name);
    await persist(session);
    return session;
  },

  async requestPasswordReset() {
    // TODO[BACKEND]: POST /auth/forgot-password
    return;
  },

  async signOut() {
    await deleteItem(TOKEN_KEY);
    await deleteItem(USER_KEY);
  },

  async restoreSession() {
    const token = await getItem(TOKEN_KEY);
    const userRaw = await getItem(USER_KEY);
    if (!token || !userRaw) return null;
    try {
      const user = JSON.parse(userRaw) as AuthUser;
      return { token, user };
    } catch {
      return null;
    }
  },
};

/** Swap this for a real provider when the backend is ready. */
export const authProvider: AuthProvider = mockAuthProvider;
