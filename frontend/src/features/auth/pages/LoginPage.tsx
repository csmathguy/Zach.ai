import type { FC, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './AuthPages.module.css';
import { useAuth } from '@/features/auth/AuthContext';

interface FieldErrors {
  identifier?: string;
  password?: string;
}

export const LoginPage: FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetSuccess = useMemo(() => {
    const state = location.state as { resetSuccess?: boolean } | null;
    return state?.resetSuccess ?? false;
  }, [location.state]);

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? '/ideas';
  }, [location.state]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!identifier.trim()) {
      next.identifier = 'Identifier is required.';
    }
    if (!password.trim()) {
      next.password = 'Password is required.';
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      await auth.login(identifier, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setFormError(message.includes('locked') ? 'Account locked. Try again later.' : message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.heroTitle}>Sign in</h1>
        <p className={styles.heroSubtitle}>Use your username or email to continue.</p>

        {formError ? (
          <div className={styles.errorBanner} role="alert" aria-live="polite">
            {formError}
          </div>
        ) : null}
        {resetSuccess ? (
          <div className={styles.successPanel} role="status" aria-live="polite">
            Password reset complete. Please sign in with your new password.
          </div>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="identifier">
              Username or email
            </label>
            <input
              id="identifier"
              className={styles.input}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              onBlur={() => handleBlur('identifier')}
              autoComplete="username"
              required
            />
            {errors.identifier ? (
              <span className={styles.errorText}>{errors.identifier}</span>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="current-password"
              required
            />
            {errors.password ? <span className={styles.errorText}>{errors.password}</span> : null}
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <Link to="/reset" className={styles.secondaryLink}>
              Need a reset token?
            </Link>
            <Link to="/reset/confirm" className={styles.secondaryLink}>
              Have a reset token?
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};
