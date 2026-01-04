import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * Express middleware for request logging with request ID
 * Generates unique ID per request for traceability
 *
 * @see work-items/O2-thought-capture/architecture/adr-003-error-handling-logging-strategy.md
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate or use existing request ID
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('x-request-id', requestId);

  const startTime = Date.now();

  // Log request start
  logger.info({
    requestId,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  // Log request end on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
