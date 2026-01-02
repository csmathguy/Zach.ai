# Prisma ORM Knowledge Base

## Overview

Prisma is a next-generation TypeScript ORM (Object-Relational Mapping) tool that provides type-safe database access with an intuitive data model, automated migrations, and auto-generated query builders. It's designed to make database workflows fast, productive, and enjoyable for developers.

**Official Documentation**: https://www.prisma.io/docs

**Current Version**: 6.0+ (as of January 2026)

**Philosophy**: Prisma follows a "schema-first" approach where you define your data model in a declarative `schema.prisma` file, and Prisma generates a fully type-safe client tailored to your schema. This eliminates runtime type errors and provides excellent IntelliSense support.

### Key Benefits

- **Type Safety**: Auto-generated TypeScript types for all database operations
- **Developer Experience**: Excellent autocomplete and compile-time error checking
- **Declarative Schema**: Easy-to-read schema definition language
- **Migrations**: Built-in migration system with version control
- **Multi-Database**: Supports PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, CockroachDB
- **Performance**: Optimized queries with connection pooling and batching
- **Ecosystem**: Rich tooling including Prisma Studio (visual database browser)

### Core Components

1. **Prisma Schema** - Defines data model, database connection, and generator
2. **Prisma Client** - Auto-generated, type-safe database client
3. **Prisma Migrate** - Declarative data modeling and migrations
4. **Prisma Studio** - Visual database browser and editor

---

## Quick Reference

### Essential Commands

```bash
# Initialize Prisma in existing project
npx prisma init

# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name descriptive_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (visual editor)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema without generating
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema changes without migration
npx prisma db push

# Seed database
npx prisma db seed

# Reset database (dev only)
npx prisma migrate reset
```

### Basic Schema Syntax

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // or "postgresql", "mysql", etc.
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

### Basic Client Usage

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});

// Read
const users = await prisma.user.findMany({
  where: { email: { contains: '@example.com' } },
  include: { posts: true },
});

// Update
const updated = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane Doe' },
});

// Delete
await prisma.user.delete({
  where: { id: 'user-id' },
});

// Disconnect when done
await prisma.$disconnect();
```

---

## Enterprise Best Practices

### 1. Project Structure with Prisma

#### Directory Layout

```
project/
├── prisma/
│   ├── schema.prisma          # Single source of truth for data model
│   ├── migrations/            # Migration history (git-tracked)
│   │   ├── 20260101_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── seed.ts                # Database seeding script
├── src/
│   ├── domain/
│   │   ├── models/            # Domain models (DB-agnostic)
│   │   └── repositories/      # Repository interfaces
│   ├── infrastructure/
│   │   └── prisma/
│   │       ├── client.ts      # Prisma Client singleton
│   │       └── repositories/  # Prisma repository implementations
│   └── server.ts
└── package.json
```

#### Prisma Client Singleton

**Critical**: Always use a singleton pattern to avoid exhausting database connections.

```typescript
// src/infrastructure/prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
});
```

### 2. Schema Design Best Practices

#### Use UUIDs for IDs

```prisma
model User {
  id String @id @default(uuid())
  // ... other fields
}
```

**Why**: UUIDs are globally unique, prevent ID enumeration attacks, and work well in distributed systems.

#### Timestamps on All Models

```prisma
model Post {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Enums for Fixed Sets

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   String @id @default(uuid())
  role Role   @default(USER)
}
```

#### Soft Deletes

```prisma
model Post {
  id        String    @id @default(uuid())
  deletedAt DateTime?
  // ... other fields
}
```

Query with: `where: { deletedAt: null }`

#### Indexes for Performance

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  authorId  String
  published Boolean
  createdAt DateTime @default(now())

  @@index([authorId])
  @@index([published, createdAt])
}
```

### 3. Migration Workflow

#### Development Workflow

```bash
# 1. Modify schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name add_user_role

# This does three things:
# - Creates a new migration file
# - Applies migration to database
# - Regenerates Prisma Client
```

#### Production Workflow

```bash
# In CI/CD pipeline
npx prisma migrate deploy
```

**Best Practices**:

