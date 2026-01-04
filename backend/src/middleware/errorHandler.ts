import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * Express error handling middleware
 *
 * Handles operational errors (AppError subclasses) and unknown errors.
 * - Logs full error details server-side
 * - Returns sanitized error response to client
 * - Includes requestId for error correlation
 * - Never exposes stack traces to client
 *
 * IMPORTANT: Must have 4 parameters for Express to recognize as error middleware
 *
 * @see work-items/O2-thought-capture/architecture/adr-003-error-handling-logging-strategy.md
 */
export const errorHandler = (
  err: Error,
  req: Request | unknown,
  res: Response,
  _next: NextFunction
): void => {
  // Get or generate requestId for error correlation
  const typedReq = req as Request;
  const requestId = typedReq.id || crypto.randomUUID();

  if (err instanceof AppError) {
    // Operational error - known error type with statusCode
    logger.error({
      requestId,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      details: err.details,
      path: typedReq.path,
      method: typedReq.method,
    });

    // Return structured error response
    const response: Record<string, unknown> = {
      error: err.message,
      requestId,
    };

    // Include details only if present (e.g., validation errors)
    if (err.details) {
      response.details = err.details;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown error - programming error or unexpected failure
  logger.error({
    requestId,
    message: err.message,
    stack: err.stack,
    path: typedReq.path,
    method: typedReq.method,
  });

  // Return generic error message (don't leak internal details)
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    requestId,
  });
};
