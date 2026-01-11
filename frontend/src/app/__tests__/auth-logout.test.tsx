import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';

const logoutRequest = jest.fn(() => Promise.resolve());

jest.mock('@/features/auth/api/authApi', () => ({
  loginRequest: jest.fn(),
  logoutRequest: () => logoutRequest(),
  requestResetToken: jest.fn(),
  confirmResetToken: jest.fn(),
}));

jest.mock('@/features/ideas/hooks/useThoughts', () => ({
  useThoughts: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

const setAuthUser = () => {
  window.sessionStorage.setItem(
    'zachai.auth.user',
    JSON.stringify({ id: 'user-1', username: 'tester', role: 'USER' })
  );
};

const renderAtRoute = (path: string) => {
  window.history.pushState({}, 'Test', path);
  return render(<App />);
};

describe('Logout flow', () => {
  beforeEach(() => {
    logoutRequest.mockClear();
    window.sessionStorage.clear();
  });

  it('shows logout action when authenticated', () => {
    setAuthUser();
    renderAtRoute('/ideas');

    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('clears auth storage and redirects to login on logout', async () => {
    const user = userEvent.setup();
    setAuthUser();
    renderAtRoute('/ideas');

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(logoutRequest).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem('zachai.auth.user')).toBeNull();
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('blocks protected routes after logout', async () => {
    const user = userEvent.setup();
    setAuthUser();
    const { unmount } = renderAtRoute('/ideas');

    await user.click(screen.getByRole('button', { name: /log out/i }));
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();

    unmount();
    renderAtRoute('/ideas');
    expect(screen.getAllByRole('heading', { name: /sign in/i })[0]).toBeInTheDocument();
  });
});
