import { describe, it, expect, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validateRequest';
import { ValidationError } from '../../errors/AppError';

describe('validateRequest Middleware', () => {
  // Mock Express objects
  const mockRequest = (body: unknown): Partial<Request> => ({
    body,
  });

  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
    res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass through valid request body', () => {
    // Arrange
    const schema = z.object({
      text: z.string().min(1),
    });
    const middleware = validateRequest(schema);
    const req = mockRequest({ text: 'Valid thought' }) as Request;
    const res = mockResponse() as Response;

    // Act
    middleware(req, res, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ text: 'Valid thought' });
  });

  it('should throw ValidationError for invalid request body', () => {
    // Arrange
    const schema = z.object({
      text: z.string().min(1),
    });
    const middleware = validateRequest(schema);
    const req = mockRequest({ text: '' }) as Request; // Empty string fails min(1)
    const res = mockResponse() as Response;

    // Act & Assert
    expect(() => middleware(req, res, mockNext)).toThrow(ValidationError);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should include multiple validation errors in details array', () => {
    // Arrange
    const schema = z.object({
      text: z.string().min(1),
      userId: z.string().uuid(),
    });
    const middleware = validateRequest(schema);
    const req = mockRequest({ text: '', userId: 'not-a-uuid' }) as Request;
    const res = mockResponse() as Response;

    // Act & Assert
    try {
      middleware(req, res, mockNext);
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.details).toHaveLength(2);
      expect(validationError.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'text' }),
          expect.objectContaining({ field: 'userId' }),
        ])
      );
    }
  });

  it('should replace req.body with parsed data (type-safe)', () => {
    // Arrange
    const schema = z.object({
      text: z.string().trim(),
      timestamp: z.string().datetime().optional(),
    });
    const middleware = validateRequest(schema);
    const req = mockRequest({ text: '  Thought with spaces  ' }) as Request;
    const res = mockResponse() as Response;

    // Act
    middleware(req, res, mockNext);

    // Assert
    expect(req.body.text).toBe('Thought with spaces'); // Trimmed by Zod
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should handle nested validation errors with dot notation', () => {
    // Arrange
    const schema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    });
    const middleware = validateRequest(schema);
    const req = mockRequest({ user: { email: 'invalid' } }) as Request;
    const res = mockResponse() as Response;

    // Act & Assert
    try {
      middleware(req, res, mockNext);
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      const details = validationError.details as { field: string; message: string }[];
      expect(details[0]?.field).toBe('user.email');
    }
  });

  it('should throw ValidationError with correct message', () => {
    // Arrange
    const schema = z.object({
      text: z.string(),
    });
    const middleware = validateRequest(schema);
    const req = mockRequest({}) as Request; // Missing 'text'
    const res = mockResponse() as Response;

    // Act & Assert
    try {
      middleware(req, res, mockNext);
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.message).toBe('Validation failed');
      expect(validationError.statusCode).toBe(400);
    }
  });
});
