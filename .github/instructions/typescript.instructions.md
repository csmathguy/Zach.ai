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

### Module Resolution with Jest

**CRITICAL**: When working with TypeScript + Jest, do NOT add `.js` extensions to import statements.

```typescript
// ❌ WRONG - Jest cannot resolve .js extensions in TypeScript
export { userMapper } from './userMapper.js';
export { thoughtMapper } from './thoughtMapper.js';

// ✅ CORRECT - Omit extensions, let Jest handle resolution
export { userMapper } from './userMapper';
export { thoughtMapper } from './thoughtMapper';
```

**Why**:

- TypeScript compiler (ESM mode) expects `.js` extensions for Node.js ESM compatibility
- Jest's `ts-jest` preset uses `moduleNameMapper` and doesn't expect `.js` extensions
- Barrel exports (`index.ts`) should omit extensions for Jest to resolve properly

**Solution**: Use extension-less imports in TypeScript. `ts-jest` handles the module resolution correctly.

## Type Safety

## Type Safety Best Practices

**Deep Dive**: [Development Guide - TypeScript](../../knowledge-base/codebase/development-guide.md#typescript-best-practices)

```typescript
// ❌ Avoid 'any'
function process(data: any) {}

// ✅ Use 'unknown' with type guards
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Safely handle typed data
  }
}

// ✅ Interfaces for objects, types for unions
interface User {
  id: string;
  name: string;
}

type Status = 'active' | 'inactive';
```

## Naming & Organization

- `PascalCase` - Interfaces, Types, Classes
- `camelCase` - Functions, variables, methods
- `UPPER_CASE` - Constants

**Imports**: external → internal (aliases) → relative

```typescript
import { useState } from 'react';
import { User } from '@domain/models/User';
import { formatDate } from './utils';
```

## Pre-Commit Validation

- No TypeScript errors (`npm run typecheck`)
- All functions have explicit return types
- No unused imports/variables

---

**SOLID Principles**: [Development Guide](../../knowledge-base/codebase/development-guide.md#solid-principles)  
**TypeScript Patterns**: [Development Guide](../../knowledge-base/codebase/development-guide.md#typescript-best-practices)
