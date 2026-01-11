import { render, screen } from '@testing-library/react';
import { App } from '../App';

jest.mock('@/features/ideas/hooks/useThoughts', () => ({
  useThoughts: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

jest.mock('@/features/auth/api/adminApi', () => ({
  fetchUsers: jest.fn(() => Promise.resolve([])),
  createUser: jest.fn(() => Promise.resolve({ userId: 'user-1', resetToken: 'token-1' })),
  issueResetToken: jest.fn(() => Promise.resolve({ resetToken: 'token-2' })),
}));

const renderAtRoute = (path: string): void => {
  window.history.pushState({}, 'Test', path);
  render(<App />);
};

const setAuthUser = (role: 'USER' | 'ADMIN') => {
  window.sessionStorage.setItem(
    'zachai.auth.user',
    JSON.stringify({ id: 'user-1', username: 'tester', role })
  );
};

describe('Auth routing', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('allows public landing page access without auth', () => {
    renderAtRoute('/');

    expect(screen.getByRole('heading', { level: 1, name: /zach.ai/i })).toBeInTheDocument();
  });

  it('allows login page access without auth', () => {
    renderAtRoute('/login');

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login for protected routes', () => {
    renderAtRoute('/ideas');

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('hides admin navigation for non-admin users', () => {
    setAuthUser('USER');
    renderAtRoute('/ideas');

    expect(screen.queryByRole('tab', { name: /account management/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /health/i })).not.toBeInTheDocument();
  });

  it('allows admins to access admin route', async () => {
    setAuthUser('ADMIN');
    renderAtRoute('/admin/accounts');

    expect(await screen.findByRole('heading', { name: /account management/i })).toBeInTheDocument();
  });
});
