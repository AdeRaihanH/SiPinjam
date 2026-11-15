import { useCallback } from 'react';
import { loansApi } from '../api/loans';
import { useQuery } from './useQuery';

export function useLoanDetail(id) {
  const loader = useCallback(() => loansApi.detail(id), [id]);
  return useQuery(loader, { enabled: Boolean(id) });
}
