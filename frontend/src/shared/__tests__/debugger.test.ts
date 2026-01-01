import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { DEBUGGER } from '../debugger';

describe('debugger', () => {
  let consoleSpy: {
    log: jest.SpiedFunction<typeof console.log>;
    info: jest.SpiedFunction<typeof console.info>;
    warn: jest.SpiedFunction<typeof console.warn>;
    error: jest.SpiedFunction<typeof console.error>;
  };

  beforeEach(() => {
    // Mock console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {
        // Mock implementation
      }),
      info: jest.spyOn(console, 'info').mockImplementation(() => {
        // Mock implementation
      }),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {
        // Mock implementation
      }),
      error: jest.spyOn(console, 'error').mockImplementation(() => {
        // Mock implementation
      }),
    };

    // Enable debugger by default for testing
    DEBUGGER.setEnabled(true);
  });

  afterEach(() => {
    // Restore all mocks
    consoleSpy.log.mockRestore();
    consoleSpy.info.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('DEBUGGER.enabled', () => {
    it('should expose enabled property', () => {
      expect(typeof DEBUGGER.enabled).toBe('boolean');
    });

    it('should reflect current enabled state', () => {
      DEBUGGER.setEnabled(true);
      expect(DEBUGGER.enabled).toBe(true);

      DEBUGGER.setEnabled(false);
      expect(DEBUGGER.enabled).toBe(false);
    });
  });

  describe('DEBUGGER.setEnabled', () => {
    it('should enable debug logging', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.log('test message');

      expect(consoleSpy.log).toHaveBeenCalledWith('[APP]', 'test message');
    });

    it('should disable debug logging', () => {
      DEBUGGER.setEnabled(false);
      DEBUGGER.log('test message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should toggle between enabled and disabled', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.log('message 1');
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);

      consoleSpy.log.mockClear();

      DEBUGGER.setEnabled(false);
      DEBUGGER.log('message 2');
      expect(consoleSpy.log).not.toHaveBeenCalled();

      DEBUGGER.setEnabled(true);
      DEBUGGER.log('message 3');
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('DEBUGGER.log', () => {
    it('should call console.log with [APP] prefix when enabled', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.log('test message');

      expect(consoleSpy.log).toHaveBeenCalledWith('[APP]', 'test message');
    });

    it('should not call console.log when disabled', () => {
      DEBUGGER.setEnabled(false);
      DEBUGGER.log('test message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.log('message', 123, { key: 'value' }, [1, 2, 3]);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[APP]',
        'message',
        123,
        { key: 'value' },
        [1, 2, 3]
      );
    });

    it('should handle no arguments', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.log();

      expect(consoleSpy.log).toHaveBeenCalledWith('[APP]');
    });
  });

  describe('DEBUGGER.info', () => {
    it('should call console.info with [APP] prefix when enabled', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.info('info message');

      expect(consoleSpy.info).toHaveBeenCalledWith('[APP]', 'info message');
    });

    it('should not call console.info when disabled', () => {
      DEBUGGER.setEnabled(false);
      DEBUGGER.info('info message');

      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.info('User logged in:', { id: 1, name: 'Test' });

      expect(consoleSpy.info).toHaveBeenCalledWith('[APP]', 'User logged in:', {
        id: 1,
        name: 'Test',
      });
    });
  });

  describe('DEBUGGER.warn', () => {
    it('should call console.warn with [APP] prefix when enabled', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.warn('warning message');

      expect(consoleSpy.warn).toHaveBeenCalledWith('[APP]', 'warning message');
    });

    it('should not call console.warn when disabled', () => {
      DEBUGGER.setEnabled(false);
      DEBUGGER.warn('warning message');

      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.warn('Deprecation warning:', 'Use newMethod() instead');

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[APP]',
        'Deprecation warning:',
        'Use newMethod() instead'
      );
    });
  });

  describe('DEBUGGER.error', () => {
    it('should call console.error with [APP] prefix when enabled', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.error('error message');

      expect(consoleSpy.error).toHaveBeenCalledWith('[APP]', 'error message');
    });

    it('should not call console.error when disabled', () => {
      DEBUGGER.setEnabled(false);
      DEBUGGER.error('error message');

      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should handle Error objects', () => {
      DEBUGGER.setEnabled(true);
      const error = new Error('Something went wrong');
      DEBUGGER.error('Failed to fetch data:', error);

      expect(consoleSpy.error).toHaveBeenCalledWith('[APP]', 'Failed to fetch data:', error);
    });

    it('should handle multiple arguments', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.error('Request failed:', { status: 500, message: 'Server error' });

      expect(consoleSpy.error).toHaveBeenCalledWith('[APP]', 'Request failed:', {
        status: 500,
        message: 'Server error',
      });
    });
  });

  describe('All methods when disabled', () => {
    beforeEach(() => {
      DEBUGGER.setEnabled(false);
      consoleSpy.log.mockClear();
      consoleSpy.info.mockClear();
      consoleSpy.warn.mockClear();
      consoleSpy.error.mockClear();
    });

    it('should not call any console methods when disabled', () => {
      DEBUGGER.log('log message');
      DEBUGGER.info('info message');
      DEBUGGER.warn('warn message');
      DEBUGGER.error('error message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined arguments', () => {
      DEBUGGER.setEnabled(true);
      DEBUGGER.log('Value:', null, undefined);

      expect(consoleSpy.log).toHaveBeenCalledWith('[APP]', 'Value:', null, undefined);
    });

    it('should handle complex nested objects', () => {
      DEBUGGER.setEnabled(true);
      const complexObj = {
        level1: {
          level2: {
            level3: [1, 2, 3],
            nested: { value: 'deep' },
          },
        },
      };
      DEBUGGER.log('Complex object:', complexObj);

      expect(consoleSpy.log).toHaveBeenCalledWith('[APP]', 'Complex object:', complexObj);
    });

    it('should handle circular references without crashing', () => {
      DEBUGGER.setEnabled(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circular: any = { name: 'test' };
      circular.self = circular;

      // Should not throw
      expect(() => {
        DEBUGGER.log('Circular:', circular);
      }).not.toThrow();

      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should handle very long strings', () => {
      DEBUGGER.setEnabled(true);
      const longString = 'a'.repeat(10000);
      DEBUGGER.log('Long string:', longString);

      expect(consoleSpy.log).toHaveBeenCalledWith('[APP]', 'Long string:', longString);
    });
  });

  describe('Method chaining behavior', () => {
    it('should allow calling multiple methods in sequence', () => {
      DEBUGGER.setEnabled(true);

      DEBUGGER.log('Step 1');
      DEBUGGER.info('Step 2');
      DEBUGGER.warn('Step 3');
      DEBUGGER.error('Step 4');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance', () => {
    it('should not call console methods when disabled (performance)', () => {
      DEBUGGER.setEnabled(false);

      // Call many times
      for (let i = 0; i < 1000; i++) {
        DEBUGGER.log('message', i);
      }

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });
});
