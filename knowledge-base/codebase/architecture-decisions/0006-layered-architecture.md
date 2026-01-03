# ADR-004: Layered Architecture for Thought Capture

**Status**: Accepted  
**Date**: 2026-01-03  
**APR Reference**: [O2 APR - Overall Architecture](../plan/apr.md)

## Context

The Thought Capture API is the first user-facing feature. We need to establish architectural patterns that:

1. Align with existing O1 database foundation (Domain/Infrastructure layers)
2. Add Application and API layers for HTTP handling
3. Maintain clean separation of concerns
4. Support testability at each layer
5. Scale to future features (O3-O7)

The existing codebase has Domain models and Infrastructure repositories. We need to add:

- **API Layer**: Express routes and middleware
- **Application Layer**: Business logic orchestration (optional for simple CRUD)

## Decision

**Adopt a 4-layer architecture** following the Dependency Rule: outer layers depend on inner, never vice versa.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  API Layer (HTTP)                                       │
│  - Routes: /api/thoughts                                │
│  - Middleware: validation, rate limiting, error         │
│  - Controllers: request/response handling               │
└───────────────────┬─────────────────────────────────────┘
                    │ depends on
┌───────────────────▼─────────────────────────────────────┐
│  Application Layer (Business Logic)                     │
│  - Services: thought processing, orchestration          │
│  - Use Cases: create thought, list thoughts             │
│  - Note: OPTIONAL for simple CRUD (can skip to Domain)  │
└───────────────────┬─────────────────────────────────────┘
                    │ depends on
┌───────────────────▼─────────────────────────────────────┐
│  Domain Layer (Pure Business Logic)                     │
│  - Models: Thought (immutable)                          │
│  - Interfaces: IThoughtRepository                       │
│  - DTOs: CreateThoughtDto                               │
│  - NO framework dependencies                            │
└───────────────────┬─────────────────────────────────────┘
                    │ implemented by
┌───────────────────▼─────────────────────────────────────┐
│  Infrastructure Layer (External Dependencies)           │
│  - Repositories: PrismaThoughtRepository                │
│  - Prisma Client integration                            │
│  - Database access                                      │
└─────────────────────────────────────────────────────────┘
```

### For O2 Thought Capture: Simplified Flow

Since creating a thought is straightforward CRUD, we'll **skip the Application layer** and go directly from Controller → Repository.

```
POST /api/thoughts
     ↓
Middleware (validate, rate limit)
     ↓
Controller (thoughtController.create)
     ↓
Repository (PrismaThoughtRepository.create)
     ↓
