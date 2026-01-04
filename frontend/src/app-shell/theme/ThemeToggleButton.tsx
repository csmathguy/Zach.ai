import { useTheme } from '@/app-shell/theme/ThemeProvider';

export const ThemeToggleButton = (): JSX.Element => {
  const { theme, setPreference } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Dark' : 'Light';

  return (
    <button
      aria-pressed={isDark}
      aria-label="Toggle theme"
      data-testid="theme-toggle"
      type="button"
      onClick={() => setPreference(isDark ? 'light' : 'dark')}
    >
      {label}
      <span aria-live="polite">{`${label} theme enabled`}</span>
    </button>
  );
};
