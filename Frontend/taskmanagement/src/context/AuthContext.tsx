import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth';
import { getCurrentUser } from '../api/users';
import type { AuthResponse, UserProfile } from '../types';

interface AuthContextValue {
  user: AuthResponse | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => authApi.getStoredAuth());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!authApi.getStoredAuth()) {
      setProfile(null);
      return;
    }
    const p = await getCurrentUser();
    setProfile(p);
  }, []);

  useEffect(() => {
    const init = async () => {
      const stored = authApi.getStoredAuth();
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        await refreshProfile();
      } catch {
        authApi.logout();
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    setUser(data);
    await refreshProfile();
  }, [refreshProfile]);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await authApi.register({ username, email, password });
    },
    [],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAuthenticated: !!user && !!profile,
      isAdmin: profile?.roles.includes('Admin') ?? false,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, profile, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
