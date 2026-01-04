/**
 * Base error class for operational errors
 *
 * Operational errors are expected errors that can happen during normal app flow:
 * - Validation failures
 * - Database constraint violations
 * - Network timeouts
 *
 * @see work-items/O2-thought-capture/architecture/adr-003-error-handling-logging-strategy.md
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, isOperational = true, details?: unknown) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace (exclude constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ValidationError - 400 Bad Request
 *
 * Used for input validation failures (Zod validation, business rule violations)
 * Includes details array for field-level errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, true, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * DatabaseError - 500 Internal Server Error
 *
 * Used for database operation failures (connection, queries, constraints)
 * Details should not be exposed to client for security
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details?: unknown) {
    super(500, message, true, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
