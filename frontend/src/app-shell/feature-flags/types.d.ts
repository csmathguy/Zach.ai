import type { FeatureFlagKey } from './featureFlags';

declare global {
  interface Window {
    __APP_FEATURES__?: Partial<Record<FeatureFlagKey, boolean>>;
  }
}

export {};
