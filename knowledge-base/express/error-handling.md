# Express Error Handling

## Overview

Error handling in Express applications is critical for building robust, production-ready APIs. This guide covers custom error class hierarchies, error middleware patterns, request ID correlation, structured logging, and integration with validation libraries like Zod.

**Philosophy**: Express provides a built-in error handling mechanism through middleware with a special 4-parameter signature. For enterprise applications, extending this with custom error classes, request correlation, and structured logging creates maintainable, debuggable error handling.

---

## Quick Reference

### Essential Patterns

```typescript
// Custom error class
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error middleware (4 parameters)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Error handling logic
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({ error: err.message });
});

// Throwing errors in routes
app.post('/users', (req, res, next) => {
  if (!req.body.email) {
    throw new ValidationError('Email is required');
  }
  // ... continue processing
});

// Async error handling (Express 5+)
app.get('/users/:id', async (req, res) => {
  const user = await getUserById(req.params.id); // Auto-caught by Express
  res.json(user);
});
```

---

## Core Concepts

### Express Error Handling Mechanism

Express catches errors in two ways:

1. **Synchronous errors**: Automatically caught via `try/catch` internally
2. **Asynchronous errors**: Must be passed to `next(err)` or use Express 5+ automatic promise rejection handling

**Error Middleware Signature**: Error-handling middleware is identified by its **4-parameter signature**: `(err, req, res, next)`

---

## Custom Error Class Hierarchy

### Base AppError Class

```typescript
// Base error class for all application errors
export class AppError extends Error {
  public readonly isOperational: boolean;

  constructor(
    public statusCode: number,
    public message: string,
    isOperational: boolean = true,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set name to constructor name (ValidationError, DatabaseError, etc.)
    this.name = this.constructor.name;
  }
}
```

**Key Properties**:

- `statusCode`: HTTP status code (400, 404, 500, etc.)
- `message`: User-facing error message
- `isOperational`: `true` = expected error (validation, not found), `false` = programmer error (bug)
- `details`: Optional additional context (validation errors, field info)

### Derived Error Classes

```typescript
// 400 - Bad Request (validation failures)
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, true, details);
  }
}

// 404 - Not Found
export class NotFoundError extends AppError {
  constructor(resource: string, identifier: string) {
    super(404, `${resource} with identifier ${identifier} not found`, true);
  }
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, true);
  }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, true);
  }
}

// 409 - Conflict (duplicate resource)
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(409, message, true, details);
  }
}

// 500 - Internal Server Error (database, external API failures)
export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, message, false, details); // Not operational - indicates a bug
  }
}

// 503 - Service Unavailable
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(503, message, true);
  }
}
```

---

## Error Middleware Pattern

### Basic Error Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors/AppError';

// Error middleware MUST have 4 parameters
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Default to 500 if not an AppError
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log error for debugging
  console.error('Error:', {
    statusCode,
    message,
    stack: err.stack,
  });

  // Send client-safe response (no stack traces in production)
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

// Register error middleware LAST in middleware chain
app.use(errorHandler);
```

### Production-Grade Error Middleware with Request ID

```typescript
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AppError } from './errors/AppError';

// Request ID middleware (place early in middleware chain)
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  req.requestId = requestId; // Attach to request object
  res.setHeader('X-Request-ID', requestId); // Include in response headers
  next();
}

// Error middleware with request ID correlation
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Structured logging with request context
  const errorLog = {
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    isOperational,
    stack: err.stack,
    ...(err instanceof AppError && err.details && { details: err.details }),
  };

  // Log with appropriate level
  if (statusCode >= 500) {
    console.error('Server Error:', errorLog);
  } else {
    console.warn('Client Error:', errorLog);
  }

  // Client-safe response (never expose stack traces in production)
  const response: Record<string, unknown> = {
    error: {
      message: err.message,
      requestId: req.requestId, // For user support
    },
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  // Include additional details if available
  if (err instanceof AppError && err.details) {
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
}

// TypeScript: Extend Request interface
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}
```

---

## Integration with Zod Validation

### Transforming Zod Errors to ValidationError

```typescript
import { z, ZodError } from 'zod';
import { ValidationError } from './errors/ValidationError';

