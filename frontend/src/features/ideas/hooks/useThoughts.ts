import { useCallback, useEffect, useState } from 'react';

import type { Thought } from '../types';
import { fetchThoughts } from '../api/thoughtsApi';

interface UseThoughtsResult {
  data: Thought[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useThoughts = (): UseThoughtsResult => {
  const [data, setData] = useState<Thought[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const thoughts = await fetchThoughts();
      setData(thoughts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load thoughts');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};
