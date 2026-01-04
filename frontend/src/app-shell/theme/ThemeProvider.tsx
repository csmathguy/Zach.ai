import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

import { darkThemeTokens, lightThemeTokens } from '@/app-shell/theme/theme-tokens';
import {
  readStoredPreference,
  writeStoredPreference,
  ThemeStorageKey,
} from '@/app-shell/theme/theme-storage';
import {
  applyThemeTokens,
  resolveThemeState,
  resolveSystemTheme,
} from '@/app-shell/theme/theme-utils';
import type { ThemeContextValue, ThemeTokens, ThemePreference } from '@/app-shell/theme/types';

export { ThemeStorageKey };

interface ThemeResolution {
  theme: 'light' | 'dark';
  preference: ThemePreference;
  resolvedFromSystem: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  preference: 'light',
  setPreference: () => undefined,
  resolvedFromSystem: false,
});

const ThemeTokensContext = createContext<ThemeTokens>(lightThemeTokens);

export const resolveInitialTheme = (): Pick<ThemeResolution, 'theme' | 'preference'> => {
  const { preference: stored, storageAvailable } = readStoredPreference();

  if (stored === 'light' || stored === 'dark') {
    return { theme: stored, preference: stored };
  }

  if (!storageAvailable) {
    return { theme: 'light', preference: 'system' };
  }

  return { theme: resolveSystemTheme(), preference: 'system' };
};

export const ThemeProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const initial = resolveInitialTheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(initial.preference);
  const themeState = useMemo(() => resolveThemeState(preference), [preference]);
  const tokens = themeState.theme === 'dark' ? darkThemeTokens : lightThemeTokens;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    writeStoredPreference(next);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeState.theme);
    applyThemeTokens(tokens);
  }, [themeState.theme, tokens]);

  return (
    <ThemeContext.Provider
      value={{
        theme: themeState.theme,
        preference: themeState.preference,
        setPreference,
        resolvedFromSystem: themeState.resolvedFromSystem,
      }}
    >
      <ThemeTokensContext.Provider value={tokens}>{children}</ThemeTokensContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
export const useThemeTokens = (): ThemeTokens => useContext(ThemeTokensContext);
