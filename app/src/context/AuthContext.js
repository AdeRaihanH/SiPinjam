import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/auth';
import { setUnauthorizedHandler, TOKEN_KEY } from '../api/client';

const MEMBER_KEY = 'sipinjam.member';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    setMember(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, MEMBER_KEY]).catch(() => {});
  }, []);

  const login = useCallback(async (nim, password) => {
    const result = await authApi.login(String(nim).trim(), password);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, result.token],
      [MEMBER_KEY, JSON.stringify(result.member)],
    ]);
    setMember(result.member);
    return result.member;
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const [[, token], [, cached]] = await AsyncStorage.multiGet([TOKEN_KEY, MEMBER_KEY]);
        if (!token) return;

        if (cached) {
          try { setMember(JSON.parse(cached)); } catch { /* abaikan cache rusak */ }
        }

        try {
          const result = await authApi.me();
          if (!active) return;
          setMember(result.member);
          await AsyncStorage.setItem(MEMBER_KEY, JSON.stringify(result.member));
        } catch (error) {
          if (!active) return;
          if (error.status === 401) await clearSession();
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    boot();
    return () => { active = false; };
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => { clearSession(); });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const value = useMemo(() => ({
    member,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(member),
  }), [member, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
