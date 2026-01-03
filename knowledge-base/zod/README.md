# Zod Validation Library

## Overview

**Zod** is a TypeScript-first schema validation library with static type inference. It provides a declarative API for defining schemas that validate data at runtime while simultaneously providing compile-time type safety. Zod eliminates the need to duplicate type definitions and validation logic.

**Official Documentation**: https://zod.dev/  
**Version**: 4.x (stable)  
**Package Size**: 2KB gzipped (core bundle)  
**Dependencies**: Zero external dependencies  
**License**: MIT

### Philosophy

Zod's design philosophy centers on:

- **Type inference**: Schemas automatically generate TypeScript types
- **Single source of truth**: Define validation rules once, get types for free
- **Developer experience**: Chainable API, clear error messages, zero configuration
- **Composability**: Schemas are composable and reusable
- **Runtime safety**: Validate unknown inputs before they reach your code

---

## Why We Use Zod

We chose Zod for the O2-thought-capture feature (and will use throughout the project) for the following reasons:

### 1. Type Inference (Single Source of Truth)

**Problem**: Traditional validation libraries require defining types AND validation rules separately.

**express-validator approach** (rejected):

```typescript
// Define type
interface CreateThoughtDto {
  text: string;
  source: 'text' | 'voice' | 'api';
}

// Define validation (duplicate!)
(body('text').isString().isLength({ min: 1, max: 10000 }),
  body('source').isIn(['text', 'voice', 'api']));
```

**Zod approach** (our choice):

```typescript
// Define validation schema
const createThoughtSchema = z.object({
  text: z.string().min(1).max(10000),
  source: z.enum(['text', 'voice', 'api']).default('text'),
});

// Infer type automatically
type CreateThoughtDto = z.infer<typeof createThoughtSchema>;
// => { text: string; source: 'text' | 'voice' | 'api' }
```

**Benefit**: Change validation rules → types update automatically. No duplication, no drift.

### 2. Express Integration

Zod integrates seamlessly with Express middleware patterns:

```typescript
// validation middleware
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(result.error.issues);
    }
    req.body = result.data; // typed!
    next();
  };
}

// usage
router.post('/api/thoughts', validateBody(createThoughtSchema), createThought);
```

### 3. Lightweight & Zero Dependencies

- **2KB gzipped** - minimal bundle size impact
- **Zero dependencies** - no transitive dependency bloat
- **Tree-shakeable** - only import what you use

### 4. TypeScript Strict Mode Required

Zod **requires** TypeScript strict mode, which aligns with our existing strict configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

This ensures maximum type safety across our entire codebase.

### 5. Rich Ecosystem

- **tRPC**: End-to-end type-safe APIs
- **React Hook Form**: Form validation with Zod schemas
- **Prisma**: Generate Zod schemas from Prisma models
- **Fastify**: Native Zod support in plugins

---

## Installation & Setup

### Step 1: Install Zod

```bash
npm install zod
```

**No peer dependencies required** - Zod works with TypeScript 5.0+.

### Step 2: Verify TypeScript Config

Ensure strict mode is enabled (already done in our project):

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Step 3: Import and Use

```typescript
import { z } from 'zod';

const schema = z.string();
schema.parse('hello'); // => 'hello'
schema.parse(42); // throws ZodError
```

---

## Quick Reference

### Common Schemas

