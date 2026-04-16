'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi, type FounderProfile } from '@/lib/api';

const TOKEN_KEY = 'bb_token';
const WALLET_KEY = 'bb_wallet';

interface AuthState {
  token: string | null;
  founder: FounderProfile | null;
  publicKey: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  setSession: (token: string, founder: FounderProfile, publicKey: string) => void;
  clearSession: () => void;
  refreshFounder: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    founder: null,
    publicKey: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const publicKey = localStorage.getItem(WALLET_KEY);

    if (!token || !publicKey) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    // Validate token by fetching /me
    authApi
      .me(token)
      .then((founder) => {
        setState({ token, founder, publicKey, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        // Token invalid / expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(WALLET_KEY);
        setState({ token: null, founder: null, publicKey: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const setSession = useCallback(
    (token: string, founder: FounderProfile, publicKey: string) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(WALLET_KEY, publicKey);
      setState({ token, founder, publicKey, isLoading: false, isAuthenticated: true });
    },
    [],
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(WALLET_KEY);
    setState({ token: null, founder: null, publicKey: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshFounder = useCallback(async () => {
    if (!state.token) return;
    try {
      const founder = await authApi.me(state.token);
      setState((s) => ({ ...s, founder }));
    } catch {
      clearSession();
    }
  }, [state.token, clearSession]);

  return (
    <AuthContext.Provider value={{ ...state, setSession, clearSession, refreshFounder }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
