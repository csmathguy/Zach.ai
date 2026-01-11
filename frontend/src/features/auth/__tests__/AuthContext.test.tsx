import { renderHook, act } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { loginRequest, logoutRequest } from '@/features/auth/api/authApi';

jest.mock('@/features/auth/api/authApi', () => ({
  loginRequest: jest.fn(),
  logoutRequest: jest.fn(),
}));

const wrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    (loginRequest as jest.Mock).mockReset();
    (logoutRequest as jest.Mock).mockReset();
  });

  it('hydrates user from sessionStorage', () => {
    window.sessionStorage.setItem(
      'zachai.auth.user',
      JSON.stringify({ id: 'user-1', username: 'tester', role: 'USER' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user?.username).toBe('tester');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('ignores invalid sessionStorage JSON', () => {
    window.sessionStorage.setItem('zachai.auth.user', '{not-json');

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login stores the user', async () => {
    (loginRequest as jest.Mock).mockResolvedValueOnce({
      id: 'user-2',
      username: 'new-user',
      role: 'USER',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('new-user', 'ValidPass12!');
    });

    expect(result.current.user?.username).toBe('new-user');
    expect(window.sessionStorage.getItem('zachai.auth.user')).toContain('new-user');
  });

  it('logout clears the user', async () => {
    window.sessionStorage.setItem(
      'zachai.auth.user',
      JSON.stringify({ id: 'user-1', username: 'tester', role: 'USER' })
    );
    (logoutRequest as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(window.sessionStorage.getItem('zachai.auth.user')).toBeNull();
  });
});
