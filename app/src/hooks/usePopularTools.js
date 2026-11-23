import { useCallback } from 'react';
import { statsApi } from '../api/stats';
import { useQuery } from './useQuery';

export function usePopularTools(limit = 5) {
  const loader = useCallback(() => statsApi.populer(limit), [limit]);
  const query = useQuery(loader);
  return {
    ...query,
    data: query.data || [],
  };
}
