import { loginRequest, logoutRequest, requestResetToken, confirmResetToken } from '../authApi';

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
});

const createResponse = (options: {
  ok: boolean;
  status?: number;
  json?: unknown;
  throwJson?: boolean;
}): Response =>
  ({
    ok: options.ok,
    status: options.status ?? (options.ok ? 200 : 400),
    json: options.throwJson
      ? jest.fn(() => Promise.reject(new Error('Invalid JSON')))
      : jest.fn(() => Promise.resolve(options.json)),
  }) as unknown as Response;

describe('authApi', () => {
  it('loginRequest returns user on success', async () => {
    const user = { id: 'user-1', username: 'tester', role: 'USER' as const };
    mockFetch.mockResolvedValueOnce(createResponse({ ok: true, json: user }));

    const result = await loginRequest('tester', 'password');

    expect(result).toEqual(user);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('loginRequest throws error message when response includes error', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ ok: false, json: { error: 'Invalid credentials' } })
    );

    await expect(loginRequest('tester', 'bad')).rejects.toThrow('Invalid credentials');
  });

  it('loginRequest falls back to generic error when response json fails', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({ ok: false, throwJson: true }));

    await expect(loginRequest('tester', 'bad')).rejects.toThrow('Request failed');
  });

  it('logoutRequest resolves on success', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({ ok: true, json: {} }));

    await expect(logoutRequest()).resolves.toBeUndefined();
  });

  it('logoutRequest throws message on failure', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({ ok: false, json: { message: 'No session' } }));

    await expect(logoutRequest()).rejects.toThrow('No session');
  });

  it('requestResetToken resolves on success', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({ ok: true, json: {} }));

    await expect(requestResetToken('user')).resolves.toBeUndefined();
  });

  it('confirmResetToken throws on failure', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ ok: false, json: { error: 'Invalid token' } })
    );

    await expect(confirmResetToken('token', 'ValidPass12!')).rejects.toThrow('Invalid token');
  });
});
