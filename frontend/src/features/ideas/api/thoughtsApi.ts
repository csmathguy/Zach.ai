import type { Thought } from '../types';

interface CreateThoughtResponse {
  id: string;
  text: string;
  source: Thought['source'];
  timestamp: string;
  processedState: Thought['processedState'];
}

export const getApiBase = (port?: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const resolvedPort = port ?? window.location?.port ?? '';
  return resolvedPort === '5173' ? 'http://localhost:3000' : '';
};

const API_BASE = getApiBase();

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  return data;
};

export const fetchThoughts = async (): Promise<Thought[]> => {
  const response = await fetch(`${API_BASE}/api/thoughts`);
  if (!response.ok) {
    throw new Error('Failed to load thoughts');
  }
  return parseJson<Thought[]>(response);
};

export const createThought = async (text: string): Promise<CreateThoughtResponse> => {
  const response = await fetch(`${API_BASE}/api/thoughts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to capture thought');
  }

  return parseJson<CreateThoughtResponse>(response);
};
