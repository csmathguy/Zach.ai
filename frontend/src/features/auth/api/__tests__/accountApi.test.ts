import { fetchProfile, updateProfile } from '../accountApi';

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

describe('accountApi', () => {
  it('fetchProfile returns profile on success', async () => {
    const profile = {
      id: 'user-1',
      username: 'tester',
      email: null,
      phone: null,
      name: 'Tester',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
    };
    mockFetch.mockResolvedValueOnce(createResponse({ ok: true, json: profile }));

    const result = await fetchProfile();

    expect(result).toEqual(profile);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/me'),
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('updateProfile throws message on failure', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({ ok: false, json: { message: 'Denied' } }));

    await expect(updateProfile({ name: 'New Name' })).rejects.toThrow('Denied');
  });
});
