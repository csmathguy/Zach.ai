import type { ThemePreference, ThemeTokens } from '@/app-shell/theme/types';

export const resolveSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyThemeTokens = (tokens: ThemeTokens): void => {
  const root = document.documentElement;
  root.style.setProperty('--color-surface', tokens.elevation.surface);
  root.style.setProperty('--color-panel', tokens.elevation.panel);
  root.style.setProperty('--color-sunken', tokens.elevation.sunken);
  root.style.setProperty('--color-text-primary', tokens.text.primary);
  root.style.setProperty('--color-text-secondary', tokens.text.secondary);
  root.style.setProperty('--color-text-accent', tokens.text.accent);
  root.style.setProperty('--color-text-inverted', tokens.text.inverted);
  root.style.setProperty('--color-brand-heart', tokens.brand.heart);
  root.style.setProperty('--color-brand-brain', tokens.brand.brain);
  root.style.setProperty('--color-brand-bulb', tokens.brand.bulb);
  root.style.setProperty('--color-feedback-success', tokens.feedback.success);
  root.style.setProperty('--color-feedback-warning', tokens.feedback.warning);
  root.style.setProperty('--color-feedback-danger', tokens.feedback.danger);
  root.style.setProperty('--radius-base', tokens.borderRadius);
  root.style.setProperty('--spacing-unit', `${tokens.spacingUnit}`);
};

export const resolveThemeState = (
  preference: ThemePreference
): { theme: 'light' | 'dark'; preference: ThemePreference; resolvedFromSystem: boolean } => {
  if (preference === 'system') {
    return {
      theme: resolveSystemTheme(),
      preference,
      resolvedFromSystem: true,
    };
  }

  return {
    theme: preference,
    preference,
    resolvedFromSystem: false,
  };
};
