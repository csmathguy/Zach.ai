import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AccountPage } from '@/features/auth/pages/AccountPage';
import { fetchProfile, updateProfile } from '@/features/auth/api/accountApi';

const setUserMock = jest.fn();

jest.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', username: 'tester', role: 'USER' },
    setUser: setUserMock,
  }),
}));

jest.mock('@/features/auth/api/accountApi', () => ({
  fetchProfile: jest.fn(),
  updateProfile: jest.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>
  );

describe('AccountPage', () => {
  beforeEach(() => {
    (fetchProfile as jest.Mock).mockReset();
    (updateProfile as jest.Mock).mockReset();
    setUserMock.mockReset();
  });

  it('prefills profile fields and shows role/status as read-only', async () => {
    (fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      username: 'tester',
      email: 'tester@example.com',
      phone: '5551112222',
      name: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
    });

    renderPage();

    expect(await screen.findByDisplayValue('tester')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tester@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5551112222')).toBeInTheDocument();

    expect(screen.getByLabelText(/role/i)).toBeDisabled();
    expect(screen.getByLabelText(/status/i)).toBeDisabled();
  });

  it('updates name without requiring current password', async () => {
    const user = userEvent.setup();
    (fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      username: 'tester',
      email: null,
      phone: null,
      name: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
    });
    (updateProfile as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      username: 'tester',
      email: null,
      phone: null,
      name: 'New Name',
      role: 'USER',
      status: 'ACTIVE',
    });

    renderPage();

    await user.clear(await screen.findByLabelText(/^Name$/i));
    await user.type(screen.getByLabelText(/^Name$/i), 'New Name');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(updateProfile).toHaveBeenCalledWith({ name: 'New Name' });
    expect(await screen.findByText(/profile updated/i)).toBeInTheDocument();
  });

  it('requires current password for email changes', async () => {
    const user = userEvent.setup();
    (fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      username: 'tester',
      email: 'tester@example.com',
      phone: null,
      name: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
    });

    renderPage();

    await user.clear(await screen.findByLabelText(/^Email$/i));
    await user.type(screen.getByLabelText(/^Email$/i), 'new@example.com');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(updateProfile).not.toHaveBeenCalled();
    expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
  });

  it('shows an error when profile fails to load', async () => {
    (fetchProfile as jest.Mock).mockRejectedValueOnce(new Error('Load failed'));

    renderPage();

    expect(await screen.findByText(/load failed/i)).toBeInTheDocument();
  });

  it('shows an error when update fails', async () => {
    const user = userEvent.setup();
    (fetchProfile as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      username: 'tester',
      email: null,
      phone: null,
      name: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
    });
    (updateProfile as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

    renderPage();

    await user.clear(await screen.findByLabelText(/^Name$/i));
    await user.type(screen.getByLabelText(/^Name$/i), 'New Name');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();
  });
});
