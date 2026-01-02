# ADR-004: Layered Architecture

**Status**: Accepted  
**Date**: 2026-01-01  
**Author**: Architect Agent  
**Related Features**: All backend features

## Context

We need a consistent architectural pattern for organizing backend code that:

- Separates business logic from infrastructure concerns
- Makes code testable (unit tests without database)
- Allows swapping implementations (SQLite → PostgreSQL)
- Prevents tight coupling between layers
- Follows SOLID principles (especially Dependency Inversion)

## Decision

We will use **Layered Architecture** with four distinct layers:

1. **Domain Layer** (innermost) - Pure business logic, no framework dependencies
2. **Infrastructure Layer** - Framework-specific implementations (Prisma, Axios, etc.)
3. **Application Layer** - Business logic orchestration (services)
4. **API Layer** (outermost) - HTTP request/response handling (Express routes)

**Dependency Rule**: Outer layers depend on inner layers. Inner layers never import from outer layers.

```
┌─────────────────────────────────────┐
│   API Layer (Express Routes)       │  ← HTTP concerns only
├─────────────────────────────────────┤
│   Application Layer (Services)     │  ← Business logic orchestration
├─────────────────────────────────────┤
│   Domain Layer (Models/Interfaces) │  ← Pure TypeScript, no frameworks
└─────────────────────────────────────┘
            ↑
            │ implements
            │
┌─────────────────────────────────────┐
│   Infrastructure Layer (Prisma)    │  ← Framework-specific code
└─────────────────────────────────────┘
```

## Rationale

### Why Layered Architecture?

1. **Testability**: Inner layers can be tested without outer layers
2. **Flexibility**: Swap implementations without changing business logic
3. **Maintainability**: Clear separation of concerns reduces cognitive load
4. **SOLID Compliance**: Especially Dependency Inversion Principle (DIP)
5. **Team Collaboration**: Different developers can work on different layers

### Alternatives Considered

1. **Hexagonal (Ports & Adapters) Architecture**
   - **Pros**: Even more decoupled, symmetric, testable
   - **Cons**: More complex, overkill for current project size
   - **Why Rejected**: Too much abstraction for a startup codebase

2. **Clean Architecture (Uncle Bob)**
   - **Pros**: Very clean separation, enterprise-grade
   - **Cons**: Many layers, lots of boilerplate
   - **Why Rejected**: Four layers are sufficient for our needs

3. **Monolithic / No Layers**
   - **Pros**: Simple, fast to write initially
   - **Cons**: Becomes unmaintainable quickly, hard to test
   - **Why Rejected**: Violates SOLID principles

## Consequences

### Positive

- **Testability**: Unit tests in domain/application layer, integration tests in infrastructure, E2E in API
- **Flexibility**: Database swap (SQLite → PostgreSQL) only touches infrastructure layer
- **Clear Boundaries**: Each layer has single responsibility
- **Parallel Development**: Teams can work on services (with mocks) before infrastructure is ready
- **SOLID Compliance**: Dependency Inversion enforced by layer structure

### Negative

- **More Files**: Each entity has files in multiple layers (model, interface, implementation)
- **Indirection**: More layers to navigate compared to monolithic code
- **Learning Curve**: Developers must understand layer responsibilities

### Risks

**Risk**: Developers bypass layers (e.g., API calls Prisma directly)  
**Mitigation**: ESLint rules, code reviews, clear documentation

**Risk**: Unclear which layer to put code in  
**Mitigation**: This ADR + development guide provide clear rules

## Layer Responsibilities

### Domain Layer

**Location**: `backend/src/domain/`

**Contents**:

