# Prisma 7.x Initialization Patterns

## Overview

Prisma 7.x introduced breaking changes requiring **adapters** for SQLite connections.

**Critical**: You cannot initialize PrismaClient without an adapter in Prisma 7.x.

---

## Required Adapter for SQLite

### Installation

```bash
npm install @prisma/adapter-libsql better-sqlite3
```

### Why Adapters?

Prisma 7.x decoupled database drivers to support multiple SQLite implementations:

- **better-sqlite3**: Synchronous, faster, production-ready
- **libsql**: Async, Turso-compatible, edge functions

---

## Correct Initialization Pattern

### With Adapter (Prisma 7.x) ✅

```typescript
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Strip query parameters from DATABASE_URL (adapter doesn't support them)
let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
dbUrl = dbUrl.split('?')[0]; // Remove ?journal_mode=WAL

// Create adapter
const adapter = new PrismaLibSql({
  url: dbUrl,
});

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'], // Optional logging
});
```

### Without Adapter (Prisma 4.x-6.x) ❌ OUTDATED

```typescript
// ❌ This fails in Prisma 7.x
const prisma = new PrismaClient();
// Error: Using engine type "client" requires either "adapter" or "accelerateUrl"
```

---

## Implementation Locations

### 1. Infrastructure Singleton (Production Code)

**File**: `backend/src/infrastructure/prisma/client.ts`

```typescript
/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of Prisma Client exists throughout the application lifecycle.
 * In development, we attach to globalThis to prevent hot-reloading from creating multiple instances.
 */

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Strip query parameters from DATABASE_URL
  let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  dbUrl = dbUrl.split('?')[0];

  const adapter = new PrismaLibSql({
    url: dbUrl,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Development: Reuse global instance to prevent hot-reload issues
// Production: Create new instance
export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 2. Test Setup (Test Files)

**File**: `backend/src/__tests__/setup.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// In-memory database for tests
const adapter = new PrismaLibSql({
  url: 'file::memory:?cache=shared',
});

export const testPrisma = new PrismaClient({
  adapter,
  log: ['error'], // Suppress query logs in tests
});

// Cleanup after all tests
afterAll(async () => {
  await testPrisma.$disconnect();
});
```

### 3. Seed Scripts

**File**: `backend/prisma/seed.ts`

```typescript
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Initialize for seeding
let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
dbUrl = dbUrl.split('?')[0];

const adapter = new PrismaLibSql({
  url: dbUrl,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  // Your seeding logic
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Common Patterns

### Query Parameter Handling

**Problem**: LibSQL adapter doesn't support URL query parameters

```
DATABASE_URL=file:./dev.db?journal_mode=WAL
                           ^^^^^^^^^^^^^^^^^ This breaks adapter initialization
```

**Solution**: Strip query parameters before passing to adapter

```typescript
let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
dbUrl = dbUrl.split('?')[0]; // Remove everything after ?

const adapter = new PrismaLibSql({ url: dbUrl });
```

**Note**: SQLite configuration (journal_mode, etc.) is handled by Prisma schema datasource URL, not adapter.

### Environment-Specific Logging

```typescript
const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error'] // Verbose in dev
      : ['error'], // Errors only in production
});
```

### Transaction Support

```typescript
// Transactions work the same way
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  const thought = await tx.thought.create({
    data: { userId: user.id, ... }
  });
  return { user, thought };
});
```

---

## Migration from Prisma 6.x

### Before (Prisma 6.x)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

### After (Prisma 7.x)

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

let dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
dbUrl = dbUrl.split('?')[0];

const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });
```

### Migration Checklist

- [ ] Install `@prisma/adapter-libsql` and `better-sqlite3`
- [ ] Update all PrismaClient initializations to use adapter
- [ ] Strip query parameters from DATABASE_URL before adapter initialization
- [ ] Update test setup files
- [ ] Update seed scripts
- [ ] Test all database operations

---

## Troubleshooting

### Error: "Using engine type 'client' requires either 'adapter' or 'accelerateUrl'"

**Cause**: PrismaClient initialized without adapter in Prisma 7.x

**Solution**: Add adapter initialization

```typescript
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });
```

### Error: "Invalid database URL"

**Cause**: Query parameters passed to adapter

**Solution**: Strip query parameters

```typescript
dbUrl = dbUrl.split('?')[0];
```

### Error: "Cannot find module '@prisma/adapter-libsql'"

**Cause**: Adapter not installed

**Solution**: Install dependencies

```bash
npm install @prisma/adapter-libsql better-sqlite3
```

---

## Performance Considerations

### Better-SQLite3 vs LibSQL

- **better-sqlite3**: Synchronous API, 10-20% faster for local SQLite
- **libsql**: Async API, required for Turso (hosted SQLite)

**Recommendation**: Use `better-sqlite3` for local development and production unless using Turso.

### Connection Pooling

SQLite is file-based - connection pooling handled by adapter internally. No manual configuration needed.

---

## References

- **Prisma 7 Release Notes**: https://github.com/prisma/prisma/releases/tag/7.0.0
- **LibSQL Adapter Documentation**: https://www.prisma.io/docs/orm/overview/databases/turso
- **Better-SQLite3**: https://github.com/WiseLibs/better-sqlite3

---

## Related Documentation

- [Database Structure](./database-structure.md) - Schema and migrations
- [Repository Pattern](../../codebase/development-guide.md#repository-pattern) - Using Prisma in repositories
- [Testing Guide](../jest/README.md) - Setting up test databases

---

**Last Updated**: 2026-01-02  
**Prisma Version**: 7.2.0  
**Adapter Version**: @prisma/adapter-libsql 7.2.0
