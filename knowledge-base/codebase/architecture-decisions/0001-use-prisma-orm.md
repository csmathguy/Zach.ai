# ADR-001: Use Prisma ORM for Database Access

**Status**: Accepted  
**Date**: 2026-01-01  
**Author**: Architect Agent  
**APR Reference**: [../plan/apr.md](../plan/apr.md) - Section 4 (Feature Breakdown)

## Context

We need a TypeScript-first ORM to interact with SQLite in a type-safe manner. The application requires:

- Strong TypeScript integration with auto-generated types
- Migration management for schema version control
- Type-safe query builder
- Support for SQLite with potential migration to PostgreSQL later
- Good developer experience with tooling (Prisma Studio, CLI)

## Decision

We will use **Prisma ORM 6.0+** as our database access layer.

## Rationale

### Why Prisma?

1. **TypeScript-First**: Auto-generates fully typed client from schema
2. **Declarative Schema**: Single source of truth in `schema.prisma`
3. **Migration System**: Built-in migrations with version control
4. **Database Agnostic**: Easy migration from SQLite → PostgreSQL
5. **Developer Experience**: Prisma Studio for data inspection, excellent CLI
6. **Enterprise Ready**: Used by Vercel, Netlify, and large production systems

### Alternatives Considered

1. **TypeORM**
   - **Pros**: Mature, decorator-based, Active Record pattern
   - **Cons**: Less type-safe, complex configuration, slower development
   - **Why Rejected**: Prisma's generated client is more type-safe

2. **Knex.js + Manual Types**
   - **Pros**: Flexible, low-level control
   - **Cons**: Manual type management, no schema versioning, verbose
   - **Why Rejected**: Too much boilerplate, error-prone

3. **Sequelize**
   - **Pros**: Popular, ORM features, supports many databases
   - **Cons**: Not TypeScript-first, complex API, dated patterns
   - **Why Rejected**: Poor TypeScript experience

## Consequences

### Positive

- **Type Safety**: Zero runtime type errors from database queries
- **Productivity**: Auto-generated types eliminate manual typing
- **Maintainability**: Schema changes propagate through entire codebase via types
- **Migration Path**: Easy to switch from SQLite to PostgreSQL later
- **Tooling**: Prisma Studio provides GUI for database inspection
- **Testing**: Easy to use in-memory SQLite for fast integration tests

### Negative

- **Learning Curve**: Team must learn Prisma schema language and CLI
- **Abstraction**: Less control over raw SQL compared to query builders
- **Migration Lock-in**: Prisma migrations format is proprietary (though exportable)

### Risks

**Risk**: Prisma performance for complex queries  
**Mitigation**: Prisma supports raw SQL queries for edge cases. Benchmark early.

**Risk**: Prisma breaking changes in future versions  
**Mitigation**: Lock exact version in package.json. Test before upgrading.

## Implementation Notes

### Key Files to Create

```
backend/
├── src/
│   └── infrastructure/
│       └── prisma/
│           ├── client.ts              # Prisma Client singleton
│           ├── repositories/          # Repository implementations
│           │   ├── PrismaUserRepository.ts
│           │   ├── PrismaThoughtRepository.ts
│           │   ├── PrismaProjectRepository.ts
│           │   └── PrismaActionRepository.ts
│           └── mappers/               # Prisma → Domain model mappers
│               ├── userMapper.ts
│               ├── thoughtMapper.ts
│               ├── projectMapper.ts
│               └── actionMapper.ts
└── prisma/
    ├── schema.prisma                  # Database schema definition
    ├── migrations/                    # Migration history
    └── seed.ts                        # Database seeding script
```

### Integration Points

1. **Install Dependencies**:

   ```bash
   npm install prisma @prisma/client --save
   npm install --save-dev prisma
   ```

2. **Initialize Prisma**:

   ```bash
   npx prisma init --datasource-provider sqlite
   ```

3. **Environment Configuration**:

   ```env
   DATABASE_URL="file:./dev.db?journal_mode=WAL"
   ```

4. **Schema Example** (see ADR-004 for full schema):

   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }

   model User {
     id        String   @id @default(uuid())
     email     String   @unique
     name      String?
     createdAt DateTime @default(now())
   }
   ```

5. **Generate Client**:

   ```bash
   npx prisma generate
   ```

6. **Run Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

## Compliance

- [x] **SRP**: Prisma Client handles only database access
- [x] **OCP**: Repository Pattern allows swapping implementations
- [x] **LSP**: Prisma repositories implement domain interfaces
- [x] **ISP**: Small, focused repository interfaces per entity
- [x] **DIP**: Services depend on repository interfaces, not Prisma directly
- [x] **Testing**: Supports both unit tests (mocks) and integration tests (in-memory)
- [x] **Performance**: WAL mode enables concurrent reads (see ADR-002)
- [x] **Migration Path**: Database-agnostic schema allows PostgreSQL migration

## Related ADRs

- ADR-002: Use SQLite with WAL Mode
- ADR-003: Use Repository Pattern for Database Abstraction
- ADR-004: Layered Architecture (Domain/Infrastructure/Application/API)

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Knowledge Base: Prisma](../../../../knowledge-base/prisma/README.md)
- [Development Guide: Repository Pattern](../../../../knowledge-base/codebase/development-guide.md#repository-pattern)
