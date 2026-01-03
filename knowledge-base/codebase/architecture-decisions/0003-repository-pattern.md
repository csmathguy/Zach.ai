# ADR-003: Use Repository Pattern for Database Abstraction

**Status**: Accepted  
**Date**: 2026-01-01  
**Author**: Architect Agent  
**APR Reference**: [../plan/apr.md](../plan/apr.md) - Section 4.6 & 4.7 (Repository Interfaces & Implementations)

## Context

We need to abstract database access so that:

- Business logic (services) doesn't depend on Prisma directly
- We can swap database implementations (SQLite → PostgreSQL, or add caching layer)
- Unit tests can mock data access without touching database
- Integration tests can use in-memory database
- Domain layer remains pure TypeScript (no framework dependencies)

## Decision

We will implement the **Repository Pattern** with:

- Repository **interfaces** defined in the **Domain layer** (pure TypeScript)
- Repository **implementations** in the **Infrastructure layer** (Prisma-specific)
- **Mapper functions** to convert Prisma models → Domain models
- **Dependency Injection** so services receive repositories via constructor

## Rationale

### Why Repository Pattern?

1. **Database Agnostic**: Business logic doesn't know about Prisma
2. **Testability**: Mock repositories for unit tests, no database needed
3. **Flexibility**: Swap implementations (Prisma → Mongoose → Raw SQL)
4. **Clean Architecture**: Follows Dependency Inversion Principle (DIP)
5. **Type Safety**: Repository contracts enforced at compile time

### Pattern Structure

```
┌─────────────────────────────────────┐
│   API Layer (HTTP Routes)          │
├─────────────────────────────────────┤
│   Application Layer (Services)     │  ← Depends on IRepository
├─────────────────────────────────────┤
│   Domain Layer (Interfaces/Models) │  ← IUserRepository, User model
├─────────────────────────────────────┤
│   Infrastructure Layer (Prisma)    │  ← PrismaUserRepository implements IUserRepository
└─────────────────────────────────────┘
```

**Key Principle**: Services depend on **interfaces** (Domain), not **implementations** (Infrastructure).

### Alternatives Considered

1. **Active Record Pattern** (TypeORM style)
   - **Pros**: Less code, methods on model classes
   - **Cons**: Domain models depend on ORM, hard to test, tight coupling
   - **Why Rejected**: Violates SRP and DIP

2. **Data Mapper without Interfaces** (Direct Prisma in Services)
   - **Pros**: Simpler, fewer files
   - **Cons**: Services tightly coupled to Prisma, hard to swap implementations
   - **Why Rejected**: Not testable without database

3. **Service Layer as Repository**
   - **Pros**: Fewer layers
   - **Cons**: Mixes business logic with data access, violates SRP
   - **Why Rejected**: Business logic should be separate from persistence

## Consequences

### Positive

- **Testability**: Unit tests mock repositories, run instantly without database
- **Flexibility**: Swap SQLite → PostgreSQL → MongoDB without changing business logic
- **Clean Code**: Services focus on business logic, repositories focus on data access
- **Type Safety**: Repository contracts enforced by TypeScript compiler
- **Parallel Development**: Multiple devs can work on services (with mocks) before database is ready

### Negative

- **More Files**: Each entity has interface + implementation + mapper (3 files)
- **Boilerplate**: Mapper functions convert Prisma models → Domain models
- **Indirection**: One more layer to understand and navigate

### Risks

**Risk**: Team finds pattern too complex  
**Mitigation**: Excellent documentation in development-guide.md, code examples, clear folder structure

**Risk**: Mappers get out of sync with schema  
**Mitigation**: Integration tests verify Prisma implementations. TypeScript catches type mismatches.

## Implementation Notes

### Folder Structure

```
backend/src/
├── domain/                           # Pure TypeScript (no framework dependencies)
│   ├── models/                       # Domain entities
│   │   ├── User.ts                   # class User { ... }
│   │   ├── Thought.ts                # class Thought { ... }
│   │   ├── Project.ts                # class Project { ... }
│   │   └── Action.ts                 # class Action { ... }
│   ├── repositories/                 # Repository interfaces
│   │   ├── IUserRepository.ts        # interface IUserRepository { ... }
│   │   ├── IThoughtRepository.ts
│   │   ├── IProjectRepository.ts
│   │   └── IActionRepository.ts
│   └── types/                        # DTOs and shared types
│       ├── CreateUserDto.ts          # type CreateUserDto = { email: string; name?: string }
│       └── UpdateUserDto.ts
├── infrastructure/                   # Framework-specific implementations
│   └── prisma/
│       ├── client.ts                 # Prisma Client singleton
│       ├── repositories/             # Prisma repository implementations
│       │   ├── PrismaUserRepository.ts      # implements IUserRepository
│       │   ├── PrismaThoughtRepository.ts
│       │   ├── PrismaProjectRepository.ts
│       │   └── PrismaActionRepository.ts
│       ├── mappers/                  # Prisma model → Domain model converters
│       │   ├── userMapper.ts         # toDomain(prismaUser): User
│       │   ├── thoughtMapper.ts
│       │   ├── projectMapper.ts
│       │   └── actionMapper.ts
│       └── schema.prisma             # Prisma schema (or symlink to prisma/)
└── application/                      # Business logic
    └── services/
        ├── UserService.ts            # Uses IUserRepository (injected)
        ├── ThoughtService.ts
        ├── ProjectService.ts
        └── ActionService.ts
```

