---
name: TypeScript guidelines
applyTo: '**/*.{ts,tsx}'
---

## TypeScript Strict Mode

- Strict mode enabled - all strict checks enforced
- Explicit types required on function parameters and return values
- No implicit `any` types allowed

## TypeScript Path Aliases

**Always use TypeScript path aliases instead of relative imports** for cleaner, more maintainable code.

### Configured Aliases

**Backend** (`backend/tsconfig.json`):

- `@/*` → `src/*` (root)
- `@domain/*` → `src/domain/*` (domain layer)
- `@infrastructure/*` → `src/infrastructure/*` (infrastructure layer)
- `@application/*` → `src/application/*` (application/service layer)
- `@api/*` → `src/api/*` (API/routes layer)
- `@shared/*` → `src/shared/*` (shared utilities)
- `@utils/*` → `src/utils/*` (utility functions)

**Frontend** (`frontend/tsconfig.json`):

- `@/*` → `src/*` (root)
- `@app/*` → `src/app/*` (app shell)
- `@features/*` → `src/features/*` (feature modules)
- `@shared/*` → `src/shared/*` (shared components/hooks)
- `@utils/*` → `src/utils/*` (utility functions)

### Usage Examples

```typescript
// ❌ Bad - Relative imports
import { User } from '../../domain/models/User';
import { formatDate } from '../../../utils/formatters';

// ✅ Good - Path aliases
import { User } from '@domain/models/User';
import { formatDate } from '@utils/formatters';
```

### Configuration Required

Path aliases require configuration in three places:

1. **TypeScript** (`tsconfig.json`): `compilerOptions.paths`
2. **Jest** (`jest.config.js`): `moduleNameMapper`
3. **Vite** (frontend only, `vite.config.ts`): `resolve.alias`

All three are already configured - just use the aliases!

## Type Safety

### Avoid `any`

```typescript
// ❌ Bad
function process(data: any) {}

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard narrows the type
  }
}
```

### Prefer Interfaces for Objects

```typescript
// ✅ Use interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Use type for unions, intersections, primitives
type Status = 'active' | 'inactive';
type UserWithTimestamps = User & { createdAt: Date };
```

### Use Utility Types

```typescript
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserIdAndName = Pick<User, 'id' | 'name'>;
type UserWithoutEmail = Omit<User, 'email'>;
```

### Generics

```typescript
// Generic constraints
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}
```

### Type Guards

```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// Usage
if (isError(result)) {
  console.error(result.message); // TypeScript knows it's Error
}
```

## Error Handling

```typescript
// ✅ Proper async error handling
async function fetchData(): Promise<Data> {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
}
```

## Naming Conventions

- `PascalCase` - Interfaces, Types, Classes, Enums
- `camelCase` - Functions, variables, properties, methods
- `UPPER_CASE` - Constants, environment variables

## Imports

```typescript
// Organize: external → internal → relative
import { useState, useEffect } from 'react';
import { fetchUser } from '@/services/api';
import { formatDate } from './utils';
```

## Pre-Commit

- No TypeScript errors (`tsc --noEmit`)
- No unused imports or variables
- All functions have explicit return types
- Complex types are well-documented

---

**For detailed patterns**: See [knowledge-base/typescript/README.md](../../knowledge-base/typescript/README.md) (when documented)  
**For SOLID principles**: See [knowledge-base/codebase/development-guide.md](../../knowledge-base/codebase/development-guide.md)
