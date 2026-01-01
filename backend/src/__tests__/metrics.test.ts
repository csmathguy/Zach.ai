import { formatUptime, calculateAverage } from '../utils/metrics';

describe('Metrics Utilities', () => {
  describe('formatUptime', () => {
    it('should format seconds', () => {
      expect(formatUptime(5000)).toBe('5s');
    });

    it('should format minutes', () => {
      expect(formatUptime(125000)).toBe('2m 5s');
    });

    it('should format hours', () => {
      expect(formatUptime(7325000)).toBe('2h 2m');
    });

    it('should format days', () => {
      expect(formatUptime(90000000)).toBe('1d 1h');
    });
  });

  describe('calculateAverage', () => {
    it('should return 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });

    it('should calculate average of numbers', () => {
      expect(calculateAverage([10, 20, 30])).toBe(20);
    });

    it('should handle decimal averages', () => {
      expect(calculateAverage([1, 2, 3])).toBeCloseTo(2, 2);
    });

    it('should handle single value', () => {
      expect(calculateAverage([42])).toBe(42);
    });
  });
});
