import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useThoughts } from '../useThoughts';
import type { Thought } from '../../types';

jest.mock('../../api/thoughtsApi', () => ({
  fetchThoughts: jest.fn(),
}));

describe('useThoughts', () => {
  const mockThoughts: Thought[] = [
    {
      id: 'thought-1',
      text: 'First idea',
      source: 'text',
      timestamp: '2026-01-01T10:00:00.000Z',
      processedState: 'UNPROCESSED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes in loading state with empty data', () => {
    const { fetchThoughts } = jest.requireMock('../../api/thoughtsApi') as {
      fetchThoughts: jest.MockedFunction<() => Promise<Thought[]>>;
    };

    fetchThoughts.mockReturnValue(
      new Promise<Thought[]>((resolve) => {
        void resolve;
      })
    );

    const { result } = renderHook(() => useThoughts());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('loads thoughts successfully', async () => {
    const { fetchThoughts } = jest.requireMock('../../api/thoughtsApi') as {
      fetchThoughts: jest.MockedFunction<() => Promise<Thought[]>>;
    };

    fetchThoughts.mockResolvedValue(mockThoughts);

    const { result } = renderHook(() => useThoughts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockThoughts);
    expect(result.current.error).toBeNull();
  });

  it('surfaces fetch errors and resets data', async () => {
    const { fetchThoughts } = jest.requireMock('../../api/thoughtsApi') as {
      fetchThoughts: jest.MockedFunction<() => Promise<Thought[]>>;
    };

    fetchThoughts.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useThoughts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('uses fallback error message for unknown errors', async () => {
    const { fetchThoughts } = jest.requireMock('../../api/thoughtsApi') as {
      fetchThoughts: jest.MockedFunction<() => Promise<Thought[]>>;
    };

    fetchThoughts.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useThoughts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Failed to load thoughts');
  });

  it('refresh re-fetches thoughts', async () => {
    const { fetchThoughts } = jest.requireMock('../../api/thoughtsApi') as {
      fetchThoughts: jest.MockedFunction<() => Promise<Thought[]>>;
    };

    fetchThoughts.mockResolvedValue(mockThoughts);

    const { result } = renderHook(() => useThoughts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchThoughts).toHaveBeenCalledTimes(2);
  });
});
