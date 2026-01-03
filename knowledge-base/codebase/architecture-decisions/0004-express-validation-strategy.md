# ADR-001: Express Validation Strategy

**Status**: Accepted  
**Date**: 2026-01-03  
**APR Reference**: [O2 APR - Section 4.2 Input Validation](../plan/apr.md#42-input-validation)

## Context

The Thought Capture API needs to validate incoming request bodies before persisting to the database. We need to ensure:

1. Text field is required and non-empty
2. Text length constraints (1-10,000 characters)
3. Source field validation (enum: 'text', 'voice', 'api')
4. Clear, structured error responses for validation failures
5. TypeScript type safety throughout the validation chain

The validation layer sits between the route handler and the controller, ensuring only valid data reaches business logic.

## Decision

**Use Zod for runtime validation** with TypeScript inference, integrated via custom Express middleware.

### Implementation Pattern

```typescript
// validators/thoughtSchema.ts
import { z } from 'zod';

export const createThoughtSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(10000, 'Text exceeds maximum length'),
  source: z.enum(['text', 'voice', 'api']).default('text'),
});

export type CreateThoughtInput = z.infer<typeof createThoughtSchema>;

// middleware/validateRequest.ts
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    req.body = result.data; // Type-safe parsed data
    next();
  };
};
```

## Rationale

**Why Zod over express-validator?**

1. **Type Inference**: `z.infer<typeof schema>` generates TypeScript types automatically
2. **Single Source of Truth**: Runtime validation + compile-time types from same schema
3. **Composability**: Easy to extend schemas for future features
4. **Modern API**: Functional, chainable, intuitive
5. **Zero Dependencies**: Smaller bundle, fewer security vulnerabilities

**Why Custom Middleware over Controller Validation?**

- Separation of concerns: validation happens before controller
- Reusable across multiple routes
- Consistent error response format
- Early return on validation failure (fail fast)

## Alternatives Considered

### express-validator

**Pros**:

- Express-native integration
- Mature, battle-tested
- Large community

**Cons**:

- Requires separate TypeScript type definitions
- More verbose syntax
- Dual maintenance (types + validators)

**Rejected because**: Type duplication creates maintenance burden and potential drift.

### class-validator with class-transformer

**Pros**:

- Decorator-based, elegant
- Integrates well with TypeScript classes
- Used in NestJS

**Cons**:

- Requires class instances (more boilerplate)
- Runtime reflection dependencies
- Heavier dependency footprint

**Rejected because**: Overkill for simple REST validation, adds unnecessary complexity.

### Manual Validation

**Pros**:

- Zero dependencies
- Full control

**Cons**:

- Error-prone (manual type guards)
- Verbose and repetitive
- No standardized error format

**Rejected because**: Not scalable, high maintenance burden.

## Consequences

### Positive

- ✅ Type-safe validation with zero duplication
- ✅ Automatic TypeScript type inference
- ✅ Consistent, structured error responses
- ✅ Easy to extend for future validation needs
- ✅ Small bundle size (Zod is lightweight)
- ✅ Excellent documentation and community support

### Negative

- ⚠️ Team may need to learn Zod syntax (minimal learning curve)
- ⚠️ One more dependency in package.json

### Risks & Mitigations

| Risk                                            | Mitigation                                         |
| ----------------------------------------------- | -------------------------------------------------- |
| Zod breaking changes in future                  | Pin exact version, review updates before upgrading |
| Custom error format doesn't match API standards | Document format in API spec, use consistently      |
| Performance overhead on validation              | Negligible for our scale (<1ms per request)        |

## Implementation Notes

### Files to Create

1. `backend/src/validators/thoughtSchema.ts` - Zod schemas
2. `backend/src/middleware/validateRequest.ts` - Validation middleware
3. `backend/src/routes/thoughts.ts` - Apply middleware to POST route

### Integration Pattern

```typescript
// routes/thoughts.ts
import { Router } from 'express';
import { createThoughtSchema } from '@/validators/thoughtSchema';
import { validateRequest } from '@/middleware/validateRequest';
import { thoughtController } from '@/controllers/thoughtController';

const router = Router();

router.post('/thoughts', validateRequest(createThoughtSchema), thoughtController.create);

export default router;
```

### Migration Path

No migration needed - this is a new feature.

## Compliance

- [x] **SOLID - SRP**: Validation separated from business logic (middleware vs controller)
- [x] **SOLID - OCP**: Easy to extend schemas without modifying existing code
- [x] **Design Pattern**: Middleware pattern for cross-cutting concerns
- [x] **Testability**: Schemas testable in isolation, middleware testable with mock req/res
- [x] **TypeScript Strict**: Full type safety with `z.infer<>`
- [x] **Performance**: Validation <5ms (per APR requirement)

## References

- Zod Documentation: https://zod.dev/
- Express Middleware Pattern: https://expressjs.com/en/guide/using-middleware.html
- APR Section 4.2: Input Validation
