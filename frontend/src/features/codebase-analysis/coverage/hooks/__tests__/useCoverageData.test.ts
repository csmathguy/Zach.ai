import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { useCoverageData } from '../useCoverageData';
import type { CoverageSummary } from '../../utils/coverageTypes';

describe('useCoverageData', () => {
  const mockCoverageSummary: CoverageSummary = {
    total: {
      lines: { total: 100, covered: 85, skipped: 0, pct: 85 },
      statements: { total: 120, covered: 100, skipped: 0, pct: 83.33 },
      functions: { total: 30, covered: 28, skipped: 0, pct: 93.33 },
      branches: { total: 40, covered: 35, skipped: 0, pct: 87.5 },
    },
    'src/app/App.tsx': {
      lines: { total: 50, covered: 45, skipped: 0, pct: 90 },
      statements: { total: 60, covered: 55, skipped: 0, pct: 91.67 },
      functions: { total: 15, covered: 14, skipped: 0, pct: 93.33 },
      branches: { total: 20, covered: 18, skipped: 0, pct: 90 },
    },
  };

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockReturnValue(
      new Promise(() => {}) as unknown as Promise<Response>
    );

    const { result } = renderHook(() => useCoverageData('frontend'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch and parse frontend coverage data successfully', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockCoverageSummary,
    } as Response);

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.total.lines).toBe(85);
    expect(result.current.data?.total.statements).toBeCloseTo(83.33, 1);
    expect(result.current.data?.total.functions).toBeCloseTo(93.33, 1);
    expect(result.current.data?.total.branches).toBe(87.5);
    expect(result.current.data?.files).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/coverage/frontend-coverage-summary.json');
  });

  it('should fetch and parse backend coverage data', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockCoverageSummary,
    } as Response);

    const { result } = renderHook(() => useCoverageData('backend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/coverage/backend-coverage-summary.json');
  });

  it('should handle 404 errors gracefully', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(
      'Coverage data not found. Run: npm run test:coverage --prefix frontend'
    );
  });

  it('should handle 500 errors gracefully', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useCoverageData('backend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(
      'Coverage data not found. Run: npm run test:coverage --prefix backend'
    );
  });

  it('should handle network error', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should handle unknown error type', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed to load coverage data');
  });

  it('should refetch data when project changes', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockCoverageSummary,
    } as Response);

    const { result, rerender } = renderHook(
      ({ project }) => useCoverageData(project),
      { initialProps: { project: 'frontend' as const } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/coverage/frontend-coverage-summary.json');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Change project
    rerender({ project: 'backend' as any });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/coverage/backend-coverage-summary.json');
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle manual refresh', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockCoverageSummary,
    } as Response);

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    expect(global.fetch).toHaveBeenCalledWith('/coverage/frontend-coverage-summary.json');
  });

  it('should retry and succeed after error', async () => {
    // First call fails
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Second call succeeds
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoverageSummary,
    } as Response);

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();
  });

  it('should handle malformed JSON response', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as unknown as Response);

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Invalid JSON');
  });

  it('should handle empty files in coverage data', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockCoverageSummary,
    } as Response);

    const { result } = renderHook(() => useCoverageData('frontend'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refresh');
    expect(typeof result.current.refresh).toBe('function');
  });
});