// Zod schema example
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().positive().optional(),
});

// Helper to transform ZodError to ValidationError
export function zodErrorToValidationError(zodError: ZodError): ValidationError {
  const details = zodError.errors.reduce(
    (acc, err) => {
      const path = err.path.join('.');
      acc[path] = err.message;
      return acc;
    },
    {} as Record<string, string>
  );

  return new ValidationError('Validation failed', details);
}

// Route handler with Zod validation
app.post('/users', (req, res, next) => {
  try {
    // Validate request body with Zod
    const validatedData = CreateUserSchema.parse(req.body);

    // Continue with validated data
    // ... create user logic
    res.status(201).json({ success: true });
  } catch (err) {
    if (err instanceof ZodError) {
      // Transform ZodError to ValidationError
      return next(zodErrorToValidationError(err));
    }
    next(err); // Pass other errors to error handler
  }
});
```

### Reusable Zod Validation Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// Generic validation middleware factory
export function validateRequest<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(zodErrorToValidationError(err));
      } else {
        next(err);
      }
    }
  };
}

// Usage: Apply validation middleware before route handler
app.post('/users', validateRequest(CreateUserSchema), (req, res) => {
  // req.body is now validated and typed
  const { email, name, age } = req.body;
  // ... create user logic
  res.status(201).json({ success: true });
});
```

---

## Async Error Handling

### Express 5+ Automatic Promise Rejection Handling

Express 5 automatically catches promise rejections:

```typescript
// Express 5: No try/catch or .catch() needed
app.get('/users/:id', async (req, res) => {
  const user = await getUserById(req.params.id); // Rejection auto-caught
  res.json(user);
});
```

### Express 4: Manual Promise Error Handling

For Express 4, use `express-async-errors` or manual `.catch()`:

```typescript
// Option 1: express-async-errors (recommended)
import 'express-async-errors'; // Import at app entry point
// Now async errors are automatically caught

// Option 2: Manual .catch() (verbose)
app.get('/users/:id', (req, res, next) => {
  getUserById(req.params.id)
    .then((user) => res.json(user))
    .catch(next); // Pass error to error handler
});

// Option 3: Wrapper function
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    res.json(user);
  })
);
```

---

## Common Error Handling Patterns

### Pattern 1: Throwing Errors in Route Handlers

```typescript
app.post('/api/thoughts', async (req, res) => {
  // Validation error
  if (!req.body.text) {
    throw new ValidationError('Thought text is required');
  }

  // Business logic error
  if (req.body.text.length > 500) {
    throw new ValidationError('Thought text must be 500 characters or less', {
      maxLength: 500,
      actualLength: req.body.text.length,
    });
  }

  // Database operation (errors auto-caught if async)
  const thought = await thoughtRepository.create(req.body);
  res.status(201).json(thought);
});
```

### Pattern 2: Error Handling in Services

```typescript
// Service layer throws domain-specific errors
export class ThoughtService {
  async createThought(data: CreateThoughtDto): Promise<Thought> {
    // Validate at service layer
    if (!data.text || data.text.trim().length === 0) {
      throw new ValidationError('Thought text cannot be empty');
    }

    // Database error handling
    try {
      return await this.thoughtRepo.create(data);
    } catch (err) {
      // Transform database errors to ApplicationErrors
      if (err.code === 'P2002') {
        // Prisma unique constraint violation
        throw new ConflictError('Duplicate thought detected');
      }
      throw new DatabaseError('Failed to create thought', { cause: err });
    }
  }
}
```

### Pattern 3: Not Found Errors

```typescript
app.get('/api/thoughts/:id', async (req, res) => {
  const thought = await thoughtRepository.findById(req.params.id);

  if (!thought) {
    throw new NotFoundError('Thought', req.params.id);
  }

  res.json(thought);
});
```

