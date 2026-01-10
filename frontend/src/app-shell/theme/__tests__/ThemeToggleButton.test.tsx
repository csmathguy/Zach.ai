import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { ThemeToggleButton } from '@/app-shell/theme/ThemeToggleButton';
import { ThemeStorageKey } from '@/app-shell/theme/theme-storage';

const createMediaQueryList = (matches: boolean, query: string): MediaQueryList =>
  ({
    matches,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
  }) as MediaQueryList;

const mockMatchMedia = (matches: boolean) => {
  const mockedMatchMedia = jest
    .fn<(query: string) => MediaQueryList>()
    .mockImplementation((query: string) => createMediaQueryList(matches, query));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockedMatchMedia,
  });
};

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
  });

  it('renders current theme state with aria attributes', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('Light');
    expect(button).toHaveTextContent('Light theme enabled');
  });

  it('toggles theme and persists preference', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('theme-toggle'));

    const button = screen.getByTestId('theme-toggle');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('Dark');
    expect(localStorage.getItem(ThemeStorageKey)).toBe('dark');
  });
});