- ✅ **Always review generated SQL** before committing migrations
- ✅ **Never edit migration files** after they're applied
- ✅ **Test migrations on a copy** of production data
- ✅ **Track migrations in Git** for version control
- ❌ **Never use `prisma db push`** in production (it's for prototyping only)

#### Migration File Example

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### 4. Repository Pattern Integration

**Critical**: Isolate Prisma from business logic using the Repository Pattern.

#### Repository Interface (Domain Layer)

```typescript
// src/domain/repositories/IUserRepository.ts
import { User } from '../models/User';

export interface CreateUserDto {
  email: string;
  name?: string;
}

export interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: Partial<CreateUserDto>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

#### Prisma Implementation (Infrastructure Layer)

```typescript
// src/infrastructure/prisma/repositories/PrismaUserRepository.ts
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { IUserRepository, CreateUserDto } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/models/User';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDto): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return this.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.toDomain(u));
  }

  async update(id: string, data: Partial<CreateUserDto>): Promise<User> {
    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // Mapper: Prisma model → Domain model
  private toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name || undefined,
      prismaUser.createdAt
    );
  }
}
```

**Benefits**:

- Business logic has no Prisma dependencies
- Easy to mock for unit tests
- Can swap database without touching business logic
- Type-safe throughout

### 5. Query Optimization

#### Use `select` for Specific Fields

```typescript
// ❌ Bad: Fetches all fields
const users = await prisma.user.findMany();

// ✅ Good: Only fetch what you need
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

#### Use `include` for Relations

```typescript
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      take: 10,
    },
  },
});
```

#### Pagination

```typescript
const page = 1;
const pageSize = 20;

const posts = await prisma.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

const totalCount = await prisma.post.count();
```

#### Transactions

```typescript
// Wrap multiple operations in a transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const post = await tx.post.create({
    data: { ...postData, authorId: user.id },
  });
  return { user, post };
});

// Interactive transactions for complex logic
await prisma.$transaction(
  async (tx) => {
    const balance = await tx.account.findUnique({ where: { id: 'account-1' } });

    if (balance.amount < 100) {
      throw new Error('Insufficient funds');
    }

    await tx.account.update({
      where: { id: 'account-1' },
      data: { amount: { decrement: 100 } },
    });
  },
  {
    maxWait: 5000, // Wait up to 5s to start tx
    timeout: 10000, // Max 10s for tx to complete
  }
);
```

#### Batching

```typescript
// Create multiple records in one query
await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' },
    { email: 'user3@example.com', name: 'User 3' },
  ],
  skipDuplicates: true, // Skip if unique constraint fails
});

// Update many
await prisma.post.updateMany({
  where: { published: false },
  data: { published: true },
});

// Delete many
await prisma.post.deleteMany({
  where: { createdAt: { lt: new Date('2020-01-01') } },
});
```

### 6. Error Handling

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

try {
  await prisma.user.create({
    data: { email: 'duplicate@example.com' },
  });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      throw new Error('User with this email already exists');
    }
    // Foreign key constraint violation
    if (error.code === 'P2003') {
      throw new Error('Related record not found');
    }
    // Record not found
    if (error.code === 'P2025') {
      throw new Error('User not found');
    }
  }
  throw error;
}
```

**Common Error Codes**:

- `P2002` - Unique constraint violation
- `P2003` - Foreign key constraint violation
- `P2025` - Record not found
- `P2021` - Table doesn't exist
- `P2022` - Column doesn't exist

---

## Testing with Prisma

### Unit Testing with Mocks

```typescript
// Mock the repository interface
import { IUserRepository } from '../domain/repositories/IUserRepository';

describe('UserService', () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let service: UserService;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new UserService(mockRepo);
  });

  it('should create user', async () => {
    mockRepo.create.mockResolvedValue(mockUser);

    const result = await service.registerUser('test@example.com', 'Test User');

    expect(mockRepo.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(result).toEqual(mockUser);
  });
});
```

### Integration Testing with In-Memory SQLite

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file::memory:?cache=shared',
    },
  },
});

beforeAll(async () => {
  // Apply migrations to in-memory database
  execSync('npx prisma migrate deploy');
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
});

export { prisma };
```

```typescript
// UserRepository.test.ts
import { PrismaUserRepository } from '../infrastructure/prisma/repositories/PrismaUserRepository';
import { prisma } from './setup';

describe('PrismaUserRepository', () => {
  let repo: PrismaUserRepository;

  beforeEach(() => {
    repo = new PrismaUserRepository(prisma);
  });

  it('should create user', async () => {
    const user = await repo.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });

  it('should find user by email', async () => {
    await repo.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    const found = await repo.findByEmail('test@example.com');

    expect(found).toBeDefined();
    expect(found!.email).toBe('test@example.com');
  });

  it('should return null for non-existent user', async () => {
    const found = await repo.findByEmail('nonexistent@example.com');
    expect(found).toBeNull();
  });
});
```

---

## Database Seeding

### Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      posts: {
        create: [
          { title: 'First Post', content: 'Content 1', published: true },
          { title: 'Second Post', content: 'Content 2', published: false },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
      posts: {
        create: [{ title: 'Bob's Post', content: 'Content 3', published: true }],
      },
    },
  });

  console.log({ user1, user2 });
  console.log('Seeding completed!');
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

