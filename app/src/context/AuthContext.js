import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, setToken } from '../services/api';

const TOKEN_KEY = 'sipinjam.token';
const USER_KEY = 'sipinjam.user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const clearing = useRef(false);

  const clearSession = useCallback(async () => {
    if (clearing.current) return;
    clearing.current = true;
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]).catch(() => {});
    clearing.current = false;
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await api.post('/auth/login', {
      email: String(email).trim().toLowerCase(),
      password,
    });

    await AsyncStorage.multiSet([
      [TOKEN_KEY, result.token],
      [USER_KEY, JSON.stringify(result.user)],
    ]);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const [[, token], [, cachedUser]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        if (!token) return;

        setToken(token);
        try {
          const result = await api.get('/auth/me');
          if (!active) return;
          setUser(result.user);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
        } catch (error) {
          if (!active) return;
          if (error.status === 401) {
            await clearSession();
          } else if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }
        }
      } catch {
        // Penyimpanan lokal gagal dibaca: mulai dari layar login.
      } finally {
        if (active) setLoading(false);
      }
    }

    boot();
    return () => {
      active = false;
    };
  }, [clearSession]);

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      clearSession();
    });
    return () => api.setUnauthorizedHandler(null);
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return context;
}
