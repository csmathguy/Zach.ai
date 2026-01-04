/**
 * Unit tests for AppError, ValidationError, and DatabaseError classes
 * Tests error class hierarchy, properties, and prototype chain
 *
 * @see work-items/O2-thought-capture/tests/TS-005-error-handling.md
 * @see work-items/O2-thought-capture/architecture/adr-003-error-handling-logging-strategy.md
 */

import { describe, it, expect } from '@jest/globals';
import { AppError, ValidationError, DatabaseError } from '../../errors';

describe('AppError', () => {
  describe('constructor', () => {
    it('should set statusCode, message, isOperational, and details', () => {
      const error = new AppError(400, 'Test error', true, { field: 'email' });

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ field: 'email' });
    });

    it('should default isOperational to true', () => {
      const error = new AppError(500, 'Test error');

      expect(error.isOperational).toBe(true);
    });

    it('should allow details to be undefined', () => {
      const error = new AppError(404, 'Not found');

      expect(error.details).toBeUndefined();
    });
  });

  describe('prototype chain', () => {
    it('should be instanceof AppError', () => {
      const error = new AppError(500, 'Test error');

      expect(error).toBeInstanceOf(AppError);
    });

    it('should be instanceof Error', () => {
      const error = new AppError(500, 'Test error');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct constructor name', () => {
      const error = new AppError(500, 'Test error');

      expect(error.constructor.name).toBe('AppError');
    });
  });

  describe('stack trace', () => {
    it('should capture stack trace', () => {
      const error = new AppError(500, 'Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should not include constructor in stack trace', () => {
      const error = new AppError(500, 'Test error');

      // Stack should start with "Error: Test error" not with the constructor call
      expect(error.stack).toBeDefined();
      expect(error.stack?.split('\n')[0]).toContain('Test error');
    });
  });
});

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should set statusCode to 400', () => {
      const error = new ValidationError('Validation failed');

      expect(error.statusCode).toBe(400);
    });

    it('should set isOperational to true', () => {
      const error = new ValidationError('Validation failed');

      expect(error.isOperational).toBe(true);
    });

    it('should set message', () => {
      const error = new ValidationError('Invalid email');

      expect(error.message).toBe('Invalid email');
    });

    it('should accept details', () => {
      const details = [{ field: 'email', message: 'Invalid format' }];
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('prototype chain', () => {
    it('should be instanceof ValidationError', () => {
      const error = new ValidationError('Test');

      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should be instanceof AppError', () => {
      const error = new ValidationError('Test');

      expect(error).toBeInstanceOf(AppError);
    });

    it('should be instanceof Error', () => {
      const error = new ValidationError('Test');

      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct constructor name', () => {
      const error = new ValidationError('Test');

      expect(error.constructor.name).toBe('ValidationError');
    });
  });
});

describe('DatabaseError', () => {
  describe('constructor', () => {
    it('should set statusCode to 500', () => {
      const error = new DatabaseError('Database query failed');

      expect(error.statusCode).toBe(500);
    });

    it('should set isOperational to true', () => {
      const error = new DatabaseError('Database query failed');

      expect(error.isOperational).toBe(true);
    });

    it('should set custom message', () => {
      const error = new DatabaseError('Connection timeout');

      expect(error.message).toBe('Connection timeout');
    });

    it('should use default message when none provided', () => {
      const error = new DatabaseError();

      expect(error.message).toBe('Database operation failed');
    });

    it('should accept details', () => {
      const details = { code: 'SQLITE_CONSTRAINT' };
      const error = new DatabaseError('Unique constraint failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('prototype chain', () => {
    it('should be instanceof DatabaseError', () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(DatabaseError);
    });

    it('should be instanceof AppError', () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(AppError);
    });

    it('should be instanceof Error', () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct constructor name', () => {
      const error = new DatabaseError();

      expect(error.constructor.name).toBe('DatabaseError');
    });
  });
});