```typescript
// Primitives
z.string(); // string
z.number(); // number
z.boolean(); // boolean
z.date(); // Date
z.bigint(); // bigint
z.undefined(); // undefined
z.null(); // null
z.any(); // any
z.unknown(); // unknown
z.never(); // never
z.void(); // void (equivalent to undefined)

// String validations
z.string().min(5); // min length
z.string().max(255); // max length
z.string().length(10); // exact length
z.string().regex(/^\d+$/); // regex validation
z.string().email(); // email format
z.string().url(); // URL format
z.string().uuid(); // UUID format
z.string().trim(); // trim whitespace
z.string().toLowerCase(); // convert to lowercase

// Number validations
z.number().min(0); // minimum value
z.number().max(100); // maximum value
z.number().positive(); // > 0
z.number().nonnegative(); // >= 0
z.number().negative(); // < 0
z.number().int(); // integer only
z.number().multipleOf(5); // divisible by 5

// Objects
z.object({
  name: z.string(),
  age: z.number().optional(),
});

// Arrays
z.array(z.string()); // string[]
z.array(z.number()).min(1); // non-empty array

// Enums
z.enum(['red', 'green', 'blue']); // union of literals
z.literal('admin'); // single literal value

// Optionals & Nullables
z.string().optional(); // string | undefined
z.string().nullable(); // string | null
z.string().nullish(); // string | null | undefined

// Unions
z.union([z.string(), z.number()]); // string | number
z.string().or(z.number()); // shorthand

// Records
z.record(z.string(), z.number()); // Record<string, number>

// Tuples
z.tuple([z.string(), z.number()]); // [string, number]

// Defaults
z.string().default('hello'); // default value if undefined
```

### Parsing Methods

```typescript
// .parse() - throws ZodError on failure
const result = schema.parse(data);

// .safeParse() - returns result object (no throw)
const result = schema.safeParse(data);
if (!result.success) {
  result.error; // ZodError
} else {
  result.data; // typed data
}

// .parseAsync() - async version (for async refinements)
const result = await schema.parseAsync(data);

// .safeParseAsync() - async safe version
const result = await schema.safeParseAsync(data);
```

### Type Inference

```typescript
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;
// => { name: string; age: number }

// Input vs Output types (for transforms)
type UserInput = z.input<typeof userSchema>; // before validation
type UserOutput = z.output<typeof userSchema>; // after validation
```

---

## Core Concepts

### 1. Schema Definition

Schemas are the building blocks of Zod. Every schema represents a type and validation rules:

```typescript
// Simple schema
const emailSchema = z.string().email();

// Complex nested schema
const userSchema = z.object({
  email: z.string().email(),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    bio: z.string().optional(),
  }),
  roles: z.array(z.enum(['admin', 'user', 'guest'])),
});
```

### 2. Parsing vs Validation

**Parsing** = Validation + Type Coercion + Type Assertion

```typescript
const schema = z.string();

// Parsing (recommended)
const result = schema.parse('hello'); // returns 'hello' (typed as string)

// Safe parsing (no throw)
const result = schema.safeParse('hello');
if (result.success) {
  result.data; // typed as string
}
```

### 3. Type Inference

Zod's killer feature - automatic type generation:

```typescript
const schema = z.object({
  name: z.string(),
  tags: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()),
});

type Data = z.infer<typeof schema>;
// => {
//   name: string;
//   tags: string[];
//   metadata: Record<string, unknown>;
// }
```

### 4. Error Handling

Zod provides detailed error information:

```typescript
try {
  schema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    error.issues.forEach((issue) => {
      console.log(issue.path); // ['field', 'name']
      console.log(issue.message); // "Invalid email"
      console.log(issue.code); // "invalid_string"
    });
  }
}
```

### 5. Composition

Schemas are composable and reusable:

```typescript
// Define reusable pieces
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);

// Compose into larger schemas
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerSchema = loginSchema.extend({
  confirmPassword: passwordSchema,
});
```

---

## TypeScript Integration

### Strict Mode (Required)

Zod **requires** TypeScript strict mode. Our project already has this configured:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type-Safe Function Parameters

```typescript
function createUser(data: z.infer<typeof userSchema>) {
  // data is fully typed!
  return { id: generateId(), ...data };
}
```

### Generic Validation Functions

```typescript
function validateData<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

const user = validateData(userSchema, unknownData);
// user is typed according to userSchema
```

### Discriminated Unions (Advanced)

```typescript
const resultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.string() }),
  z.object({ status: z.literal('error'), error: z.string() }),
]);

type Result = z.infer<typeof resultSchema>;
// => { status: 'success'; data: string } | { status: 'error'; error: string }

function handleResult(result: Result) {
  if (result.status === 'success') {
    result.data; // TypeScript knows this exists
  } else {
    result.error; // TypeScript knows this exists
  }
}
```

---

## Common Patterns

