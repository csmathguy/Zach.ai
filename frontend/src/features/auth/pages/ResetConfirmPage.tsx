import type { FC, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './AuthPages.module.css';
import { confirmResetToken } from '@/features/auth/api/authApi';

const passwordMeetsPolicy = (value: string): boolean => {
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  const classes = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  return value.length >= 12 && classes >= 3;
};

export const ResetConfirmPage: FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const isMatching = useMemo(
    () => newPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Reset token is required.');
      return;
    }

    if (!passwordMeetsPolicy(newPassword)) {
      setError(
        'Password must be at least 12 characters and include at least three of: uppercase, lowercase, number, and symbol.'
      );
      return;
    }

    if (!isMatching) {
      setError('Passwords must match.');
      return;
    }

    try {
      setStatus('loading');
      await confirmResetToken(token, newPassword);
      navigate('/login', {
        replace: true,
        state: { resetSuccess: true },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed';
      setError(message);
      setStatus('idle');
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.heroTitle}>Set a new password</h1>
        <p className={styles.heroSubtitle}>Enter the reset token provided by your administrator.</p>

        {error ? (
          <div className={styles.errorBanner} role="alert" aria-live="polite">
            {error}
          </div>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="token">
              Reset token
            </label>
            <input
              id="token"
              className={styles.input}
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <span className={styles.inlineNote}>
              Use at least 12 characters and include three of: uppercase, lowercase, number, and
              symbol.
            </span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            {!isMatching && confirmPassword.length > 0 ? (
              <span className={styles.errorText}>Passwords must match.</span>
            ) : null}
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Saving...' : 'Set new password'}
            </button>
            <Link to="/login" className={styles.secondaryLink}>
              Back to login
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};
