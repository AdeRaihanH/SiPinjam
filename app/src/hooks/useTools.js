import { useCallback } from 'react';
import { toolsApi } from '../api/tools';
import { useQuery } from './useQuery';

export function useTools({ search = '', categoryId = null, tersedia = false, limit = 20 } = {}) {
  const loader = useCallback(() => {
    const params = { limit };
    if (search.trim()) params.search = search.trim();
    if (categoryId) params.category_id = categoryId;
    if (tersedia) params.tersedia = 1;
    return toolsApi.list(params);
  }, [search, categoryId, tersedia, limit]);

  const query = useQuery(loader);
  return {
    ...query,
    data: query.data?.data || [],
    meta: query.data?.meta || { total: 0, limit, offset: 0 },
  };
}
