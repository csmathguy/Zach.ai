import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ThemeProvider,
  ThemeStorageKey,
  resolveInitialTheme,
  useTheme,
  useThemeTokens,
} from '@/app-shell/theme/ThemeProvider';
import { ThemeToggleButton } from '@/app-shell/theme/ThemeToggleButton';
import { darkThemeTokens, lightThemeTokens } from '@/app-shell/theme/theme-tokens';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
};

const ThemeProbe = () => {
  const { theme, preference, resolvedFromSystem } = useTheme();
  return (
    <div
      data-testid="theme-probe"
      data-theme={theme}
      data-preference={preference}
      data-resolved={resolvedFromSystem ? 'yes' : 'no'}
    />
  );
};

const TokensProbe = () => {
  const tokens = useThemeTokens();
  return (
    <div
      data-testid="tokens-probe"
      data-text-primary={tokens.text.primary}
      data-surface={tokens.elevation.surface}
    />
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
  });

  it('respects system preference on first load', () => {
    mockMatchMedia(true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    const probe = screen.getByTestId('theme-probe');
    expect(probe).toHaveAttribute('data-theme', 'dark');
    expect(probe).toHaveAttribute('data-preference', 'system');
    expect(probe).toHaveAttribute('data-resolved', 'yes');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists manual toggle and overrides system preference', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();

    const { unmount } = render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('theme-toggle'));
    expect(localStorage.getItem(ThemeStorageKey)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    unmount();
    cleanup();

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    const probe = screen.getByTestId('theme-probe');
    expect(probe).toHaveAttribute('data-theme', 'light');
    expect(probe).toHaveAttribute('data-preference', 'light');
  });

  it('updates aria state and announcement text on toggle', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('Light');

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('Dark');
  });

  it('falls back deterministically when storage is unavailable', () => {
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    mockMatchMedia(true);
    const initial = resolveInitialTheme();
    expect(initial).toEqual({ theme: 'light', preference: 'system' });
    expect(debugSpy).toHaveBeenCalledTimes(1);

    debugSpy.mockRestore();
  });

  it('swaps token maps when theme changes', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggleButton />
        <TokensProbe />
      </ThemeProvider>
    );

    const tokens = screen.getByTestId('tokens-probe');
    expect(tokens).toHaveAttribute('data-text-primary', lightThemeTokens.text.primary);
    expect(tokens).toHaveAttribute('data-surface', lightThemeTokens.elevation.surface);

    await user.click(screen.getByTestId('theme-toggle'));
    expect(tokens).toHaveAttribute('data-text-primary', darkThemeTokens.text.primary);
    expect(tokens).toHaveAttribute('data-surface', darkThemeTokens.elevation.surface);
  });
});
