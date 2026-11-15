import { useCallback } from 'react';
import { categoriesApi } from '../api/categories';
import { useQuery } from './useQuery';

export function useCategories() {
  const loader = useCallback(() => categoriesApi.list(), []);
  const query = useQuery(loader);
  return { ...query, data: query.data || [] };
}
