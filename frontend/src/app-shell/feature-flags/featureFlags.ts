export type FeatureFlagKey = 'appShell.refresh' | 'ideas.placeholder' | 'knowledge.placeholder';

export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
  if (typeof window !== 'undefined' && window.__APP_FEATURES__?.[flag] !== undefined) {
    return Boolean(window.__APP_FEATURES__[flag]);
  }

  const envKey = `VITE_FEATURE_${flag.replace('.', '_').toUpperCase()}`;
  const envValue = import.meta.env?.[envKey];
  return envValue === 'true';
};
