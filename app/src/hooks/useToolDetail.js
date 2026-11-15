import { useCallback } from 'react';
import { toolsApi } from '../api/tools';
import { useQuery } from './useQuery';

export function useToolDetail(id, initialData = null) {
  const loader = useCallback(() => toolsApi.detail(id), [id]);
  return useQuery(loader, { enabled: Boolean(id), initialData });
}
