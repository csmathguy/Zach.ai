import type { ThemePreference } from '@/app-shell/theme/types';

export const ThemeStorageKey = 'app-shell-theme-preference';

let storageWarningLogged = false;

const warnStorageUnavailable = (error: unknown): void => {
  if (storageWarningLogged) {
    return;
  }
  storageWarningLogged = true;
  console.debug('Theme storage unavailable; falling back to defaults.', error);
};

export const readStoredPreference = (): {
  preference: ThemePreference | null;
  storageAvailable: boolean;
} => {
  try {
    const stored = localStorage.getItem(ThemeStorageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return { preference: stored, storageAvailable: true };
    }
    return { preference: null, storageAvailable: true };
  } catch (error) {
    warnStorageUnavailable(error);
    return { preference: null, storageAvailable: false };
  }
};

export const writeStoredPreference = (preference: ThemePreference): void => {
  try {
    localStorage.setItem(ThemeStorageKey, preference);
  } catch (error) {
    warnStorageUnavailable(error);
  }
};
