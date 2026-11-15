import { useCallback } from 'react';
import { notificationsApi } from '../api/notifications';
import { useQuery } from './useQuery';

export function useNotifications(limit = 30) {
  const loader = useCallback(
    () => notificationsApi.list({ limit }),
    [limit],
  );
  const query = useQuery(loader);
  return {
    ...query,
    data: query.data?.data || [],
    meta: query.data?.meta || { total: 0, belum_dibaca: 0 },
  };
}
