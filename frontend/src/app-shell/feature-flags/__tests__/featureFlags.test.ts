import { afterEach, describe, expect, it } from '@jest/globals';

import { FEATURE_FLAG_DEFAULTS, isFeatureEnabled } from '@/app-shell/feature-flags/featureFlags';

describe('feature flag helper', () => {
  afterEach(() => {
    delete window.__APP_FEATURES__;
    delete process.env.VITE_FEATURE_APPSHELL_REFRESH;
    delete process.env.VITE_FEATURE_KNOWLEDGE_PLACEHOLDER;
  });

  it('falls back to defaults when no overrides exist', () => {
    expect(isFeatureEnabled('knowledge.placeholder')).toBe(
      FEATURE_FLAG_DEFAULTS['knowledge.placeholder']
    );
    expect(isFeatureEnabled('ideas.placeholder')).toBe(FEATURE_FLAG_DEFAULTS['ideas.placeholder']);
  });

  it('prefers window-provided overrides', () => {
    window.__APP_FEATURES__ = { 'knowledge.placeholder': false };
    expect(isFeatureEnabled('knowledge.placeholder')).toBe(false);
  });

  it('uses env overrides when provided', () => {
    process.env.VITE_FEATURE_KNOWLEDGE_PLACEHOLDER = 'false';
    expect(isFeatureEnabled('knowledge.placeholder')).toBe(false);

    process.env.VITE_FEATURE_KNOWLEDGE_PLACEHOLDER = 'true';
    delete window.__APP_FEATURES__;
    expect(isFeatureEnabled('knowledge.placeholder')).toBe(true);
  });
});