- **models/** - Domain entities (User, Thought, Project, Action)
- **repositories/** - Repository interfaces (IUserRepository, etc.)
- **types/** - DTOs and shared types (CreateUserDto, etc.)

**Rules**:

- ✅ Pure TypeScript (no framework imports)
- ✅ No dependencies on other layers
- ✅ Contains business logic and invariants
- ❌ No Prisma types
- ❌ No HTTP concerns (req/res)
- ❌ No database-specific code

**Example**:

```typescript
// backend/src/domain/models/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly createdAt: Date
  ) {
    // Domain invariants
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}
```

### Infrastructure Layer

**Location**: `backend/src/infrastructure/`

**Contents**:

- **prisma/** - Prisma Client, repositories, mappers
  - `client.ts` - Prisma Client singleton
  - `repositories/` - Repository implementations
  - `mappers/` - Prisma model → Domain model converters
- **external/** - Third-party API clients (future)

**Rules**:

- ✅ Implements domain interfaces
- ✅ Contains framework-specific code (Prisma, Axios)
- ✅ Depends on domain layer (interfaces, models)
- ❌ No business logic
- ❌ No HTTP concerns

**Example**:

```typescript
// backend/src/infrastructure/prisma/repositories/PrismaUserRepository.ts
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDto): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return userToDomain(prismaUser);
  }
}
```

### Application Layer

**Location**: `backend/src/application/services/`

**Contents**:

- **UserService.ts** - User business logic
- **ThoughtService.ts** - Thought processing logic
- **ProjectService.ts** - Project management logic
- **ActionService.ts** - Action orchestration logic

**Rules**:

- ✅ Depends on domain interfaces (not implementations)
- ✅ Contains business logic and validation
- ✅ Orchestrates multiple repositories
- ❌ No direct database access
- ❌ No HTTP concerns (req/res objects)
- ❌ No Prisma imports

**Example**:

```typescript
// backend/src/application/services/UserService.ts
export class UserService {
  constructor(private userRepo: IUserRepository) {} // Interface, not implementation

  async registerUser(email: string, name?: string): Promise<User> {
    // Business logic validation
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }

    // Check for existing user
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Create user
    return this.userRepo.create({ email, name });
  }
}
```

### API Layer

**Location**: `backend/src/api/`

**Contents**:

- **routes/** - Express route definitions
- **controllers/** - Request/response handlers
- **middleware/** - Express middleware (auth, error handling, logging)

**Rules**:

- ✅ Depends on application services
- ✅ Handles HTTP concerns (validation, serialization, status codes)
- ✅ Contains Express-specific code
- ❌ No business logic
- ❌ No direct repository access

**Example**:

```typescript
// backend/src/api/routes/users.routes.ts
export function createUserRoutes(userService: UserService): Router {
  const router = Router();

  router.post('/users', async (req, res) => {
    try {
      const user = await userService.registerUser(req.body.email, req.body.name);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
```

## Dependency Injection

**Pattern**: Constructor injection for all layer dependencies.

```typescript
// API Layer setup
const prisma = new PrismaClient();
const userRepo = new PrismaUserRepository(prisma);
const userService = new UserService(userRepo);
const userRoutes = createUserRoutes(userService);

app.use('/api', userRoutes);
```

**Benefits**:

- Easy to swap implementations (mock vs real)
- Clear dependencies at construction time
- Testable without complex setup

## Testing Strategy by Layer

### Domain Layer Tests

**Type**: Pure unit tests  
**Speed**: Very fast (milliseconds)  
**Dependencies**: None (pure functions/classes)

```typescript
describe('User', () => {
  it('should validate email', () => {
    expect(() => new User('1', 'invalid', 'Test', new Date())).toThrow('Invalid email');
  });
});
```

### Application Layer Tests

**Type**: Unit tests with mocked repositories  
**Speed**: Fast (milliseconds)  
**Dependencies**: Mock repositories

```typescript
describe('UserService', () => {
  it('should register user', async () => {
    const mockRepo: IUserRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockUser),
    };
    const service = new UserService(mockRepo);

    const user = await service.registerUser('test@example.com');

    expect(user).toBeDefined();
  });
});
```

### Infrastructure Layer Tests

**Type**: Integration tests with in-memory database  
**Speed**: Medium (seconds)  
**Dependencies**: In-memory SQLite

```typescript
describe('PrismaUserRepository', () => {
  it('should create user', async () => {
    const repo = new PrismaUserRepository(testPrisma);

    const user = await repo.create({ email: 'test@example.com' });

    expect(user.id).toBeDefined();
  });
});
```

### API Layer Tests

**Type**: E2E tests with Supertest  
**Speed**: Medium-slow (seconds)  
**Dependencies**: Full app stack

```typescript
describe('POST /api/users', () => {
  it('should create user', async () => {
    const response = await request(app).post('/api/users').send({ email: 'test@example.com' });

    expect(response.status).toBe(200);
  });
});
```

## Migration Strategy

### Existing Code

Current backend has:

- `backend/src/server.ts` - Express app
- `backend/src/utils/metrics.ts` - Utilities

**Migration Path**:

1. Create `backend/src/domain/` folder
2. Create `backend/src/infrastructure/` folder
3. Create `backend/src/application/` folder
4. Create `backend/src/api/` folder
5. Move existing routes to `api/routes/`
6. Keep utilities in `shared/utils/` (cross-cutting concern)

### New Features

All new features must follow this structure:

1. Define domain models and interfaces
2. Implement infrastructure layer (Prisma repositories)
3. Create application services
4. Create API routes

## Enforcement

### Code Reviews

Reviewers must check:

- [ ] Domain layer has no framework imports
- [ ] Services depend on interfaces, not implementations
- [ ] API layer has no business logic
- [ ] Dependency direction flows inward

### ESLint Rules (Future)

```javascript
// Prevent domain layer from importing infrastructure
{
  "no-restricted-imports": [
    "error",
    {
      "patterns": [
        {
          "group": ["**/infrastructure/**"],
          "message": "Domain layer cannot import from infrastructure"
        }
      ]
    }
  ]
}
```

## Compliance

- [x] **SRP**: Each layer has single responsibility
- [x] **OCP**: Layers extend via interfaces, not modification
- [x] **LSP**: Implementations substitutable for interfaces
- [x] **ISP**: Small, focused interfaces per layer
- [x] **DIP**: Outer layers depend on inner abstractions
- [x] **Testing**: Each layer testable independently
- [x] **Flexibility**: Infrastructure swappable without changing business logic
- [x] **Maintainability**: Clear boundaries reduce complexity

## Related ADRs

- ADR-001: Use Prisma ORM (Infrastructure Layer)
- ADR-002: Use SQLite with WAL Mode (Infrastructure Layer)
- ADR-003: Use Repository Pattern (Domain + Infrastructure)

## References

- [Martin Fowler: Layered Architecture](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- [Development Guide: Layered Architecture](../development-guide.md#layered-architecture--modularity)
- [Clean Code: Layers and Boundaries](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
