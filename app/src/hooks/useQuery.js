import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useQuery(loader, { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled && initialData == null);
  const [refreshing, setRefreshing] = useState(false);
  const dataRef = useRef(initialData);
  const requestId = useRef(0);

  const run = useCallback(async (mode = 'load') => {
    if (!enabled) return;
    const id = ++requestId.current;
    if (mode === 'load' && dataRef.current == null) setLoading(true);
    if (mode === 'refresh') setRefreshing(true);

    try {
      const result = await loader();
      if (id !== requestId.current) return;
      dataRef.current = result;
      setData(result);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [loader, enabled]);

  useEffect(() => {
    const kickoff = setTimeout(() => run('load'), 0);
    return () => {
      clearTimeout(kickoff);
      requestId.current += 1;
    };
  }, [run]);

  const refetch = useCallback((mode = 'refresh') => run(mode), [run]);

  return { data, error, loading, refreshing, refetch };
}

export function useFocusRefetch(refetch) {
  const first = useRef(true);
  const ref = useRef(refetch);

  useEffect(() => {
    ref.current = refetch;
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      ref.current('silent');
    }, []),
  );
}
