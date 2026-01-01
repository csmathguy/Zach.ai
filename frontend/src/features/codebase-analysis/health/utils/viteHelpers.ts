/**
 * Vite-specific helpers that are Jest-compatible
 *
 * These helpers check for Vite features without using import.meta directly,
 * which would cause parse errors in Jest.
 */

// Safe environment check that works in both browser and Jest
const getNodeEnv = (): string => {
  // In Jest/Node environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  // Default for browser
  return 'development';
};

const isJestEnvironment = (): boolean => {
  return typeof jest !== 'undefined' || getNodeEnv() === 'test';
};

/**
 * Check if Vite Hot Module Replacement is enabled
 * Returns static value in test environments
 */
export const getViteHotStatus = (): string => {
  // In test environment (Jest), just return disabled
  if (isJestEnvironment()) {
    return '🔴 Disabled';
  }

  // In production build, HMR is disabled
  if (getNodeEnv() === 'production') {
    return '🔴 Disabled';
  }

  // In development, we can't safely check import.meta without causing parse errors
  // So we'll just indicate it's in dev mode
  return '🟢 Enabled';
};

/**
 * Get the build mode from environment
 * Returns 'test' in Jest environments
 */
export const getViteBuildMode = (): string => {
  // In test environment
  if (isJestEnvironment()) {
    return 'test';
  }

  // Use NODE_ENV as fallback
  return getNodeEnv();
};
