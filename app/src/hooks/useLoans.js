import { useCallback } from 'react';
import { loansApi } from '../api/loans';
import { useQuery } from './useQuery';

export function useLoans(status = 'aktif', limit = 20) {
  const loader = useCallback(
    () => loansApi.list({ status, limit }),
    [status, limit],
  );
  const query = useQuery(loader);
  return {
    ...query,
    data: query.data?.data || [],
    meta: query.data?.meta || { total: 0 },
  };
}
