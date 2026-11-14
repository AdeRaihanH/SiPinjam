import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnread(0);
      return;
    }
    try {
      const result = await api.getList('/notifications', { params: { limit: 1 } });
      setUnread(Number(result.meta?.belum_dibaca || 0));
    } catch {
      // Badge notifikasi bersifat sekunder; kegagalan jaringan tidak boleh
      // mengganggu layar utama.
    }
  }, [user]);

  const markAllRead = useCallback(async () => {
    await api.patch('/notifications/read-all');
    setUnread(0);
  }, []);

  useEffect(() => {
    const kickoff = setTimeout(refresh, 0);
    if (!user) {
      return () => clearTimeout(kickoff);
    }

    const interval = setInterval(refresh, 60000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
      subscription.remove();
    };
  }, [user, refresh]);

  const value = useMemo(() => ({
    unread,
    refresh,
    markAllRead,
    setUnread,
  }), [unread, refresh, markAllRead]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications harus dipakai di dalam NotificationProvider');
  return context;
}