### Pattern 1: Express Validation Middleware

**Our standard pattern for O2-thought-capture** (from ADR-001):

```typescript
// middleware/validation.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Custom error class
        throw new ValidationError('Validation failed', result.error.issues);
      }

      // Replace req.body with parsed (typed) data
      req.body = result.data;
      next();
    } catch (error) {
      next(error); // Pass to error handler
    }
  };
}

// Usage
router.post('/api/thoughts', validateBody(createThoughtSchema), createThought);
```

### Pattern 2: Environment Variable Validation

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),
});

export const env = envSchema.parse(process.env);
// env is typed & validated at startup
```

### Pattern 3: API Response Schemas

```typescript
// schemas/api.schemas.ts
const successResponseSchema = z.object({
  status: z.literal('success'),
  data: z.unknown(), // or specific schema
  timestamp: z.string().datetime(),
});

const errorResponseSchema = z.object({
  status: z.literal('error'),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.unknown()).optional(),
  }),
  timestamp: z.string().datetime(),
});

export const apiResponseSchema = z.union([successResponseSchema, errorResponseSchema]);
```

### Pattern 4: Nested Object Validation

```typescript
// schemas/thought.schemas.ts
export const createThoughtSchema = z.object({
  text: z.string().min(1).max(10000),
  source: z.enum(['text', 'voice', 'api']).default('text'),
  metadata: z
    .object({
      clientVersion: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export type CreateThoughtDto = z.infer<typeof createThoughtSchema>;
```

### Pattern 5: Custom Validation (Refinements)

```typescript
// Password confirmation validation
const passwordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // error path
  });

// Email domain validation
const emailSchema = z
  .string()
  .email()
  .refine((email) => email.endsWith('@company.com'), { message: 'Must use company email' });

// Async validation (database check)
const uniqueEmailSchema = z
  .string()
  .email()
  .refine(
    async (email) => {
      const exists = await db.user.findUnique({ where: { email } });
      return !exists;
    },
    { message: 'Email already taken' }
  );
```

### Pattern 6: Schema Reuse & Extension

```typescript
// Base schemas
const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Extend base schema
const userSchema = baseEntitySchema.extend({
  email: z.string().email(),
  name: z.string(),
});

const thoughtSchema = baseEntitySchema.extend({
  text: z.string(),
  userId: z.string().uuid(),
});
```

### Pattern 7: Transform Data During Parsing

```typescript
// Trim and lowercase email
const emailSchema = z.string().trim().toLowerCase().email();

// Parse date strings to Date objects
const dateSchema = z
  .string()
  .datetime()
  .transform((str) => new Date(str));

// Parse comma-separated string to array
const csvSchema = z.string().transform((str) => str.split(',').map((s) => s.trim()));
```

---

## Testing with Zod

### Unit Testing Schemas

```typescript
// __tests__/schemas/thought.schemas.test.ts
import { describe, it, expect } from '@jest/globals';
import { createThoughtSchema } from '@/schemas/thought.schemas';

describe('createThoughtSchema', () => {
  it('should accept valid thought data', () => {
    const validData = {
      text: 'This is a valid thought',
      source: 'text' as const,
    };

    const result = createThoughtSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty text', () => {
    const invalidData = {
      text: '',
      source: 'text' as const,
    };

    const result = createThoughtSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_small');
    }
  });

  it('should apply default source', () => {
    const data = { text: 'Hello' };

    const result = createThoughtSchema.parse(data);
    expect(result.source).toBe('text');
  });
});
```

### Integration Testing with Express

```typescript
// __tests__/api/thoughts.test.ts
import request from 'supertest';
import app from '@/server';

describe('POST /api/thoughts', () => {
  it('should reject invalid request body', async () => {
    const response = await request(app).post('/api/thoughts').send({ text: '' }); // invalid (empty)

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should accept valid request body', async () => {
    const response = await request(app).post('/api/thoughts').send({
      text: 'Valid thought',
      source: 'text',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.text).toBe('Valid thought');
  });
});
```

### Testing Custom Validators

```typescript
describe('passwordSchema', () => {
  it('should validate password match', () => {
    const validData = {
      password: 'password123',
      confirmPassword: 'password123',
    };

    expect(() => passwordSchema.parse(validData)).not.toThrow();
  });

  it('should reject mismatched passwords', () => {
    const invalidData = {
      password: 'password123',
      confirmPassword: 'different',
    };

    expect(() => passwordSchema.parse(invalidData)).toThrow(z.ZodError);
  });
});
```

---

## Performance Considerations

### 1. Schema Caching

Define schemas at module level (not inside functions):

```typescript
// ✅ Good - defined once
const userSchema = z.object({
  name: z.string(),
});

export function validateUser(data: unknown) {
  return userSchema.parse(data);
}

// ❌ Bad - recreated on every call
export function validateUser(data: unknown) {
  const userSchema = z.object({ name: z.string() });
  return userSchema.parse(data);
}
```

### 2. safeParse vs parse

- Use `.safeParse()` when errors are expected (user input)
- Use `.parse()` when errors are bugs (internal data)

```typescript
// User input - expect errors
router.post('/api/users', (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  // ...
});

// Internal data - should never fail
function processInternalData(data: unknown) {
  const validated = internalSchema.parse(data);
  // If this throws, it's a bug
}
```

### 3. Discriminated Unions for Performance

Use discriminated unions instead of regular unions when possible:

```typescript
// ✅ Fast - checks discriminator first
const fastUnion = z.discriminatedUnion('type', [
  z.object({ type: z.literal('a'), value: z.string() }),
  z.object({ type: z.literal('b'), value: z.number() }),
]);

// ❌ Slower - tries each option sequentially
const slowUnion = z.union([
  z.object({ type: z.literal('a'), value: z.string() }),
  z.object({ type: z.literal('b'), value: z.number() }),
]);
```

### 4. Async Validators Sparingly

Async refinements (e.g., database checks) add latency:

```typescript
// Use only when necessary
const uniqueEmailSchema = z
  .string()
  .email()
  .refine(async (email) => !(await emailExists(email)), 'Email already taken');

// Consider caching or batching checks
```

---

## Troubleshooting

### Issue: "Type instantiation is excessively deep"

**Cause**: Complex nested schemas exceed TypeScript's recursion limit.

**Solution**: Use `z.lazy()` for recursive types:

```typescript
// ❌ Fails on deep nesting
const categorySchema = z.object({
  name: z.string(),
  subcategories: z.array(categorySchema), // Error!
});

// ✅ Works with lazy
const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(categorySchema),
  })
);
```

### Issue: Error messages not clear

**Solution**: Customize error messages:

```typescript
const schema = z.string().min(8, {
  message: 'Password must be at least 8 characters',
});

