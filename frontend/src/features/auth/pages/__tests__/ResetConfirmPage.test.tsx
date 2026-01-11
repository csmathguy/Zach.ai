import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResetConfirmPage } from '@/features/auth/pages/ResetConfirmPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { confirmResetToken } from '@/features/auth/api/authApi';

jest.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

jest.mock('@/features/auth/api/authApi', () => ({
  confirmResetToken: jest.fn(),
}));

const renderPage = (entry = '/reset/confirm') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/reset/confirm" element={<ResetConfirmPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('ResetConfirmPage', () => {
  beforeEach(() => {
    (confirmResetToken as jest.Mock).mockReset();
  });

  it('prefills token from query string', () => {
    renderPage('/reset/confirm?token=token-123');

    expect(screen.getByLabelText(/reset token/i)).toHaveValue('token-123');
  });

  it('requires token to submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/new password/i), 'ValidPass12!');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass12!');
    await user.click(screen.getByRole('button', { name: /set new password/i }));
    const form = screen.getByRole('button', { name: /set new password/i }).closest('form');
    if (!form) {
      throw new Error('Reset confirmation form not found');
    }
    fireEvent.submit(form);

    expect(await screen.findByText(/reset token is required/i)).toBeInTheDocument();
  });

  it('enforces password policy', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/reset token/i), 'token-123');
    await user.type(screen.getByLabelText(/new password/i), 'short');
    await user.type(screen.getByLabelText(/confirm password/i), 'short');
    await user.click(screen.getByRole('button', { name: /set new password/i }));

    expect(
      screen.getByText(/password must be at least 12 characters and include at least three of/i)
    ).toBeInTheDocument();
  });

  it('requires matching passwords', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/reset token/i), 'token-123');
    await user.type(screen.getByLabelText(/new password/i), 'ValidPass12!');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass12?');
    await user.click(screen.getByRole('button', { name: /set new password/i }));

    const mismatchMessages = await screen.findAllByText(/passwords must match/i);
    expect(mismatchMessages.length).toBeGreaterThan(0);
  });

  it('redirects to login with notice when reset succeeds', async () => {
    const user = userEvent.setup();
    (confirmResetToken as jest.Mock).mockResolvedValueOnce(undefined);
    renderPage();

    await user.type(screen.getByLabelText(/reset token/i), 'token-123');
    await user.type(screen.getByLabelText(/new password/i), 'ValidPass12!');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass12!');
    await user.click(screen.getByRole('button', { name: /set new password/i }));

    expect(
      await screen.findByText(/password reset complete\. please sign in/i)
    ).toBeInTheDocument();
  });
});
