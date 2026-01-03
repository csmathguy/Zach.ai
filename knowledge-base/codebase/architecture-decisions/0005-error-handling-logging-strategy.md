# ADR-003: Error Handling & Logging Strategy

**Status**: Accepted  
**Date**: 2026-01-03  
**APR Reference**: [O2 APR - Section 4.4 Error Handling & Logging](../plan/apr.md#44-error-handling--logging)

## Context

The Thought Capture API needs comprehensive error handling and logging to:

1. **Diagnose Issues**: Detailed server logs with stack traces
2. **User Experience**: User-friendly error messages (no stack traces to client)
3. **Traceability**: Request IDs for correlating logs with errors
4. **Categorization**: Distinguish validation, database, and unknown errors
5. **Performance**: Log request duration for monitoring

This is the first API endpoint, so we need to establish patterns that future endpoints will follow.

## Decision

**Use custom error classes + Express error middleware** with structured logging via a lightweight logger utility.

### Architecture

```
Request → Route → Middleware → Controller → (throw CustomError) → Error Middleware → Response
                                                                           ↓
                                                                      Logger
```

### Implementation Pattern

```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: unknown) {
    super(500, message, true, details);
  }
}

// middleware/errorHandler.ts
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.id || crypto.randomUUID();

  if (err instanceof AppError) {
    logger.error({
      requestId,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      details: err.details,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      error: err.message,
      requestId,
      ...(err.details && { details: err.details }),
    });
  }

  // Unknown error
  logger.error({
    requestId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    requestId,
  });
};

// utils/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  level: LogLevel;
  timestamp: string;
  [key: string]: unknown;
}

export const logger = {
  info: (data: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), ...data }));
  },
  warn: (data: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), ...data }));
  },
  error: (data: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), ...data }));
  },
};

// middleware/requestLogger.ts
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  req.id = crypto.randomUUID();
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};
```

## Rationale

**Why Custom Error Classes?**

1. **Type Safety**: TypeScript can distinguish error types
2. **Structured Responses**: Consistent error format across API
3. **Operational vs Programming**: Distinguish expected errors from bugs
4. **Details Inclusion**: Attach context (validation errors, DB constraints)

**Why Express Error Middleware?**

- **Centralized**: Single source of truth for error handling
- **Separation of Concerns**: Controllers throw, middleware catches
- **Express Native**: Built-in pattern, no external dependencies

**Why Lightweight Logger over Winston/Pino?**

- **Simplicity**: MVP doesn't need log levels, transports, rotation
- **JSON Output**: Structured logs already, easy to parse
- **PM2 Integration**: PM2 handles log file management
- **Zero Dependencies**: One less dependency to maintain
- **Future-Proof**: Easy to swap to Winston/Pino later if needed

**Why Request IDs?**

- **Traceability**: Correlate client request with server logs
- **Debugging**: Users can provide request ID for support
- **Distributed Tracing**: Foundation for future observability

## Alternatives Considered

### try-catch in Every Route

**Pros**:

- Explicit error handling
- Full control per route

**Cons**:

- Repetitive boilerplate
- Error-prone (forgot try-catch = crash)
- Inconsistent error responses

**Rejected because**: Error middleware is Express best practice for centralized handling.

## Consequences

### Positive

- ✅ Consistent error responses across all endpoints
- ✅ User-friendly errors (no stack traces to client)
- ✅ Detailed server logs with stack traces and context
- ✅ Request IDs for traceability
- ✅ Type-safe error classes
- ✅ Easy to extend with new error types
- ✅ Zero external dependencies for logging

### Negative

- ⚠️ Custom logger lacks features of mature solutions (fine for MVP)
- ⚠️ JSON logs require parsing for human readability (PM2 handles this)

### Risks & Mitigations

| Risk                   | Mitigation                                                    |
| ---------------------- | ------------------------------------------------------------- |
| Logs grow unbounded    | PM2 log rotation configured (already in place)                |
| Sensitive data in logs | Sanitize errors before logging (passwords, tokens)            |
| Request ID collision   | Use crypto.randomUUID() (extremely low collision probability) |

## Implementation Notes

### Files to Create

1. `backend/src/errors/AppError.ts` - Custom error classes
2. `backend/src/middleware/errorHandler.ts` - Error handling middleware
3. `backend/src/middleware/requestLogger.ts` - Request logging middleware
4. `backend/src/utils/logger.ts` - Simple structured logger

### Integration Pattern

```typescript
// server.ts
import { requestLogger } from '@/middleware/requestLogger';
import { errorHandler } from '@/middleware/errorHandler';

// Apply request logger early
app.use(requestLogger);

// ... routes ...

// Apply error handler LAST (after all routes)
app.use(errorHandler);

// Controller usage
export const createThought = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const thought = await thoughtRepository.create(req.body);
    res.status(201).json(thought);
  } catch (error) {
    if (error.code === 'P2003') {
      // Prisma foreign key violation
      return next(new ValidationError('User not found', { userId: req.body.userId }));
    }
    next(new DatabaseError('Failed to create thought'));
  }
};
```

### Prisma Error Mapping

```typescript
// utils/mapPrismaError.ts
import { Prisma } from '@prisma/client';
import { DatabaseError, ValidationError } from '@/errors/AppError';

export function mapPrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new ValidationError('Unique constraint violation', { field: error.meta?.target });
      case 'P2003':
        return new ValidationError('Foreign key constraint violation');
      case 'P2025':
        return new ValidationError('Record not found');
      default:
        return new DatabaseError('Database operation failed', { code: error.code });
    }
  }
  return new DatabaseError('Unknown database error');
}
```

### Testing Strategy

```typescript
describe('Error Handling', () => {
  it('should return 400 for validation errors', async () => {
    const res = await request(app).post('/api/thoughts').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('requestId');
  });

  it('should return 500 for database errors', async () => {
    // Mock database failure
    jest.spyOn(prisma.thought, 'create').mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app).post('/api/thoughts').send(validPayload);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    expect(res.body).toHaveProperty('requestId');
  });

  it('should not expose stack traces to client', async () => {
    // Trigger error
    const res = await request(app).post('/api/thoughts').send(invalidPayload);
    expect(res.body).not.toHaveProperty('stack');
  });
});
```

## Compliance

- [x] **SOLID - SRP**: Error handling separated from business logic
- [x] **SOLID - OCP**: Easy to add new error types without modifying existing code
- [x] **Design Pattern**: Middleware pattern for cross-cutting concerns
- [x] **Testability**: Error middleware testable with mock req/res
- [x] **TypeScript Strict**: Typed error classes and logger
- [x] **Security**: No stack traces exposed to clients

## References

- Express Error Handling: https://expressjs.com/en/guide/error-handling.html
- Node.js Error Best Practices: https://www.joyent.com/node-js/production/design/errors
- APR Section 4.4: Error Handling & Logging