// Or with refinements
const schema = z
  .string()
  .refine((val) => val.includes('@'), { message: 'Must be a valid email address' });
```

### Issue: Can't use optional with default

**Solution**: Use `.optional()` OR `.default()`, not both:

```typescript
// ❌ Bad - confusing intent
z.string().optional().default('hello');

// ✅ Good - use default (implies optional)
z.string().default('hello');

// ✅ Good - truly optional
z.string().optional();
```

### Issue: Transform not applying

**Solution**: Ensure you're using `.parse()` not just type checking:

```typescript
const schema = z.string().transform((s) => s.toUpperCase());

// ❌ Type-only (no transform)
const data: z.infer<typeof schema> = 'hello';

// ✅ Runtime parsing (transform applies)
const data = schema.parse('hello'); // => 'HELLO'
```

### Issue: Async validation throwing errors

**Solution**: Use `.parseAsync()` or `.safeParseAsync()`:

```typescript
const schema = z.string().refine(async (val) => {
  return await checkDatabase(val);
});

// ❌ Throws error
const result = schema.parse(data);

// ✅ Correct
const result = await schema.parseAsync(data);
```

---

## Comparison with Alternatives

### Zod vs express-validator

| Feature                | Zod          | express-validator      |
| ---------------------- | ------------ | ---------------------- |
| Type inference         | ✅ Automatic | ❌ Manual types        |
| Single source of truth | ✅ Yes       | ❌ Separate validation |
| Bundle size            | 2KB          | 12KB+                  |
| Dependencies           | Zero         | Multiple               |
| TypeScript-first       | ✅ Yes       | Partial                |
| Composability          | ✅ Excellent | Limited                |

### Zod vs class-validator (with class-transformer)

| Feature         | Zod          | class-validator            |
| --------------- | ------------ | -------------------------- |
| Type inference  | ✅ Automatic | ❌ Manual                  |
| Decorator-based | ❌ No        | ✅ Yes                     |
| Bundle size     | 2KB          | 20KB+                      |
| Dependencies    | Zero         | reflect-metadata           |
| Transformation  | ✅ Built-in  | Requires class-transformer |
| Plain objects   | ✅ Yes       | ❌ Requires classes        |

### Zod vs Joi

| Feature            | Zod          | Joi            |
| ------------------ | ------------ | -------------- |
| Type inference     | ✅ Automatic | ❌ Manual      |
| TypeScript support | ✅ Native    | Via @types/joi |
| Bundle size        | 2KB          | 146KB          |
| API style          | Chainable    | Object-based   |
| Performance        | Fast         | Slower         |

### Zod vs Yup

| Feature           | Zod       | Yup        |
| ----------------- | --------- | ---------- |
| Type inference    | ✅ Better | ⚠️ Limited |
| Bundle size       | 2KB       | 15KB       |
| TypeScript-first  | ✅ Yes    | ⚠️ Partial |
| Async validation  | ✅ Yes    | ✅ Yes     |
| Transform support | ✅ Yes    | ✅ Yes     |

**Our Decision**: Zod wins on type inference (single source of truth), bundle size, and zero dependencies. See [ADR-001](../codebase/architecture-decisions/adr-001-express-validation-strategy.md) for full rationale.

---

## Migration Guides

### From express-validator

**Before** (express-validator):

```typescript
import { body, validationResult } from 'express-validator';

