import { createUser, fetchUsers, issueResetToken } from '../adminApi';

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

describe('adminApi', () => {
  it('fetchUsers returns list', async () => {
    const users = [
      {
        id: 'user-1',
        username: 'tester',
        name: 'Tester',
        email: null,
        role: 'USER',
        status: 'ACTIVE',
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      },
    ];
    mockFetch.mockResolvedValueOnce(createResponse({ ok: true, json: { users } }));

    const result = await fetchUsers();

    expect(result).toEqual(users);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/users'),
      expect.any(Object)
    );
  });

  it('fetchUsers throws message when request fails', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({ ok: false, json: { error: 'Forbidden' } }));

    await expect(fetchUsers()).rejects.toThrow('Forbidden');
  });

  it('createUser returns reset token', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ ok: true, json: { userId: 'user-2', resetToken: 'token-1' } })
    );

    const result = await createUser({ username: 'new', name: 'New', role: 'USER' });

    expect(result.resetToken).toBe('token-1');
  });

  it('issueResetToken throws generic error when json fails', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({ ok: false, throwJson: true }));

    await expect(issueResetToken('user-1')).rejects.toThrow('Request failed');
  });
});
