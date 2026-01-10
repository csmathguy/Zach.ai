import { describe, it, expect } from '@jest/globals';
import {
  calculateRiskLevelFromPercentage,
  calculateRiskLevel,
  getRiskColorFromPercentage,
  getRiskColor,
  getRiskEmoji,
} from '../coverageThresholds';
import type { CoverageTotals } from '../coverageTypes';

describe('coverageThresholds', () => {
  describe('calculateRiskLevelFromPercentage', () => {
    it('should return high for coverage >= 80%', () => {
      expect(calculateRiskLevelFromPercentage(100)).toBe('high');
      expect(calculateRiskLevelFromPercentage(90)).toBe('high');
      expect(calculateRiskLevelFromPercentage(80)).toBe('high');
    });

    it('should return medium for coverage 60-79%', () => {
      expect(calculateRiskLevelFromPercentage(79)).toBe('medium');
      expect(calculateRiskLevelFromPercentage(70)).toBe('medium');
      expect(calculateRiskLevelFromPercentage(60)).toBe('medium');
    });

    it('should return low for coverage < 60%', () => {
      expect(calculateRiskLevelFromPercentage(59)).toBe('low');
      expect(calculateRiskLevelFromPercentage(40)).toBe('low');
      expect(calculateRiskLevelFromPercentage(0)).toBe('low');
    });
  });

  describe('calculateRiskLevel', () => {
    it('should calculate risk level from average of all metrics', () => {
      const highCoverage: CoverageTotals = {
        statements: 90,
        branches: 85,
        functions: 88,
        lines: 92,
      };
      expect(calculateRiskLevel(highCoverage)).toBe('high');

      const mediumCoverage: CoverageTotals = {
        statements: 70,
        branches: 65,
        functions: 68,
        lines: 72,
      };
      expect(calculateRiskLevel(mediumCoverage)).toBe('medium');

      const lowCoverage: CoverageTotals = {
        statements: 50,
        branches: 45,
        functions: 48,
        lines: 52,
      };
      expect(calculateRiskLevel(lowCoverage)).toBe('low');
    });
  });

  const EXPECTED_COLORS = {
    high: 'var(--color-feedback-success)',
    medium: 'var(--color-feedback-warning)',
    low: 'var(--color-feedback-danger)',
  } as const;

  describe('getRiskColorFromPercentage', () => {
    it('should return the semantic token for high coverage', () => {
      expect(getRiskColorFromPercentage(90)).toBe(EXPECTED_COLORS.high);
    });

    it('should return the semantic token for medium coverage', () => {
      expect(getRiskColorFromPercentage(70)).toBe(EXPECTED_COLORS.medium);
    });

    it('should return the semantic token for low coverage', () => {
      expect(getRiskColorFromPercentage(40)).toBe(EXPECTED_COLORS.low);
    });
  });

  describe('getRiskColor', () => {
    it('should return the semantic token for each risk level', () => {
      expect(getRiskColor('high')).toBe(EXPECTED_COLORS.high);
      expect(getRiskColor('medium')).toBe(EXPECTED_COLORS.medium);
      expect(getRiskColor('low')).toBe(EXPECTED_COLORS.low);
    });
  });

  describe('getRiskEmoji', () => {
    it('should return correct emoji for each risk level', () => {
      expect(getRiskEmoji('high')).toBe('✅');
      expect(getRiskEmoji('medium')).toBe('⚠️');
      expect(getRiskEmoji('low')).toBe('❌');
    });
  });
});