router.post('/users', body('email').isEmail(), body('age').isInt({ min: 18 }), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
});
```

**After** (Zod):

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});

router.post('/users', validateBody(userSchema), (req, res) => {
  // req.body is typed!
  // ...
});
```

### From class-validator

**Before** (class-validator):

```typescript
import { IsEmail, MinLength } from 'class-validator';

class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}

// Separate type definition
```

**After** (Zod):

```typescript
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type CreateUserDto = z.infer<typeof createUserSchema>;
// Type and validation in one place
```

---

## Best Practices

### 1. Define Schemas at Module Level

```typescript
// ✅ Good - reusable, performant
export const userSchema = z.object({
  name: z.string(),
});

// ❌ Bad - recreated every time
export function validateUser(data: unknown) {
  const schema = z.object({ name: z.string() });
  return schema.parse(data);
}
```

### 2. Use Type Inference Everywhere

```typescript
// ✅ Good - types derived from schema
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});
type User = z.infer<typeof userSchema>;

// ❌ Bad - duplicate type definition
interface User {
  name: string;
  age: number;
}
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});
```

### 3. Validate External Inputs Only

```typescript
// ✅ Good - validate untrusted input
router.post('/api/users', validateBody(userSchema), handler);

// ❌ Unnecessary - internal data already typed
function processUser(user: User) {
  userSchema.parse(user); // Redundant!
}
```

### 4. Use safeParse for User Input

```typescript
// ✅ Good - graceful error handling
const result = schema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error });
}

// ❌ Bad - unhandled errors crash server
const data = schema.parse(req.body);
```

### 5. Compose Schemas for Reusability

```typescript
// ✅ Good - composable pieces
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerSchema = loginSchema.extend({
  name: z.string(),
});
```

### 6. Document Complex Schemas

```typescript
/**
 * Schema for creating a new thought.
 *
 * - text: Main content (1-10000 chars)
 * - source: Origin of thought (defaults to 'text')
 * - metadata: Optional client information
 */
export const createThoughtSchema = z.object({
  text: z.string().min(1).max(10000),
  source: z.enum(['text', 'voice', 'api']).default('text'),
  metadata: z
    .object({
      clientVersion: z.string().optional(),
    })
    .optional(),
});
```

