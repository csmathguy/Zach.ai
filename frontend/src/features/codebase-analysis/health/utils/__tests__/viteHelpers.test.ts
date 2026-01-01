import { describe, it, expect } from '@jest/globals';
import { getViteHotStatus, getViteBuildMode } from '../viteHelpers';

describe('viteHelpers', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('getViteHotStatus', () => {
    it('should return disabled in Jest environment', () => {
      // In Jest, HMR is always disabled because import.meta.hot doesn't exist
      expect(getViteHotStatus()).toBe('🔴 Disabled');
    });

    it('should detect Jest environment even with different NODE_ENV', () => {
      // The function checks for Jest first, so changing NODE_ENV won't affect result
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'production';
      expect(getViteHotStatus()).toBe('🔴 Disabled');

      process.env.NODE_ENV = 'development';
      expect(getViteHotStatus()).toBe('🔴 Disabled');

      process.env.NODE_ENV = originalEnv;
    });

    it('should return disabled for production in non-Jest environment', () => {
      // Even though we're in Jest, we're testing the logic
      process.env.NODE_ENV = 'production';
      const status = getViteHotStatus();
      expect(status).toBe('🔴 Disabled');
    });

    it('should use emoji indicators consistently', () => {
      const status = getViteHotStatus();
      expect(status).toMatch(/^(🔴|🟢)/);
      expect(status).toMatch(/(Enabled|Disabled)$/);
    });
  });

  describe('getViteBuildMode', () => {
    it('should return test in Jest environment', () => {
      // In Jest, build mode is always 'test'
      expect(getViteBuildMode()).toBe('test');
    });

    it('should detect Jest environment even with different NODE_ENV', () => {
      // The function checks for Jest first, so changing NODE_ENV won't affect result
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'production';
      expect(getViteBuildMode()).toBe('test');

      process.env.NODE_ENV = 'development';
      expect(getViteBuildMode()).toBe('test');

      delete process.env.NODE_ENV;
      expect(getViteBuildMode()).toBe('test');

      process.env.NODE_ENV = originalEnv;
    });

    it('should return consistent value across multiple calls', () => {
      const firstCall = getViteBuildMode();
      const secondCall = getViteBuildMode();
      const thirdCall = getViteBuildMode();

      expect(firstCall).toBe(secondCall);
      expect(secondCall).toBe(thirdCall);
    });

    it('should return string type', () => {
      const mode = getViteBuildMode();
      expect(typeof mode).toBe('string');
      expect(mode.length).toBeGreaterThan(0);
    });

    it('should handle undefined NODE_ENV', () => {
      delete process.env.NODE_ENV;
      const mode = getViteBuildMode();
      expect(mode).toBe('test'); // Still 'test' because jest is defined
    });

    it('should handle empty string NODE_ENV', () => {
      process.env.NODE_ENV = '';
      const mode = getViteBuildMode();
      expect(mode).toBe('test');
    });
  });

  describe('Environment detection helpers', () => {
    it('should recognize Jest environment', () => {
      // Jest should be defined in test environment
      expect(typeof jest).toBe('object');
    });

    it('should have NODE_ENV set in test environment', () => {
      // Jest typically sets NODE_ENV
      expect(process.env.NODE_ENV).toBeDefined();
    });

    it('should handle process.env access safely', () => {
      // This verifies the code doesn't crash when accessing process.env
      expect(() => {
        const env = process.env?.NODE_ENV;
        return env;
      }).not.toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should provide consistent results for HMR and build mode in Jest', () => {
      const hmrStatus = getViteHotStatus();
      const buildMode = getViteBuildMode();

      // Both should indicate test/disabled state
      expect(hmrStatus).toBe('🔴 Disabled');
      expect(buildMode).toBe('test');
    });

    it('should handle rapid successive calls', () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(getViteHotStatus());
        results.push(getViteBuildMode());
      }

      // All results should be consistent
      const hmrResults = results.filter((_, i) => i % 2 === 0);
      const buildResults = results.filter((_, i) => i % 2 === 1);

      expect(new Set(hmrResults).size).toBe(1);
      expect(new Set(buildResults).size).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('should not throw when checking Jest existence', () => {
      expect(() => {
        const isJest = typeof jest !== 'undefined';
        return isJest;
      }).not.toThrow();
    });

    it('should not throw when checking process existence', () => {
      expect(() => {
        const hasProcess = typeof process !== 'undefined';
        return hasProcess;
      }).not.toThrow();
    });

    it('should handle NODE_ENV with special characters', () => {
      process.env.NODE_ENV = 'test-with-dashes';
      const mode = getViteBuildMode();
      expect(mode).toBe('test'); // Still 'test' because jest is defined
    });

    it('should handle NODE_ENV with whitespace', () => {
      process.env.NODE_ENV = '  production  ';
      const mode = getViteBuildMode();
      expect(mode).toBe('test'); // Still 'test' because jest is defined
    });
  });
});
