import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { requestLogger } from '../../middleware/requestLogger';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('requestLogger Middleware', () => {
  const mockRequest = (options: {
    method?: string;
    path?: string;
    headers?: Record<string, string>;
  }): Partial<Request> => ({
    method: options.method || 'GET',
    path: options.path || '/api/test',
    headers: options.headers || {},
  });

  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    const listeners: Record<string, (() => void)[]> = {};

    res.on = jest.fn((event: string, callback: () => void) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
      return res;
    }) as unknown as Response['on'];

    // Helper to trigger 'finish' event in tests
    (res as { _triggerFinish?: () => void })._triggerFinish = () => {
      if (listeners['finish']) {
        listeners['finish'].forEach((callback) => callback());
      }
    };

    res.setHeader = jest.fn() as unknown as Response['setHeader'];
    res.statusCode = 200;
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate request ID if not present', () => {
    // Arrange
    const mockUUID = '12345678-1234-1234-1234-123456789012';
    (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const req = mockRequest({}) as Request;
    const res = mockResponse() as Response;

    // Act
    requestLogger(req, res, mockNext);

    // Assert
    expect(req.id).toBe(mockUUID);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should use existing request ID from X-Request-Id header', () => {
    // Arrange
    const existingId = 'existing-request-id';
    const req = mockRequest({
      headers: { 'x-request-id': existingId },
    }) as Request;
    const res = mockResponse() as Response;

    // Act
    requestLogger(req, res, mockNext);

    // Assert
    expect(req.id).toBe(existingId);
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it('should set X-Request-Id response header', () => {
    const mockUUID = '12345678-1234-1234-1234-123456789012';
    (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const req = mockRequest({}) as Request;
    const res = mockResponse() as Response;

    requestLogger(req, res, mockNext);

    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', mockUUID);
  });

  it('should log request start with timestamp', () => {
    // Arrange
    const mockUUID = '12345678-1234-1234-1234-123456789012';
    (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const req = mockRequest({
      method: 'POST',
      path: '/api/thoughts',
    }) as Request;
    const res = mockResponse() as Response;

    // Act
    requestLogger(req, res, mockNext);

    // Assert
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: mockUUID,
        method: 'POST',
        path: '/api/thoughts',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      })
    );
  });

  it('should log request end on response finish with duration and status', () => {
    // Arrange
    const mockUUID = '12345678-1234-1234-1234-123456789012';
    (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const req = mockRequest({
      method: 'POST',
      path: '/api/thoughts',
    }) as Request;
    const res = mockResponse() as Response;
    res.statusCode = 201;

    // Act
    requestLogger(req, res, mockNext);

    // Clear the start log call
    (logger.info as jest.Mock).mockClear();

    // Trigger response finish event
    (res as { _triggerFinish?: () => void })._triggerFinish?.();

    // Assert
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: mockUUID,
        method: 'POST',
        path: '/api/thoughts',
        statusCode: 201,
        duration: expect.stringMatching(/^\d+ms$/),
      })
    );
  });

  it('should calculate duration correctly', async () => {
    // Arrange
    const mockUUID = '12345678-1234-1234-1234-123456789012';
    (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const req = mockRequest({}) as Request;
    const res = mockResponse() as Response;

    // Act
    requestLogger(req, res, mockNext);

    // Wait a small amount of time
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Clear the start log call
    (logger.info as jest.Mock).mockClear();

    // Trigger response finish event
    (res as { _triggerFinish?: () => void })._triggerFinish?.();

    // Assert
    const lastCall = (logger.info as jest.Mock).mock.calls[0][0] as {
      duration: string;
    };
    const duration = parseInt(lastCall.duration.replace('ms', ''));
    expect(duration).toBeGreaterThanOrEqual(40); // Account for timing variations
    expect(duration).toBeLessThan(200); // Reasonable upper bound
  });

  it('should call next() immediately without blocking', () => {
    // Arrange
    const req = mockRequest({}) as Request;
    const res = mockResponse() as Response;

    // Act
    requestLogger(req, res, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalledTimes(1);
    // Next should be called synchronously, not after response finishes
  });

  it('should log both start and end for same request ID', () => {
    // Arrange
    const mockUUID = '12345678-1234-1234-1234-123456789012';
    (crypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);

    const req = mockRequest({
      method: 'GET',
      path: '/api/health',
    }) as Request;
    const res = mockResponse() as Response;
    res.statusCode = 200;

    // Act
    requestLogger(req, res, mockNext);

    // Get start log
    const startLog = (logger.info as jest.Mock).mock.calls[0][0] as {
      requestId: string;
    };

    // Trigger response finish
    (res as { _triggerFinish?: () => void })._triggerFinish?.();

    // Get end log
    const endLog = (logger.info as jest.Mock).mock.calls[1][0] as {
      requestId: string;
    };

    // Assert
    expect(startLog.requestId).toBe(mockUUID);
    expect(endLog.requestId).toBe(mockUUID);
    expect(logger.info).toHaveBeenCalledTimes(2);
  });
});
