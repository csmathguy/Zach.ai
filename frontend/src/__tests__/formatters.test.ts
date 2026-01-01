import { formatResponseTime, formatMemory, isHealthy } from '../utils/formatters';

describe('Formatter Utilities', () => {
  describe('formatResponseTime', () => {
    it('should format sub-millisecond times', () => {
      expect(formatResponseTime(0.5)).toBe('< 1ms');
    });

    it('should format milliseconds', () => {
      expect(formatResponseTime(123)).toBe('123ms');
    });

    it('should format seconds', () => {
      expect(formatResponseTime(1500)).toBe('1.50s');
    });

    it('should round milliseconds', () => {
      expect(formatResponseTime(123.7)).toBe('124ms');
    });
  });

  describe('formatMemory', () => {
    it('should format bytes to MB', () => {
      const bytes = 10 * 1024 * 1024; // 10 MB
      expect(formatMemory(bytes)).toBe('10.00 MB');
    });

    it('should handle decimal MB values', () => {
      const bytes = 15.5 * 1024 * 1024; // 15.5 MB
      expect(formatMemory(bytes)).toBe('15.50 MB');
    });

    it('should handle small byte values', () => {
      expect(formatMemory(1024)).toBe('0.00 MB');
    });
  });

  describe('isHealthy', () => {
    it('should return true for ok status', () => {
      expect(isHealthy('ok')).toBe(true);
    });

    it('should return false for error status', () => {
      expect(isHealthy('error')).toBe(false);
    });

    it('should return false for empty status', () => {
      expect(isHealthy('')).toBe(false);
    });
  });
});