### Example: User Repository

#### 1. Domain Model (Pure TypeScript)

```typescript
// backend/src/domain/models/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly createdAt: Date
  ) {}
}
```

#### 2. Repository Interface (Domain Layer)

```typescript
// backend/src/domain/repositories/IUserRepository.ts
import { User } from '../models/User';
import { CreateUserDto, UpdateUserDto } from '../types';

export interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}
```

#### 3. Prisma Implementation (Infrastructure Layer)

```typescript
// backend/src/infrastructure/prisma/repositories/PrismaUserRepository.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/models/User';
import { CreateUserDto, UpdateUserDto } from '../../../domain/types';
import { userToDomain } from '../mappers/userMapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDto): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return userToDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    return prismaUser ? userToDomain(prismaUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { email } });
    return prismaUser ? userToDomain(prismaUser) : null;
  }

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany();
    return prismaUsers.map(userToDomain);
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const prismaUser = await this.prisma.user.update({ where: { id }, data });
    return userToDomain(prismaUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
```

#### 4. Mapper Function (Infrastructure Layer)

```typescript
// backend/src/infrastructure/prisma/mappers/userMapper.ts
import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/models/User';

export function userToDomain(prismaUser: PrismaUser): User {
  return new User(prismaUser.id, prismaUser.email, prismaUser.name, prismaUser.createdAt);
}
```

#### 5. Service Using Repository (Application Layer)

```typescript
// backend/src/application/services/UserService.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/models/User';

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async registerUser(email: string, name?: string): Promise<User> {
    // Business logic validation
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Check for existing user
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Create user
    return this.userRepo.create({ email, name });
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
```

#### 6. Dependency Injection (API Layer)

```typescript
// backend/src/api/routes/users.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../../infrastructure/prisma/repositories/PrismaUserRepository';
import { UserService } from '../../application/services/UserService';

const prisma = new PrismaClient();
const userRepo = new PrismaUserRepository(prisma);
const userService = new UserService(userRepo);

const router = Router();

router.post('/users', async (req, res) => {
  try {
    const user = await userService.registerUser(req.body.email, req.body.name);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

### Testing with Repository Pattern

#### Unit Test (Mock Repository)

```typescript
// backend/src/application/services/__tests__/UserService.test.ts
import { UserService } from '../UserService';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/models/User';

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

  it('should register new user', async () => {
    const mockUser = new User('123', 'test@example.com', 'Test', new Date());
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(mockUser);

    const result = await service.registerUser('test@example.com', 'Test');

    expect(result).toBe(mockUser);
    expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockRepo.create).toHaveBeenCalledWith({ email: 'test@example.com', name: 'Test' });
  });

  it('should throw if user already exists', async () => {
    const existingUser = new User('123', 'test@example.com', 'Test', new Date());
    mockRepo.findByEmail.mockResolvedValue(existingUser);

    await expect(service.registerUser('test@example.com')).rejects.toThrow('User already exists');
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
```

#### Integration Test (Real Repository with In-Memory DB)

```typescript
// backend/src/infrastructure/prisma/repositories/__tests__/PrismaUserRepository.test.ts
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../PrismaUserRepository';

describe('PrismaUserRepository', () => {
  let prisma: PrismaClient;
  let repo: PrismaUserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: 'file::memory:?cache=shared' } },
    });
    await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;');
    repo = new PrismaUserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create user', async () => {
    const user = await repo.create({ email: 'test@example.com', name: 'Test' });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test');
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('should find user by email', async () => {
    await repo.create({ email: 'find@example.com', name: 'Find' });

    const user = await repo.findByEmail('find@example.com');

    expect(user).not.toBeNull();
    expect(user!.email).toBe('find@example.com');
  });
});
```

## Compliance

- [x] **SRP**: Repositories handle only data access, services handle only business logic
- [x] **OCP**: New implementations (MongoDB, Cache) can be added without modifying services
- [x] **LSP**: All repository implementations are substitutable for their interfaces
- [x] **ISP**: Repository interfaces are small and focused (one per entity)
- [x] **DIP**: Services depend on abstractions (interfaces), not concretions (Prisma)
- [x] **Testability**: 100% unit test coverage possible with mocks, no database required
- [x] **Integration Testing**: Real implementations testable with in-memory SQLite
- [x] **Flexibility**: Database can be swapped without changing business logic
- [x] **Type Safety**: All contracts enforced at compile time

## Related ADRs

- ADR-001: Use Prisma ORM for Database Access
- ADR-002: Use SQLite with WAL Mode
- ADR-004: Layered Architecture (Domain/Infrastructure/Application/API)

## References

- [Martin Fowler: Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Development Guide: Repository Pattern](../../../../knowledge-base/codebase/development-guide.md#repository-pattern)
- [Development Guide: Layered Architecture](../../../../knowledge-base/codebase/development-guide.md#layered-architecture--modularity)
