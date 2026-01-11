import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ResetRequestPage } from '@/features/auth/pages/ResetRequestPage';
import { requestResetToken } from '@/features/auth/api/authApi';

jest.mock('@/features/auth/api/authApi', () => ({
  requestResetToken: jest.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ResetRequestPage />
    </MemoryRouter>
  );

describe('ResetRequestPage', () => {
  beforeEach(() => {
    (requestResetToken as jest.Mock).mockReset();
  });

  it('shows warning banner', () => {
    renderPage();

    expect(screen.getByText(/reset delivery is not configured/i)).toBeInTheDocument();
  });

  it('validates identifier input', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /request reset token/i }));
    const form = screen.getByRole('button', { name: /request reset token/i }).closest('form');
    if (!form) {
      throw new Error('Reset request form not found');
    }
    fireEvent.submit(form);

    expect(await screen.findByText(/identifier is required/i)).toBeInTheDocument();
  });

  it('shows success message after request', async () => {
    const user = userEvent.setup();
    (requestResetToken as jest.Mock).mockResolvedValueOnce(undefined);
    renderPage();

    await user.type(screen.getByLabelText(/username or email/i), 'tester');
    await user.click(screen.getByRole('button', { name: /request reset token/i }));

    expect(await screen.findByText(/request received/i)).toBeInTheDocument();
  });

  it('shows error banner on failure', async () => {
    const user = userEvent.setup();
    (requestResetToken as jest.Mock).mockRejectedValueOnce(new Error('Request failed'));
    renderPage();

    await user.type(screen.getByLabelText(/username or email/i), 'tester');
    await user.click(screen.getByRole('button', { name: /request reset token/i }));

    expect(await screen.findByText(/request failed/i)).toBeInTheDocument();
  });
});
