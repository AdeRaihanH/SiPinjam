import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Mengambil data async dengan status loading, error, dan refresh.
 * `loader` harus stabil (bungkus dengan useCallback di layar).
 */
export function useResource(loader, { enabled = true, initialData = null } = {}) {
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

  const reload = useCallback((mode = 'refresh') => run(mode), [run]);

  const updateData = useCallback((updater) => {
    setData((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      dataRef.current = next;
      return next;
    });
  }, []);

  return { data, error, loading, refreshing, reload, setData: updateData };
}

/** Memuat ulang data diam-diam setiap kali layar kembali difokuskan. */
export function useFocusReload(reload) {
  const first = useRef(true);
  const reloadRef = useRef(reload);

  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      reloadRef.current('silent');
    }, []),
  );
}
