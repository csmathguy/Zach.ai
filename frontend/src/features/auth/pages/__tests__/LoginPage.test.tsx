import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';

const loginMock = jest.fn();

jest.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

const renderLogin = (initialEntry = '/login') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/ideas" element={<div>Ideas page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders login form fields', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation messages when fields are empty', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/identifier is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('redirects to ideas on successful login', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({ id: 'user-1', username: 'tester', role: 'USER' });
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), 'tester');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith('tester', 'password');
    expect(await screen.findByText(/ideas page/i)).toBeInTheDocument();
  });

  it('shows lockout message on locked response', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValueOnce(new Error('Account locked'));
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), 'tester');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/account locked\. try again later/i)).toBeInTheDocument();
  });

  it('shows reset success notice when navigated from reset flow', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { resetSuccess: true } }]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/password reset complete\. please sign in/i)).toBeInTheDocument();
  });
});
