import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { AuthUser } from '@/features/auth/types';
import { loginRequest, logoutRequest } from '@/features/auth/api/authApi';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'zachai.auth.user';

const readStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const writeStoredUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!user) {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const handleSetUser = useCallback((next: AuthUser | null) => {
    setUser(next);
    writeStoredUser(next);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const result = await loginRequest(identifier, password);
      handleSetUser(result);
      return result;
    },
    [handleSetUser]
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    handleSetUser(null);
  }, [handleSetUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUser: handleSetUser,
    }),
    [user, login, logout, handleSetUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useOptionalAuth = (): AuthContextValue | undefined => useContext(AuthContext);
