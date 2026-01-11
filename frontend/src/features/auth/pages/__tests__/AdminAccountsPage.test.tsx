import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AdminAccountsPage } from '@/features/auth/pages/AdminAccountsPage';
import { createUser, fetchUsers, issueResetToken } from '@/features/auth/api/adminApi';

jest.mock('@/features/auth/api/adminApi', () => ({
  fetchUsers: jest.fn(),
  createUser: jest.fn(),
  issueResetToken: jest.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminAccountsPage />
    </MemoryRouter>
  );

describe('AdminAccountsPage', () => {
  beforeEach(() => {
    (fetchUsers as jest.Mock).mockReset();
    (createUser as jest.Mock).mockReset();
    (issueResetToken as jest.Mock).mockReset();
  });

  it('renders empty state when no users', async () => {
    (fetchUsers as jest.Mock).mockResolvedValueOnce([]);
    renderPage();

    expect(await screen.findByText(/no users yet/i)).toBeInTheDocument();
  });

  it('creates a user and shows reset token notice', async () => {
    const user = userEvent.setup();
    (fetchUsers as jest.Mock).mockResolvedValueOnce([]);
    (createUser as jest.Mock).mockResolvedValueOnce({ userId: 'user-1', resetToken: 'token-1' });
    (fetchUsers as jest.Mock).mockResolvedValueOnce([
      {
        id: 'user-1',
        username: 'new-user',
        name: 'New User',
        email: 'new-user@example.com',
        role: 'USER',
        status: 'ACTIVE',
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      },
    ]);

    renderPage();

    await user.type(screen.getByLabelText('Username'), 'new-user');
    await user.type(screen.getByLabelText('Name'), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new-user@example.com');
    await user.click(screen.getByRole('button', { name: /create user/i }));

    expect(await screen.findByText(/reset token issued/i)).toBeInTheDocument();
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'new-user', name: 'New User' })
    );
  });

  it('issues reset token from user list', async () => {
    const user = userEvent.setup();
    (fetchUsers as jest.Mock).mockResolvedValueOnce([
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
    ]);
    (issueResetToken as jest.Mock).mockResolvedValueOnce({ resetToken: 'token-2' });

    renderPage();

    await screen.findByText('tester');
    await user.click(screen.getByRole('button', { name: /issue reset token/i }));

    expect(await screen.findByText(/reset token issued/i)).toBeInTheDocument();
    expect(issueResetToken).toHaveBeenCalledWith('user-1');
  });
});
