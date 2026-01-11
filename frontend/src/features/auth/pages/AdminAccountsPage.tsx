import type { FC, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import styles from './AdminAccountsPage.module.css';
import type { AuthRole } from '@/features/auth/types';
import {
  createUser,
  fetchUsers,
  issueResetToken,
  type AdminUserSummary,
} from '@/features/auth/api/adminApi';

const defaultRole: AuthRole = 'USER';

export const AdminAccountsPage: FC = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formState, setFormState] = useState<{
    username: string;
    name: string;
    email: string;
    role: AuthRole;
  }>({
    username: '',
    name: '',
    email: '',
    role: defaultRole,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchUsers();
      setUsers(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setError(null);

    if (!formState.username.trim() || !formState.name.trim()) {
      setError('Username and name are required.');
      return;
    }

    try {
      const result = await createUser({
        username: formState.username.trim(),
        name: formState.name.trim(),
        email: formState.email.trim() || undefined,
        role: formState.role,
      });
      setNotice(`Reset token issued: ${result.resetToken}`);
      setFormState({ username: '', name: '', email: '', role: defaultRole });
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
    }
  };

  const handleReset = async (userId: string) => {
    setNotice(null);
    setError(null);
    try {
      const result = await issueResetToken(userId);
      setNotice(`Reset token issued: ${result.resetToken}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to issue reset token';
      setError(message);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Account Management</h1>
        <p>Manage users, roles, and reset tokens.</p>
      </header>

      {notice ? <div className={styles.notice}>{notice}</div> : null}
      {error ? <div className={styles.error}>{error}</div> : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Users</h2>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>No users yet.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.email ?? '-'}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => handleReset(user.id)}
                      >
                        Issue reset token
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Create user</h2>
          <p className={styles.helperText}>
            New users receive a reset token to set their password.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              value={formState.username}
              onChange={(event) => setFormState({ ...formState, username: event.target.value })}
              required
            />
          </label>
          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              required
            />
          </label>
          <label className={styles.label}>
            Email (optional)
            <input
              className={styles.input}
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
            />
          </label>
          <label className={styles.label}>
            Role
            <select
              className={styles.select}
              value={formState.role}
              onChange={(event) =>
                setFormState({ ...formState, role: event.target.value as AuthRole })
              }
            >
              <option value="USER">User</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </label>

          <button className={styles.primaryButton} type="submit">
            Create user
          </button>
        </form>
      </section>
    </div>
  );
};
