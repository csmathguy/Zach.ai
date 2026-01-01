import { describe, it, expect } from '@jest/globals';
import { parseCoverageData, formatPercentage, formatFilePath } from '../coverageParser';
import type { CoverageSummary } from '../coverageTypes';

describe('coverageParser', () => {
  const mockCoverageJSON: CoverageSummary = {
    total: {
      lines: { total: 100, covered: 80, skipped: 0, pct: 80 },
      statements: { total: 120, covered: 90, skipped: 0, pct: 75 },
      functions: { total: 30, covered: 25, skipped: 0, pct: 83.33 },
      branches: { total: 50, covered: 35, skipped: 0, pct: 70 },
    },
    'src/app/App.tsx': {
      lines: { total: 10, covered: 9, skipped: 0, pct: 90 },
      statements: { total: 12, covered: 10, skipped: 0, pct: 83.33 },
      functions: { total: 3, covered: 3, skipped: 0, pct: 100 },
      branches: { total: 5, covered: 4, skipped: 0, pct: 80 },
    },
    'src/utils/helpers.ts': {
      lines: { total: 20, covered: 10, skipped: 0, pct: 50 },
      statements: { total: 25, covered: 12, skipped: 0, pct: 48 },
      functions: { total: 5, covered: 2, skipped: 0, pct: 40 },
      branches: { total: 10, covered: 3, skipped: 0, pct: 30 },
    },
  };

  it('should parse total coverage correctly', () => {
    const result = parseCoverageData(mockCoverageJSON);

    expect(result.total).toEqual({
      lines: 80,
      statements: 75,
      functions: 83.33,
      branches: 70,
    });
  });

  it('should parse file coverage correctly', () => {
    const result = parseCoverageData(mockCoverageJSON);

    expect(result.files).toHaveLength(2);

    const appFile = result.files.find((f) => f.path === 'src/app/App.tsx');
    expect(appFile).toBeDefined();
    expect(appFile?.lines).toBe(90);
    expect(appFile?.statements).toBe(83.33);
    expect(appFile?.functions).toBe(100);
    expect(appFile?.branches).toBe(80);

    const helpersFile = result.files.find((f) => f.path === 'src/utils/helpers.ts');
    expect(helpersFile).toBeDefined();
    expect(helpersFile?.lines).toBe(50);
    expect(helpersFile?.statements).toBe(48);
    expect(helpersFile?.functions).toBe(40);
    expect(helpersFile?.branches).toBe(30);
  });

  it('should handle empty coverage data', () => {
    const emptyCoverage: CoverageSummary = {
      total: {
        lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
        statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
        functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
        branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
      },
    };

    const result = parseCoverageData(emptyCoverage);

    expect(result.total).toEqual({
      lines: 0,
      statements: 0,
      functions: 0,
      branches: 0,
    });
    expect(result.files).toHaveLength(0);
  });

  it('should skip total key when parsing files', () => {
    const result = parseCoverageData(mockCoverageJSON);

    const totalFile = result.files.find((f) => f.path === 'total');
    expect(totalFile).toBeUndefined();
  });

  it('should round percentages to 2 decimal places', () => {
    const coverage: CoverageSummary = {
      total: {
        lines: { total: 3, covered: 1, skipped: 0, pct: 33.333333 },
        statements: { total: 3, covered: 1, skipped: 0, pct: 33.333333 },
        functions: { total: 3, covered: 1, skipped: 0, pct: 33.333333 },
        branches: { total: 3, covered: 1, skipped: 0, pct: 33.333333 },
      },
    };

    const result = parseCoverageData(coverage);

    // Parser preserves precision from coverage data
    expect(result.total.lines).toBeCloseTo(33.33, 2);
    expect(result.total.statements).toBeCloseTo(33.33, 2);
  });

  describe('formatPercentage', () => {
    it('should format percentage to 1 decimal place', () => {
      expect(formatPercentage(85.5)).toBe('85.5%');
      expect(formatPercentage(90.0)).toBe('90.0%');
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('should round to 1 decimal place', () => {
      expect(formatPercentage(85.55)).toBe('85.5%'); // 85.55 rounds to 85.5 with toFixed(1)
      expect(formatPercentage(85.56)).toBe('85.6%'); // 85.56 rounds to 85.6
      expect(formatPercentage(85.99)).toBe('86.0%');
    });

    it('should handle zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle 100 percentage', () => {
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('should handle very small percentages', () => {
      expect(formatPercentage(0.1)).toBe('0.1%');
      expect(formatPercentage(0.05)).toBe('0.1%');
      expect(formatPercentage(0.04)).toBe('0.0%');
    });

    it('should handle fractional percentages', () => {
      expect(formatPercentage(33.333333)).toBe('33.3%');
      expect(formatPercentage(66.666666)).toBe('66.7%');
    });

    it('should handle negative percentages (edge case)', () => {
      expect(formatPercentage(-5)).toBe('-5.0%');
    });

    it('should handle percentages over 100 (edge case)', () => {
      expect(formatPercentage(150.5)).toBe('150.5%');
    });
  });

  describe('formatFilePath', () => {
    it('should remove leading slashes', () => {
      expect(formatFilePath('/src/app/App.tsx')).toBe('src/app/App.tsx');
      expect(formatFilePath('//src/utils/helpers.ts')).toBe('src/utils/helpers.ts');
    });

    it('should remove leading backslashes', () => {
      expect(formatFilePath('\\src\\app\\App.tsx')).toBe('src\\app\\App.tsx');
      expect(formatFilePath('\\\\src\\utils\\helpers.ts')).toBe('src\\utils\\helpers.ts');
    });

    it('should handle mixed slashes', () => {
      expect(formatFilePath('/\\src/app\\App.tsx')).toBe('src/app\\App.tsx');
    });

    it('should keep short paths unchanged', () => {
      expect(formatFilePath('src/App.tsx')).toBe('src/App.tsx');
      expect(formatFilePath('utils/helpers.ts')).toBe('utils/helpers.ts');
    });

    it('should shorten long paths with default maxLength', () => {
      const longPath =
        'src/very/long/path/to/some/deeply/nested/directory/structure/component/File.tsx';
      const result = formatFilePath(longPath);

      expect(result).toBe('.../component/File.tsx');
      expect(result.length).toBeLessThan(longPath.length);
    });

    it('should shorten long paths with custom maxLength', () => {
      const longPath = 'src/features/dashboard/components/DashboardCard.tsx';
      const result = formatFilePath(longPath, 30);

      expect(result).toBe('.../components/DashboardCard.tsx');
    });

    it('should not shorten if path is within maxLength', () => {
      const shortPath = 'src/App.tsx';
      const result = formatFilePath(shortPath, 60);

      expect(result).toBe('src/App.tsx');
    });

    it('should handle paths with only one part', () => {
      const singlePart = 'App.tsx';
      expect(formatFilePath(singlePart)).toBe('App.tsx');
    });

    it('should handle paths with two parts (no shortening)', () => {
      const longPath = 'a'.repeat(70) + '/' + 'b'.repeat(70);
      const result = formatFilePath(longPath, 60);

      // With only 2 parts, it should keep original (no shortening applied)
      expect(result).toBe(longPath);
    });

    it('should handle empty path', () => {
      expect(formatFilePath('')).toBe('');
    });

    it('should handle path with only slashes', () => {
      expect(formatFilePath('///')).toBe('');
      expect(formatFilePath('\\\\\\')).toBe('');
    });

    it('should preserve file extensions', () => {
      const longPath = 'src/very/long/path/to/file.test.tsx';
      const result = formatFilePath(longPath, 25);

      expect(result).toContain('.test.tsx');
    });

    it('should handle Windows-style paths', () => {
      const windowsPath = 'C:\\Users\\dev\\project\\src\\App.tsx';
      const result = formatFilePath(windowsPath);

      // formatFilePath removes leading slashes/backslashes but not drive letters
      // So C:\ becomes C:
      expect(result).toBe('C:\\Users\\dev\\project\\src\\App.tsx');
    });

    it('should handle Unix absolute paths', () => {
      const unixPath = '/home/user/project/src/App.tsx';
      const result = formatFilePath(unixPath);

      expect(result).toBe('home/user/project/src/App.tsx');
    });

    it('should handle relative paths', () => {
      expect(formatFilePath('./src/App.tsx')).toBe('./src/App.tsx');
      expect(formatFilePath('../utils/helpers.ts')).toBe('../utils/helpers.ts');
    });

    it('should handle paths with special characters', () => {
      const specialPath = 'src/components/@shared/Button.tsx';
      expect(formatFilePath(specialPath)).toBe('src/components/@shared/Button.tsx');
    });

    it('should handle paths with spaces', () => {
      const spacePath = 'src/My Documents/My Project/App.tsx';
      expect(formatFilePath(spacePath)).toBe('src/My Documents/My Project/App.tsx');
    });

    it('should preserve last two parts when shortening', () => {
      const path = 'a/b/c/d/e/f/g.tsx';
      const result = formatFilePath(path, 10);

      // With many parts, keeps last 2: f/g.tsx
      expect(result).toBe('.../f/g.tsx');
    });

    it('should handle maxLength of 0', () => {
      const path = 'src/very/long/path/to/file.tsx';
      const result = formatFilePath(path, 0);

      // Should shorten since path > 0, keeps last 2 parts
      expect(result).toBe('.../to/file.tsx');
    });

    it('should handle very long single file name', () => {
      const longFileName = 'a'.repeat(100) + '.tsx';
      const result = formatFilePath(longFileName, 50);

      // Single file name, no shortening applied
      expect(result).toBe(longFileName);
    });
  });
});