### Pattern 4: Conditional Error Responses

```typescript
// Error middleware with different formats for JSON vs HTML
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // Respond with JSON for API requests
  if (req.accepts('json')) {
    res.status(statusCode).json({
      error: {
        message: err.message,
        requestId: req.requestId,
      },
    });
  } else {
    // Respond with HTML for browser requests
    res.status(statusCode).render('error', {
      statusCode,
      message: err.message,
    });
  }
}
```

---

## Testing Error Handling

### Unit Testing Error Classes

```typescript
import { describe, it, expect } from '@jest/globals';
import { ValidationError, DatabaseError } from './errors';

describe('AppError Hierarchy', () => {
  it('should create ValidationError with 400 status', () => {
    const error = new ValidationError('Invalid input');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid input');
    expect(error.isOperational).toBe(true);
  });

  it('should create DatabaseError with 500 status', () => {
    const error = new DatabaseError('Database connection failed');

    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false); // Indicates programmer error
  });

  it('should include additional details', () => {
    const error = new ValidationError('Validation failed', {
      email: 'Invalid email format',
      age: 'Must be a positive number',
    });

    expect(error.details).toEqual({
      email: 'Invalid email format',
      age: 'Must be a positive number',
    });
  });
});
```

### Integration Testing Error Middleware

```typescript
import request from 'supertest';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { ValidationError } from './errors/ValidationError';

describe('Error Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    // Route that throws ValidationError
    app.get('/test-error', (req, res) => {
      throw new ValidationError('Test validation error');
    });

    // Register error handler
    app.use(errorHandler);
  });

  it('should return 400 for ValidationError', async () => {
    const response = await request(app).get('/test-error');

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Test validation error');
  });

  it('should include request ID in error response', async () => {
    // Add request ID middleware
    app.use((req, res, next) => {
      req.requestId = 'test-request-id';
      next();
    });

    const response = await request(app).get('/test-error');

    expect(response.body.error.requestId).toBe('test-request-id');
  });
});
```

---

## Best Practices

### ✅ DO

1. **Use 4-parameter signature** for error middleware: `(err, req, res, next)`
2. **Register error middleware LAST** in middleware chain
3. **Use custom error classes** for different error types (ValidationError, NotFoundError, etc.)
4. **Include request IDs** for debugging and support correlation
5. **Log structured error data** with context (requestId, method, url, statusCode)
6. **Never expose stack traces in production** - only in development
7. **Throw errors synchronously** in route handlers - Express catches them
8. **Use `next(err)` for async errors** (Express 4) or rely on automatic handling (Express 5)
9. **Validate early** - fail fast with clear validation errors
10. **Distinguish operational vs programmer errors** - `isOperational` flag

### ❌ DON'T

1. **Don't use 3-parameter signature** for error handlers - won't be recognized
2. **Don't place error middleware early** - must be last to catch all errors
3. **Don't expose stack traces to clients** in production
4. **Don't swallow errors** - always log and respond appropriately
5. **Don't use generic error messages** - be specific and actionable
6. **Don't forget to call `next(err)`** for async errors (Express 4)
7. **Don't log sensitive data** in error details (passwords, tokens)
8. **Don't mix error handling with business logic** - separate concerns
9. **Don't use error middleware for non-error flows** - only for errors
10. **Don't ignore `headersSent` check** - avoid double responses

---

## Troubleshooting

### Issue: Error middleware not catching errors

**Symptom**: Errors crash the app instead of being caught by error middleware

**Causes & Solutions**:

1. **Error middleware not 4 parameters**:

   ```typescript
   // ❌ Wrong: 3 parameters
   app.use((err, req, res) => { ... });

   // ✅ Correct: 4 parameters
   app.use((err, req, res, next) => { ... });
   ```

