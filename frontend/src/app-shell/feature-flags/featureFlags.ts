export type FeatureFlagKey = 'appShell.refresh' | 'ideas.placeholder' | 'knowledge.placeholder';

export const getEnvFlagValue = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return undefined;
};

export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
  if (typeof window !== 'undefined' && window.__APP_FEATURES__?.[flag] !== undefined) {
    return Boolean(window.__APP_FEATURES__[flag]);
  }

  const envKey = `VITE_FEATURE_${flag.replace('.', '_').toUpperCase()}`;
  const envValue = getEnvFlagValue(envKey);
  return envValue === 'true';
};
