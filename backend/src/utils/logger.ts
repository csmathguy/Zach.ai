/**
 * Structured logging utility for application-wide error and info logging
 *
 * Provides consistent JSON-formatted logging with timestamps and context
 */

/**
 * Log structured error data to console with JSON formatting
 * Used by error middleware for server-side error logging
 *
 * @param data - Error context object (requestId, statusCode, message, stack, etc.)
 */
export function logError(data: Record<string, unknown>): void {
  console.error('[ERROR]', JSON.stringify(data, null, 2));
}

/**
 * Logger interface for dependency injection and testing
 */
export const logger = {
  error: logError,
};