2. **Error middleware placed too early**:

   ```typescript
   // ❌ Wrong: Before routes
   app.use(errorHandler);
   app.get('/users', ...);

   // ✅ Correct: After routes
   app.get('/users', ...);
   app.use(errorHandler);
   ```

3. **Async errors not passed to `next()`** (Express 4):

   ```typescript
   // ❌ Wrong: Error not caught
   app.get('/users', (req, res) => {
     getUserById().then((user) => res.json(user));
     // Error in getUserById is unhandled
   });

   // ✅ Correct: Pass error to next
   app.get('/users', (req, res, next) => {
     getUserById()
       .then((user) => res.json(user))
       .catch(next); // Pass error to error handler
   });
   ```

### Issue: Stack traces exposed to clients

**Symptom**: Full error stack traces visible in API responses

**Solution**: Check `NODE_ENV` before including stack traces:

```typescript
const response = {
  error: {
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  },
};
```

### Issue: "Cannot set headers after they are sent"

**Symptom**: Error trying to send multiple responses

**Solution**: Check if headers already sent before responding:

```typescript
export function errorHandler(err, req, res, next) {
  // Delegate to default handler if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ error: err.message });
}
```

### Issue: Zod validation errors not formatted correctly

**Symptom**: Raw ZodError objects sent to clients

**Solution**: Transform ZodError to ValidationError:

```typescript
try {
  const validatedData = schema.parse(req.body);
} catch (err) {
  if (err instanceof ZodError) {
    return next(zodErrorToValidationError(err));
  }
  next(err);
}
```

---

## Advanced Patterns

### Pattern: Async Error Wrapper (Express 4)

```typescript
// Utility to wrap async route handlers
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    res.json(user);
  })
);
```

### Pattern: Error Recovery Middleware

```typescript
// Retry logic for transient errors
export function retryMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ServiceUnavailableError) {
    const retryAfter = 5; // seconds
    res.setHeader('Retry-After', retryAfter);
  }
  next(err);
}
```

### Pattern: Error Aggregation

```typescript
// Collect multiple validation errors
class ValidationErrors extends AppError {
  constructor(errors: Array<{ field: string; message: string }>) {
    const message = `Validation failed for ${errors.length} field(s)`;
    const details = errors.reduce(
      (acc, err) => {
        acc[err.field] = err.message;
        return acc;
      },
      {} as Record<string, string>
    );

    super(400, message, true, details);
  }
}
```

---

## Performance Considerations

1. **Logging Overhead**: Use structured logging libraries (Winston, Pino) instead of `console.log` in production
2. **Stack Trace Capture**: `Error.captureStackTrace()` is fast but still has overhead - only capture when needed
3. **Error Serialization**: Avoid logging large objects in error details
4. **Request ID Generation**: `crypto.randomUUID()` is performant for most use cases

---

## Security Considerations

1. **Never expose internal errors**: Transform database/system errors to generic messages
2. **Sanitize error details**: Remove sensitive data (passwords, tokens, PII)
3. **Rate limit error responses**: Prevent enumeration attacks via error messages
4. **Validate error input**: Don't trust error data from clients

---

## References

- **Express Error Handling**: https://expressjs.com/en/guide/error-handling.html
- **Node.js Error Class**: https://nodejs.org/api/errors.html
- **crypto.randomUUID()**: https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
- **Zod**: https://zod.dev/
- **ADR-003**: Express Error Handling Strategy (project-specific)

---

## Related Documentation

- **Express Middleware**: [knowledge-base/express/README.md](README.md#middleware)
- **Zod Validation**: [knowledge-base/zod/README.md](../zod/README.md)
- **Structured Logging**: [knowledge-base/logging/README.md](../logging/README.md) (when created)
- **Request Correlation**: [knowledge-base/tracing/README.md](../tracing/README.md) (when created)

---

## Next Steps

1. Read Express Middleware documentation
2. Review ADR-003 for project-specific error handling decisions
3. Implement custom error classes for your application
4. Set up structured logging with Winston or Pino
5. Configure error monitoring with Sentry or similar tools