Database (SQLite via Prisma)
```

**Rationale for skipping Application layer**:

- No complex business logic (just validation + persistence)
- No orchestration of multiple repositories
- KISS principle: avoid premature abstraction
- Can add later when O7 (Agent Classifier) needs thought processing

## Rationale

**Why 4 Layers?**

1. **Testability**: Each layer testable independently
2. **Separation of Concerns**: HTTP logic ≠ business logic ≠ database access
3. **Maintainability**: Changes in one layer don't ripple through system
4. **Scalability**: Easy to add features without breaking existing code
5. **Alignment**: Matches existing O1 foundation

**Why Skip Application Layer for MVP?**

- **KISS**: Don't add layers until they're needed
- **Simple CRUD**: No orchestration, no complex business rules
- **Easy to Add Later**: When O7 needs thought classification, add ThoughtService

**Why Controllers in API Layer?**

- **Request/Response Handling**: Transform HTTP to domain operations
- **Thin Controllers**: Delegate to services/repositories (fat models, thin controllers)
- **Error Handling**: Try-catch and forward to error middleware

## Alternatives Considered

### Clean Architecture (Hexagonal)

**Pros**:

- Very pure, dependency inversion everywhere
- Highly testable
- Popular in enterprise

**Cons**:

- Heavy abstraction for simple CRUD
- More boilerplate (ports, adapters, use cases)
- Overkill for MVP

**Rejected because**: Too much ceremony for a thought capture API. Use when complexity justifies it.

### Fat Controllers (No Service Layer)

**Pros**:

- Simple, direct
- Less files to manage

**Cons**:

- Business logic mixed with HTTP concerns
- Hard to test (need to mock req/res)
- Doesn't scale to complex features

**Rejected because**: We want thin controllers that delegate to reusable logic.

### MVC (Model-View-Controller)

**Pros**:

- Familiar pattern
- Works well for server-rendered apps

**Cons**:

- View layer unnecessary (we have separate React frontend)
- Models often become anemic or bloated
- Less clear separation than layered architecture

**Rejected because**: REST API doesn't need views, and we prefer explicit layers.

## Consequences

### Positive

- ✅ Clear responsibility per layer
- ✅ Testable at every level (unit, integration, E2E)
- ✅ Aligns with existing O1 database foundation
- ✅ Easy to add Application layer later when needed
- ✅ Dependency Rule enforced: API → Application → Domain ← Infrastructure
- ✅ Future features can reuse Domain and Infrastructure layers

### Negative

- ⚠️ More files/folders than flat structure (acceptable trade-off)
- ⚠️ Requires discipline to not mix layers (mitigated by code review)

### Risks & Mitigations

| Risk                                 | Mitigation                                               |
| ------------------------------------ | -------------------------------------------------------- |
| Premature abstraction                | Start with 3 layers (skip Application), add when needed  |
| Circular dependencies                | Enforce dependency direction via TypeScript path aliases |
| Over-engineering for simple features | Use pragmatism: skip layers for simple CRUD              |

## Implementation Notes

### Directory Structure

```
backend/src/
├── api/                     # API Layer (NEW)
│   ├── routes/
│   │   └── thoughts.ts      # POST /api/thoughts route
│   ├── controllers/
│   │   └── thoughtController.ts  # Handle request/response
│   └── middleware/
│       ├── validateRequest.ts    # Zod validation
│       ├── rateLimiter.ts        # Rate limiting
│       ├── errorHandler.ts       # Error middleware
│       └── requestLogger.ts      # Request logging
├── application/             # Application Layer (SKIP for O2)
│   └── services/
│       └── (add later for O7 classification)
├── domain/                  # Domain Layer (EXISTS from O1)
│   ├── models/
│   │   └── Thought.ts       # Immutable domain model
│   ├── repositories/
│   │   └── IThoughtRepository.ts  # Contract
│   └── types/
│       └── index.ts         # CreateThoughtDto
├── infrastructure/          # Infrastructure Layer (EXISTS from O1)
│   └── prisma/
│       └── repositories/
│           └── PrismaThoughtRepository.ts  # Implementation
├── errors/                  # Shared (NEW)
│   └── AppError.ts
├── utils/                   # Shared (NEW)
│   ├── logger.ts
│   └── mapPrismaError.ts
├── validators/              # Shared (NEW)
│   └── thoughtSchema.ts
└── server.ts                # Entry point (UPDATE)
```

### Layer Responsibilities

#### API Layer

- **Input**: HTTP requests
- **Output**: HTTP responses
- **Responsibilities**: Route definition, middleware, request/response transformation
- **Dependencies**: Can import Application or Domain (for simple CRUD)

#### Application Layer (Future)

- **Input**: Domain DTOs
- **Output**: Domain models
- **Responsibilities**: Business logic orchestration, multi-repository coordination
- **Dependencies**: Can import Domain, uses Repository interfaces

#### Domain Layer

- **Input**: Nothing (pure logic)
- **Output**: Models, interfaces, types
- **Responsibilities**: Core business entities and rules
- **Dependencies**: NONE (framework-agnostic)

#### Infrastructure Layer

- **Input**: Repository interfaces from Domain
- **Output**: Domain models
- **Responsibilities**: Database access, external APIs, file system
- **Dependencies**: Can import Domain (implements interfaces)

### Testing Strategy by Layer

```typescript
// API Layer - Integration Tests with Supertest
describe('POST /api/thoughts', () => {
  it('should create thought and return 201', async () => {
    const res = await request(app)
      .post('/api/thoughts')
      .send({ text: 'Test thought', source: 'text' });
    expect(res.status).toBe(201);
  });
});

// Domain Layer - Pure Unit Tests
describe('Thought', () => {
  it('should create immutable thought', () => {
    const thought = new Thought('id', 'text', 'userId', new Date(), 'text', 'UNPROCESSED');
    expect(thought.text).toBe('text');
    expect(() => {
      thought.text = 'new';
    }).toThrow(); // readonly
  });
});

// Infrastructure Layer - Integration Tests with Real DB
describe('PrismaThoughtRepository', () => {
  it('should persist thought to database', async () => {
    const thought = await repo.create({ text: 'test', userId: 'user-id', source: 'text' });
    expect(thought.id).toBeDefined();

    const found = await repo.findById(thought.id);
    expect(found).toEqual(thought);
  });
});
```

### Migration Path

**When Application Layer Needed** (e.g., O7 Agent Classifier):

```typescript
// application/services/ThoughtService.ts
export class ThoughtService {
  constructor(
    private thoughtRepo: IThoughtRepository,
    private classifier: IThoughtClassifier
  ) {}

  async captureAndClassify(dto: CreateThoughtDto): Promise<Thought> {
    // 1. Create thought
    const thought = await this.thoughtRepo.create(dto);

    // 2. Classify thought (agent, project, action?)
    const classification = await this.classifier.classify(thought.text);

    // 3. Store classification metadata
    // ...

    return thought;
  }
}

// Controller changes to use service
const thought = await thoughtService.captureAndClassify(req.body);
```

## Compliance

- [x] **SOLID - SRP**: Each layer has single responsibility
- [x] **SOLID - DIP**: API depends on Domain interfaces, not Infrastructure
- [x] **Design Pattern**: Layered Architecture
- [x] **Testability**: Each layer independently testable
- [x] **Existing Architecture**: Builds on O1 foundation
- [x] **KISS**: Skip unnecessary layers for MVP

## References

- [Development Guide - Layered Architecture](../../../../knowledge-base/codebase/development-guide.md#layered-architecture--modularity)
- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
- [Existing Codebase Structure](../../../../knowledge-base/codebase/structure.md)
