import { useState, useEffect } from 'react';
import type { CoverageSummary, ParsedCoverageData } from '../utils/coverageTypes';
import { parseCoverageData } from '../utils/coverageParser';

interface UseCoverageDataResult {
  data: ParsedCoverageData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to load coverage data from JSON files
 * Coverage files should be placed in public/coverage/ folder
 */
export function useCoverageData(project: 'frontend' | 'backend'): UseCoverageDataResult {
  const [data, setData] = useState<ParsedCoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from public folder
      const response = await fetch(`/coverage/${project}-coverage-summary.json`);

      if (!response.ok) {
        throw new Error(
          `Coverage data not found. Run: npm run test:coverage --prefix ${project}`
        );
      }

      const rawData: CoverageSummary = await response.json();
      const parsed = parseCoverageData(rawData);

      setData(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coverage data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [project]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}
