/**
 * Integration tests for errorHandler middleware
 * Tests Express error handling middleware behavior, response formatting, logging
 *
 * @see work-items/O2-thought-capture/tests/TS-005-error-handling.md
 * @see work-items/O2-thought-capture/architecture/adr-003-error-handling-logging-strategy.md
 */

import { describe, it, expect, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/errorHandler';
import { ValidationError, DatabaseError } from '../../errors';

// Mock request, response, next helpers
const mockRequest = (overrides?: {
  id?: string;
}): Partial<Request> & { path: string; method: string; id?: string } => {
  return {
    path: '/api/thoughts',
    method: 'POST',
    id: 'test-request-id',
    ...overrides,
  };
};

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
};

const mockNext = jest.fn() as unknown as NextFunction;

describe('errorHandler middleware', () => {
  describe('ValidationError handling', () => {
    it('should return 400 status code for ValidationError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ValidationError('Validation failed');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should include error message in response', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ValidationError('Invalid email format');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid email format',
        })
      );
    });

    it('should include requestId in response', () => {
      const req = mockRequest({ id: 'req-123' });
      const res = mockResponse();
      const error = new ValidationError('Validation failed');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-123',
        })
      );
    });

    it('should include details when present', () => {
      const req = mockRequest();
      const res = mockResponse();
      const details = [
        { field: 'text', message: 'Required' },
        { field: 'text', message: 'Must be at least 1 character' },
      ];
      const error = new ValidationError('Validation failed', details);

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          requestId: 'test-request-id',
          details,
        })
      );
    });
  });

  describe('DatabaseError handling', () => {
    it('should return 500 status code for DatabaseError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new DatabaseError('Connection failed');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should include error message in response', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new DatabaseError('Query timeout');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Query timeout',
        })
      );
    });

    it('should include requestId in response', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new DatabaseError();

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.any(String),
        })
      );
    });
  });

  describe('Unknown Error handling', () => {
    it('should return 500 status code for unknown errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Unexpected error');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return generic message for unknown errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Something broke');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        })
      );
    });

    it('should NOT expose original error message to client', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Sensitive internal error');

      errorHandler(error, req, res, mockNext);

      const jsonCall = (res.json as jest.Mock).mock.calls[0]?.[0] as Record<string, unknown>;
      // Original error message should not appear in response
      expect(jsonCall.error).not.toBe('Sensitive internal error');
      expect(jsonCall.message).not.toBe('Sensitive internal error');
      // Should be generic message instead
      expect(jsonCall.error).toBe('Internal server error');
    });

    it('should include requestId in response', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Unknown error');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.any(String),
        })
      );
    });
  });

  describe('Request ID handling', () => {
    it('should use existing requestId from request', () => {
      const req = mockRequest({ id: 'existing-id-123' });
      const res = mockResponse();
      const error = new ValidationError('Test');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'existing-id-123',
        })
      );
    });

    it('should generate requestId when not present on request', () => {
      const req = mockRequest();
      delete (req as Record<string, unknown>).id;
      const res = mockResponse();
      const error = new ValidationError('Test');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          ),
        })
      );
    });
  });

  describe('Stack trace handling', () => {
    it('should NOT include stack trace in client response', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ValidationError('Test error');

      errorHandler(error, req as Request, res, mockNext);

      expect(res.status).toHaveBeenCalled();
      const jsonCall = (res.json as jest.Mock).mock.calls[0]?.[0];
      expect(jsonCall).not.toHaveProperty('stack');
    });
  });
});
