import type { AuthUser } from '@/features/auth/types';

const getApiBase = (port?: string): string => {
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

const parseError = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error ?? data.message ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
};

export const loginRequest = async (identifier: string, password: string): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  return parseJson<AuthUser>(response);
};

export const logoutRequest = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
};

export const requestResetToken = async (identifier: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/auth/reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
};

export const confirmResetToken = async (token: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/auth/reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }
};
