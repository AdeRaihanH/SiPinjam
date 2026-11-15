import { useCallback } from 'react';
import { statsApi } from '../api/stats';
import { useQuery } from './useQuery';

export function useStats() {
  const loader = useCallback(() => statsApi.summary(), []);
  return useQuery(loader);
}
