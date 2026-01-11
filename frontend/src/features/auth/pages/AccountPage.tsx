import { useEffect, useMemo, useState } from 'react';
import styles from './AccountPage.module.css';
import { fetchProfile, updateProfile, type AccountProfile } from '@/features/auth/api/accountApi';
import { useAuth } from '@/features/auth/AuthContext';

interface FormState {
  username: string;
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
}

const toFormState = (profile: AccountProfile): FormState => ({
  username: profile.username,
  name: profile.name,
  email: profile.email ?? '',
  phone: profile.phone ?? '',
  currentPassword: '',
});

const normalizeValue = (value: string): string => value.trim();

export const AccountPage = (): JSX.Element => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [formState, setFormState] = useState<FormState>({
    username: '',
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        const result = await fetchProfile();
        if (!active) return;
        setProfile(result);
        setFormState(toFormState(result));
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const hasSensitiveChanges = useMemo(() => {
    if (!profile) return false;
    return (
      normalizeValue(formState.username) !== profile.username ||
      normalizeValue(formState.email) !== (profile.email ?? '') ||
      normalizeValue(formState.phone) !== (profile.phone ?? '')
    );
  }, [formState, profile]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!profile) return;

    const nextUsername = normalizeValue(formState.username);
    const nextName = normalizeValue(formState.name);
    const nextEmail = normalizeValue(formState.email);
    const nextPhone = normalizeValue(formState.phone);

    if (!nextUsername) {
      setError('Username is required.');
      return;
    }

    if (!nextName) {
      setError('Name is required.');
      return;
    }

    const updates: Record<string, string | null> = {};
    if (nextUsername !== profile.username) updates.username = nextUsername;
    if (nextName !== profile.name) updates.name = nextName;
    if (nextEmail !== (profile.email ?? '')) updates.email = nextEmail || null;
    if (nextPhone !== (profile.phone ?? '')) updates.phone = nextPhone || null;

    if (Object.keys(updates).length === 0) {
      setNotice('No changes to save.');
      return;
    }

    if (hasSensitiveChanges && !normalizeValue(formState.currentPassword)) {
      setError('Current password is required for this change.');
      return;
    }

    try {
      const updated = await updateProfile({
        ...updates,
        currentPassword: hasSensitiveChanges
          ? normalizeValue(formState.currentPassword)
          : undefined,
      });
      setProfile(updated);
      setFormState(toFormState(updated));
      setNotice('Profile updated.');

      if (user && user.username !== updated.username) {
        setUser({ ...user, username: updated.username });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
    }
  };

  const handleReset = () => {
    if (!profile) return;
    setFormState(toFormState(profile));
    setError(null);
    setNotice(null);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading account details...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>My account</h1>
        <p>Update your personal information and keep your account current.</p>
      </header>

      <div className={styles.warning} role="status">
        Email verification is not configured yet. Email changes take effect immediately.
      </div>

      {notice ? <div className={styles.notice}>{notice}</div> : null}
      {error ? <div className={styles.error}>{error}</div> : null}

      <section className={styles.section}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              value={formState.username}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, username: event.target.value }))
              }
              required
            />
          </label>

          <label className={styles.label}>
            Name
            <input
              className={styles.input}
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>

          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label className={styles.label}>
            Phone
            <input
              className={styles.input}
              value={formState.phone}
              onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </label>

          <label className={styles.label}>
            Role
            <input className={styles.input} value={profile?.role ?? ''} disabled />
          </label>

          <label className={styles.label}>
            Status
            <input className={styles.input} value={profile?.status ?? ''} disabled />
          </label>

          <label className={styles.label}>
            Current password
            <input
              className={styles.input}
              type="password"
              value={formState.currentPassword}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, currentPassword: event.target.value }))
              }
            />
            <span className={styles.helperText}>
              Required when changing username, email, or phone.
            </span>
          </label>

          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} type="submit">
              Save changes
            </button>
            <button className={styles.secondaryButton} type="button" onClick={handleReset}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
