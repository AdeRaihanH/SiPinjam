import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { notificationsApi } from '../api/notifications';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { member } = useAuth();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!member) {
      setUnread(0);
      return;
    }
    try {
      const result = await notificationsApi.list({ limit: 1 });
      setUnread(Number(result.meta?.belum_dibaca || 0));
    } catch {
      // Badge bersifat sekunder; jangan ganggu layar utama saat jaringan gagal.
    }
  }, [member]);

  const markAll = useCallback(async () => {
    await notificationsApi.markAll();
    setUnread(0);
  }, []);

  useEffect(() => {
    const kickoff = setTimeout(refresh, 0);
    if (!member) return () => clearTimeout(kickoff);

    const interval = setInterval(refresh, 60000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
      subscription.remove();
    };
  }, [member, refresh]);

  const value = useMemo(() => ({
    unread,
    refresh,
    markAll,
    setUnread,
  }), [unread, refresh, markAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationBadge() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationBadge harus dipakai di dalam NotificationProvider');
  return context;
}
