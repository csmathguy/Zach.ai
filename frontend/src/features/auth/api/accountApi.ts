export interface AccountProfile {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
}

export interface UpdateAccountProfileInput {
  username?: string;
  email?: string | null;
  phone?: string | null;
  name?: string;
  currentPassword?: string;
}

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

export const fetchProfile = async (): Promise<AccountProfile> => {
  const response = await fetch(`${API_BASE}/api/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  return parseJson<AccountProfile>(response);
};

export const updateProfile = async (_input: UpdateAccountProfileInput): Promise<AccountProfile> => {
  const response = await fetch(`${API_BASE}/api/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(_input),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  return parseJson<AccountProfile>(response);
};
