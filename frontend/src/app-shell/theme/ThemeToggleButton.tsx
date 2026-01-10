import { useTheme } from '@/app-shell/theme/ThemeProvider';
import styles from '@/app-shell/theme/ThemeToggleButton.module.css';

export const ThemeToggleButton = (): JSX.Element => {
  const { theme, setPreference } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Dark' : 'Light';

  return (
    <button
      aria-pressed={isDark}
      aria-label="Toggle theme"
      className={styles.button}
      data-testid="theme-toggle"
      type="button"
      onClick={() => setPreference(isDark ? 'light' : 'dark')}
    >
      Theme: {label}
      <span aria-live="polite" className={styles.srOnly}>
        {`${label} theme enabled`}
      </span>
    </button>
  );
};
