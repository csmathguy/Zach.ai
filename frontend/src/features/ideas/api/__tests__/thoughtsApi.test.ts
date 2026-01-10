import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createThought, fetchThoughts, getApiBase } from '../thoughtsApi';
import type { Thought } from '../../types';

describe('thoughtsApi', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    jest.clearAllMocks();
  });

  it('fetchThoughts returns parsed data when response is ok', async () => {
    const mockThoughts: Thought[] = [
      {
        id: 'thought-1',
        text: 'First idea',
        source: 'text',
        timestamp: '2026-01-01T10:00:00.000Z',
        processedState: 'UNPROCESSED',
      },
    ];

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockThoughts,
    } as Response);

    const result = await fetchThoughts();

    expect(result).toEqual(mockThoughts);
    expect(global.fetch).toHaveBeenCalledWith('/api/thoughts');
  });

  it('fetchThoughts throws when response is not ok', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(fetchThoughts()).rejects.toThrow('Failed to load thoughts');
  });

  it('createThought posts JSON and returns parsed response', async () => {
    const payload = { text: 'New idea' };
    const mockResponse = {
      id: 'thought-2',
      text: payload.text,
      source: 'text' as const,
      timestamp: '2026-01-01T11:00:00.000Z',
      processedState: 'UNPROCESSED' as const,
    };

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await createThought(payload.text);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/thoughts',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  });

  it('createThought throws when response is not ok', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(createThought('Bad idea')).rejects.toThrow('Failed to capture thought');
  });

  it('builds dev API base when running on port 5173', () => {
    expect(getApiBase('5173')).toBe('http://localhost:3000');
  });
});
