export type FeatureFlagKey = 'ideas.placeholder' | 'knowledge.placeholder';

export const FEATURE_FLAG_DEFAULTS: Record<FeatureFlagKey, boolean> = {
  'ideas.placeholder': true,
  'knowledge.placeholder': true,
};

const getWindowFlagValue = (flag: FeatureFlagKey): boolean | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const value = window.__APP_FEATURES__?.[flag];
  if (value === undefined) {
    return undefined;
  }
  return Boolean(value);
};

const readViteEnv = (): Record<string, string> | undefined => {
  if (typeof Function !== 'function') {
    return undefined;
  }
  try {
    return (Function('return import.meta')() as ImportMeta)?.env as Record<string, string>;
  } catch {
    return undefined;
  }
};

export const getEnvFlagValue = (key: string): string | undefined => {
  const viteEnv = readViteEnv();
  if (viteEnv?.[key] !== undefined) {
    return viteEnv[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key] !== undefined) {
    return process.env[key];
  }
  return undefined;
};

export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
  const windowValue = getWindowFlagValue(flag);
  if (windowValue !== undefined) {
    return windowValue;
  }

  const envKey = `VITE_FEATURE_${flag.replace('.', '_').toUpperCase()}`;
  const envValue = getEnvFlagValue(envKey);
  if (envValue !== undefined) {
    return envValue === 'true';
  }

  return FEATURE_FLAG_DEFAULTS[flag];
};
