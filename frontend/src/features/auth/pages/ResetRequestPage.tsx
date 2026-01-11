import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthPages.module.css';
import { requestResetToken } from '@/features/auth/api/authApi';

export const ResetRequestPage: FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifier.trim()) {
      setError('Identifier is required.');
      return;
    }

    try {
      setStatus('loading');
      setError(null);
      await requestResetToken(identifier);
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      setStatus('error');
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.heroTitle}>Request a reset token</h1>
        <p className={styles.heroSubtitle}>
          Enter your username or email to request a reset token.
        </p>

        <div className={styles.banner} role="status">
          Reset delivery is not configured. Contact an administrator for a reset token.
        </div>

        {error ? (
          <div className={styles.errorBanner} role="alert" aria-live="polite">
            {error}
          </div>
        ) : null}

        {status === 'success' ? (
          <div className={styles.successPanel} role="status">
            Request received. An administrator will provide your reset token.
          </div>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="identifier">
              Username or email
            </label>
            <input
              id="identifier"
              className={styles.input}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Requesting...' : 'Request reset token'}
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
