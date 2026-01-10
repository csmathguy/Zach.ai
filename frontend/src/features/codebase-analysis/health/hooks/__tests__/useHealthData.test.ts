import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useHealthData } from '../useHealthData';

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('useHealthData', () => {
  const mockHealthResponse = {
    status: 'ok',
    timestamp: '2026-01-01T12:00:00.000Z',
    env: 'development',
    port: 3000,
  };

  const mockMetricsResponse = {
    uptime: {
      formatted: '1d 2h 30m 45s',
      days: 1,
      hours: 2,
      minutes: 30,
      seconds: 45,
    },
    responseTime: {
      average: 25,
      samples: 100,
      recent: [20, 25, 30],
    },
    memory: {
      rss: 100,
      heapTotal: 80,
      heapUsed: 50,
      external: 10,
    },
    requests: {
      total: 1234,
    },
    timestamp: '2026-01-01T12:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch health data on mount', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHealthResponse,
        } as Response);
      }
      if (typeof url === 'string' && url.includes('/api/metrics')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMetricsResponse,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { result } = renderHook(() => useHealthData(false));

    expect(result.current.loading).toBe(true);
    expect(result.current.health).toBeNull();
    expect(result.current.metrics).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.health).toEqual(mockHealthResponse);
    expect(result.current.metrics).toEqual(mockMetricsResponse);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useHealthData(false));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.health).toBeNull();
    expect(result.current.metrics).toBeNull();
  });

  it('should handle HTTP error responses', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useHealthData(false));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch health data');
  });

  it('should auto-refresh when enabled', async () => {
    jest.useFakeTimers();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHealthResponse,
        } as Response);
      }
      if (typeof url === 'string' && url.includes('/api/metrics')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMetricsResponse,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderHook(() => useHealthData(true, 30000));

    // Initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Fast-forward 30 seconds
    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    // Should trigger another fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    jest.useRealTimers();
  });

  it('should not auto-refresh when disabled', async () => {
    jest.useFakeTimers();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHealthResponse,
        } as Response);
      }
      if (typeof url === 'string' && url.includes('/api/metrics')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMetricsResponse,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderHook(() => useHealthData(false));

    // Initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Fast-forward 30 seconds
    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    // Should NOT trigger another fetch
    expect(global.fetch).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should use correct API endpoints', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHealthResponse,
        } as Response);
      }
      if (typeof url === 'string' && url.includes('/api/metrics')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMetricsResponse,
        } as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderHook(() => useHealthData(false));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Verify both endpoints were called
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
