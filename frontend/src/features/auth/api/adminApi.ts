import type { AuthRole } from '@/features/auth/types';

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

export interface AdminUserSummary {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: AuthRole;
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
  lastLoginAt: string | null;
  createdAt: string;
}

export const fetchUsers = async (): Promise<AdminUserSummary[]> => {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  const payload = await parseJson<{ users: AdminUserSummary[] }>(response);
  return payload.users;
};

export const createUser = async (input: {
  username: string;
  name: string;
  email?: string;
  role: AuthRole;
}): Promise<{ userId: string; resetToken: string }> => {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  return parseJson<{ userId: string; resetToken: string }>(response);
};

export const issueResetToken = async (userId: string): Promise<{ resetToken: string }> => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/reset`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  return parseJson<{ resetToken: string }>(response);
};