### 7. Use Discriminated Unions for Variants

```typescript
// ✅ Good - efficient and type-safe
const messageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('image'), url: z.string().url() }),
]);

// ❌ Less efficient
const messageSchema = z.union([
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('image'), url: z.string().url() }),
]);
```

---

## Advanced Topics

### Custom Error Messages

```typescript
const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

### Preprocessing Input

```typescript
const preprocessedSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim() : val),
  z.string().min(1)
);
```

### Branded Types

```typescript
const UserId = z.string().uuid().brand<'UserId'>();
type UserId = z.infer<typeof UserId>;

const ThoughtId = z.string().uuid().brand<'ThoughtId'>();
type ThoughtId = z.infer<typeof ThoughtId>;

// TypeScript prevents mixing IDs
function getThought(id: ThoughtId) {
  /* ... */
}
const userId = UserId.parse('...'); // UserId brand
getThought(userId); // ❌ Type error - UserId not assignable to ThoughtId
```

### Recursive Schemas

```typescript
interface Category {
  name: string;
  subcategories: Category[];
}

const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(categorySchema),
  })
);
```

### Function Schemas

```typescript
const myFunction = z.function().args(z.string(), z.number()).returns(z.boolean());

type MyFunction = z.infer<typeof myFunction>;
// (arg0: string, arg1: number) => boolean

const impl = myFunction.implement((str, num) => {
  // inputs validated automatically
  return str.length > num;
});
```

---

## References

- **Official Documentation**: https://zod.dev/
- **GitHub Repository**: https://github.com/colinhacks/zod
- **NPM Package**: https://www.npmjs.com/package/zod
- **Changelog**: https://github.com/colinhacks/zod/releases
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **ADR-001** (our project): Express Validation Strategy (Zod choice rationale)

### Related Technologies

- **tRPC**: https://trpc.io/ (end-to-end type safety with Zod)
- **React Hook Form**: https://react-hook-form.com/api/usezodresolver (form validation)
- **Prisma**: https://github.com/omar-dulaimi/prisma-zod-generator (generate Zod from Prisma)
- **Fastify**: https://github.com/turkerdev/fastify-type-provider-zod (Fastify + Zod)

### Community Resources

- **Zod Discord**: https://discord.gg/RcG33DQJdf
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/zod
- **Awesome Zod**: https://github.com/JacobWeisenburger/awesome-zod (curated list)

---

## Summary

**Zod in 10 Points**:

1. ✅ **TypeScript-first** - Automatic type inference from schemas
2. ✅ **Single source of truth** - Define validation once, get types free
3. ✅ **Lightweight** - 2KB gzipped, zero dependencies
4. ✅ **Composable** - Build complex schemas from simple pieces
5. ✅ **Expressive** - Chainable API, clear error messages
6. ✅ **Transforms** - Parse and transform data in one step
7. ✅ **Async support** - Refinements can be async (database checks)
8. ✅ **Framework agnostic** - Works with Express, Fastify, Next.js, etc.
9. ✅ **Rich ecosystem** - tRPC, React Hook Form, Prisma integration
10. ✅ **Battle-tested** - Used in production by thousands of projects

**When to Use Zod**:

- Validating API request bodies (Express, Fastify)
- Environment variable validation
- Configuration file parsing
- External API response validation
- Form validation (with React Hook Form)
- CLI argument parsing

**When NOT to Use Zod**:

- Validating internal typed data (redundant)
- Simple presence checks (use TypeScript types)
- Performance-critical hot paths (use manual checks)

**Golden Rule**: Use Zod to validate **unknown/untrusted** inputs. Don't use it on already-typed internal data.

---

**Next Steps**:

1. Review [ADR-001](../codebase/architecture-decisions/adr-001-express-validation-strategy.md) for our validation strategy
2. See [O2-thought-capture schemas](../../backend/src/schemas/thought.schemas.ts) for real-world examples
3. Read [Express integration patterns](../express/README.md) for middleware setup
4. Explore [Testing with Zod](../jest/README.md#testing-validation-schemas) for test strategies