### Package.json Configuration

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "npx prisma db seed"
  }
}
```

---

## Advanced Patterns

### Soft Deletes Middleware

```typescript
// src/infrastructure/prisma/middleware/softDelete.ts
import { Prisma } from '@prisma/client';

export const softDeleteMiddleware: Prisma.Middleware = async (params, next) => {
  // Convert delete to update with deletedAt
  if (params.action === 'delete') {
    params.action = 'update';
    params.args['data'] = { deletedAt: new Date() };
  }

  // Convert deleteMany to updateMany
  if (params.action === 'deleteMany') {
    params.action = 'updateMany';
    if (params.args.data != undefined) {
      params.args.data['deletedAt'] = new Date();
    } else {
      params.args['data'] = { deletedAt: new Date() };
    }
  }

  // Exclude soft-deleted records from queries
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    params.action = 'findFirst';
    params.args.where['deletedAt'] = null;
  }

  if (params.action === 'findMany') {
    if (params.args.where) {
      if (params.args.where.deletedAt == undefined) {
        params.args.where['deletedAt'] = null;
      }
    } else {
      params.args['where'] = { deletedAt: null };
    }
  }

  return next(params);
};

// Apply middleware
prisma.$use(softDeleteMiddleware);
```

### Audit Trail Middleware

```typescript
export const auditMiddleware: Prisma.Middleware = async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);

  return result;
};
```

### Read Replicas Extension

```typescript
import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: ['postgresql://replica1.example.com', 'postgresql://replica2.example.com'],
  })
);

// Reads use replicas, writes use primary
const users = await prisma.user.findMany(); // Uses replica
await prisma.user.create({ data: userData }); // Uses primary
```

---

## Prisma Studio

Prisma Studio is a visual database browser built into Prisma.

```bash
npx prisma studio
```

Opens a web UI at `http://localhost:5555` where you can:

- Browse all tables and records
- Edit data visually
- Test queries
- View relationships

**Best for**: Development and debugging, not production.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Database Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy

      - name: Run tests
        run: npm test
```

### Docker Production Setup

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Run migrations and start app
CMD npx prisma migrate deploy && npm start
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "PrismaClient is unable to be run in the browser"

**Cause**: Trying to use Prisma Client in frontend code

**Solution**: Prisma Client only works in Node.js/backend. Create API endpoints instead.

#### Issue 2: "Too many database connections"

**Cause**: Creating multiple PrismaClient instances

**Solution**: Use singleton pattern (see Best Practices section)

#### Issue 3: "Migration failed to apply"

**Cause**: Schema conflicts with existing data

**Solution**:

```bash
# 1. Check current migration status
npx prisma migrate status

# 2. Manually edit migration SQL if needed
# 3. Mark migration as applied
npx prisma migrate resolve --applied <migration_name>

# Or reset database (dev only)
npx prisma migrate reset
```

#### Issue 4: "Type errors after schema changes"

**Cause**: Prisma Client not regenerated

**Solution**:

```bash
npx prisma generate
```

#### Issue 5: "Slow queries"

**Solution**:

- Enable query logging: `log: ['query']` in PrismaClient
- Add indexes to frequently queried fields
- Use `select` instead of fetching all fields
- Consider caching with Redis

### Debug Mode

```typescript
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

---

## Performance Tips

1. **Use connection pooling** (enabled by default)
2. **Batch queries** with `createMany`, `updateMany`, `deleteMany`
3. **Use indexes** on frequently queried fields
4. **Select only needed fields** with `select`
5. **Paginate large result sets** with `skip` and `take`
6. **Use transactions** for atomic operations
7. **Enable query caching** in production
8. **Monitor with Prisma Optimize** (Prisma Cloud feature)

---

## References

- **Official Docs**: https://www.prisma.io/docs
- **Prisma Client API**: https://www.prisma.io/docs/orm/prisma-client
- **Prisma Schema Reference**: https://www.prisma.io/docs/orm/prisma-schema
- **Prisma Migrate**: https://www.prisma.io/docs/orm/prisma-migrate
- **Best Practices**: https://www.prisma.io/docs/orm/more/best-practices
- **Example Projects**: https://github.com/prisma/prisma-examples
- **Community Discord**: https://pris.ly/discord

---

## Next Steps

1. Review [SQLite documentation](../sqlite/README.md) for local database setup
2. Study [Repository Pattern](../codebase/development-guide.md#repository-pattern) for architecture
3. Set up Prisma in your project with `npx prisma init`
4. Define schema and run migrations
5. Implement repository pattern with Prisma
6. Write integration tests with in-memory database

---

**Last Updated**: January 2026  
**Version**: Prisma 6.0+
