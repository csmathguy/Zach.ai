# Test-Driven Development (TDD) Instructions

**Apply to**: All test and implementation files  
**Reference**: [knowledge-base/tdd/README.md](../../knowledge-base/tdd/README.md)

---

## Core TDD Principle

**Tests come FIRST. Always.**

If you write implementation code without a failing test demanding it, you're not doing TDD.

---

## The RED-GREEN-REFACTOR Cycle

```
┌─────────────────────────────────────┐
│  1. RED: Write a failing test      │
│     "What do I want to build?"      │
└──────────┬──────────────────────────┘
           ▼
┌─────────────────────────────────────┐
│  2. GREEN: Make it pass             │
│     "How do I make it work?"        │
└──────────┬──────────────────────────┘
           ▼
┌─────────────────────────────────────┐
│  3. REFACTOR: Improve the code      │
│     "How can I make it better?"     │
└──────────┬──────────────────────────┘
           │
           └──────┐ (Repeat)
```

---

## Phase 0: List Test Cases First

Before starting RED-GREEN-REFACTOR, **write out a list of test cases**:

```markdown
Test Cases for User Repository:

- [ ] Create user with valid data returns User with ID
- [ ] Create user with duplicate email throws error
- [ ] Find user by ID returns user when exists
- [ ] Find user by ID returns null when not exists
- [ ] Find all users returns empty array when no users
- [ ] Update user updates fields correctly
- [ ] Delete user is idempotent
```

Then pick one test and apply RED-GREEN-REFACTOR to it.

---

## Phase 1: RED - Write Failing Test

**Purpose**: Define what you want to build through usage.

### Steps

1. **Pick next test from your list**
2. **Write test showing how you WANT to use the code**
   - Don't worry if classes/functions don't exist yet
   - Focus on the API you wish existed
   - Think about the interface from the outside
3. **Run test → ❌ FAIL** (expected!)
4. **Read error message** - it tells you what to create next

### Example

```typescript
// Step 1: Write test FIRST (no implementation exists)
describe('PrismaUserRepository', () => {
  it('should create user in database', async () => {
    const repo = new PrismaUserRepository(prisma);

    const user = await repo.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});

// Step 2: Run test
// ❌ FAIL: "PrismaUserRepository is not defined"
```

**Key Point**: Test shows how you WANT to use the code. The API emerges from usage.

---

## Phase 2: GREEN - Make It Pass

**Purpose**: Write minimum code to make test pass. Don't optimize yet.

### Steps

1. **Create the class/function the test demands**
2. **Write minimal code to pass the test**
   - Simple > clever
   - Don't add features the test doesn't demand
3. **Run test → ✅ PASS**
4. **Stop** - resist the urge to add more!

### Example

```typescript
// Step 3: Create minimal implementation
export class PrismaUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { email: string; name: string }): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return new User(prismaUser.id, prismaUser.email, prismaUser.name);
  }
}

// Step 4: Run test
// ✅ PASS - We're in the GREEN!
```

**Key Point**: You now have working code. Tests are your safety net.

---

## Phase 3: REFACTOR - Improve Code

**Purpose**: Optimize and clean up while staying "in the green."

### Questions to Ask

- ✅ Can I make my test suite more expressive?
- ✅ Can I reduce duplication?
- ✅ Can I make implementation code more descriptive?
- ✅ Can I implement something more efficiently?
- ✅ Are my tests isolated and reliable?
- ✅ Does this follow SOLID principles?

### Steps

1. **Improve code** (extract functions, rename, optimize)
2. **Run tests → ✅ PASS** (still green!)
3. **Commit** if you're at a good checkpoint
4. **Repeat** - back to RED with next test

### Example

```typescript
// Step 5: Refactor - Extract mapper function
export class PrismaUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { email: string; name: string }): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return this.toDomain(prismaUser); // Extracted mapper
  }

  private toDomain(prismaUser: any): User {
    return new User(prismaUser.id, prismaUser.email, prismaUser.name);
  }
}

// Step 6: Run test
// ✅ PASS - Still GREEN after refactor
```

**Key Point**: Tests ensure your refactoring doesn't break functionality.

---

## When to Extract Interfaces

**NOT in architecture phase. NOT before writing tests.**

Extract interfaces **AFTER** you've written several tests and see patterns emerge:

```typescript
// After writing 3-5 tests, you see the pattern:
it('should create user', async () => {
  /* ... */
});
it('should find user by ID', async () => {
  /* ... */
});
it('should delete user', async () => {
  /* ... */
});

// NOW extract the interface:
interface IUserRepository {
  create(data: { email: string; name: string }): Promise<User>;
  findById(id: string): Promise<User | null>;
  delete(id: string): Promise<void>;
}

// Refactor implementation to use interface
export class PrismaUserRepository implements IUserRepository {
  // ... implementation
}
```

**Key Point**: Interface emerges from test usage, not designed up-front.

---

## Outside-In TDD for Layered Architecture

For systems with Domain → Infrastructure → Application → API layers:

**Start from the outside (API) and work inward:**

```
1. API Layer Test → Drives route handler
   ↓
2. Service Layer Test → Drives service interface
   ↓
3. Domain Model Test → Drives model interface
   ↓
4. Repository Test → Implements interface
```

### Example Flow

```typescript
// 1. Start with API test (Outside)
describe('POST /users', () => {
  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', name: 'Test' });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
// Run → RED

// 2. Implement route handler (calls service)
router.post('/users', async (req, res) => {
  const user = await userService.registerUser(req.body.email, req.body.name);
  res.status(201).json(user);
});
// Run → RED (service doesn't exist)

// 3. Write service test
describe('UserService', () => {
  it('should create user via repository', async () => {
    const mockRepo = { create: jest.fn().mockResolvedValue(mockUser) };
    const service = new UserService(mockRepo);

    const user = await service.registerUser('test@example.com', 'Test');

    expect(mockRepo.create).toHaveBeenCalled();
  });
});
// Run → RED

// 4. Implement service
export class UserService {
  constructor(private repo: IUserRepository) {}

  async registerUser(email: string, name: string): Promise<User> {
    return this.repo.create({ email, name });
  }
}
// Run → GREEN for service test, still RED for API test

// 5. Write repository integration test
describe('PrismaUserRepository', () => {
  it('should create user in database', async () => {
    // ... (see earlier example)
  });
});
// Run → RED

// 6. Implement repository
// ... (see earlier example)
// Run → GREEN (all tests pass!)
```

**Key Benefit**: Each layer's interface emerges from usage by the layer above.

---

## TypeScript + Jest TDD Workflow

### Test File Structure

```
src/
├── domain/
│   ├── models/
│   │   └── User.ts
│   └── __tests__/
│       └── User.test.ts          # Domain model tests
├── infrastructure/
│   ├── prisma/
│   │   └── repositories/
│   │       └── PrismaUserRepository.ts
│   └── __tests__/
│       └── PrismaUserRepository.test.ts  # Integration tests
└── application/
    ├── services/
    │   └── UserService.ts
    └── __tests__/
        └── UserService.test.ts   # Service tests with mocks
```

### Running Tests During TDD

```bash
# Run specific test file in watch mode
npm test -- --watch User.test.ts

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

### Test Speed Expectations

- **Domain Model Tests**: <1ms per test (pure TypeScript)
- **Service Tests**: <10ms per test (mocked dependencies)
- **Repository Tests**: <100ms per test (in-memory database)
- **API Tests**: <1s per test (full stack)

---

## TDD Best Practices for This Codebase

### 1. Test Naming Convention

```typescript
// ✅ GOOD: Describes behavior from user's perspective
it('should create user with email and name', () => {
  /* ... */
});
it('should return null when user not found', () => {
  /* ... */
});
it('should throw error on duplicate email', () => {
  /* ... */
});

// ❌ BAD: Describes implementation
it('should call prisma.user.create', () => {
  /* ... */
});
it('should use mapper function', () => {
  /* ... */
});
```

### 2. One Assertion Per Test (When Possible)

```typescript
// ✅ GOOD: Focused tests
it('should create user', async () => {
  const user = await repo.create({ email: 'test@example.com', name: 'Test' });
  expect(user.id).toBeDefined();
});

it('should preserve email', async () => {
  const user = await repo.create({ email: 'test@example.com', name: 'Test' });
  expect(user.email).toBe('test@example.com');
});

// ⚠️ ACCEPTABLE: Related assertions
it('should create user with correct properties', async () => {
  const user = await repo.create({ email: 'test@example.com', name: 'Test' });
  expect(user.id).toBeDefined();
  expect(user.email).toBe('test@example.com');
  expect(user.name).toBe('Test');
});
```

### 3. Use AAA Pattern (Arrange-Act-Assert)

```typescript
it('should update user name', async () => {
  // Arrange: Set up test data
  const user = await repo.create({ email: 'test@example.com', name: 'Old Name' });

  // Act: Perform the action
  const updated = await repo.update(user.id, { name: 'New Name' });

  // Assert: Verify the result
  expect(updated.name).toBe('New Name');
});
```

### 4. Mock External Dependencies (Application Layer)

```typescript
// ✅ GOOD: Mock repository in service tests
describe('UserService', () => {
  it('should validate email before creating user', async () => {
    const mockRepo: IUserRepository = {
      create: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const service = new UserService(mockRepo);

    await expect(service.registerUser('invalid-email', 'Test')).rejects.toThrow('Invalid email');

    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
```

### 5. Use Real Objects (Domain + Infrastructure)

```typescript
// ✅ GOOD: Test real domain model
it('should create immutable user', () => {
  const user = new User('id', 'test@example.com', 'Test');
  expect(() => {
    user.email = 'new@example.com';
  }).toThrow();
});

// ✅ GOOD: Test real repository with in-memory database
it('should save user to database', async () => {
  const repo = new PrismaUserRepository(prisma); // Real repository
  const user = await repo.create({ email: 'test@example.com', name: 'Test' });

  // Verify in database
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  expect(dbUser).toBeDefined();
});
```

---

## Common TDD Antipatterns to Avoid

### ❌ 1. Writing Implementation First

```typescript
// WRONG ORDER:
// 1. Create interface
interface IUserRepository {
  /* ... */
}

// 2. Implement class
class PrismaUserRepository implements IUserRepository {
  /* ... */
}

// 3. Write tests
describe('PrismaUserRepository', () => {
  /* ... */
});
```

**Fix**: Write test first, let it drive the interface.

### ❌ 2. Testing Implementation Details

```typescript
// BAD: Tests internal state
it('should set isDeleted flag', async () => {
  await repo.delete('user-id');
  expect(repo['_users'][0].isDeleted).toBe(true); // Internal!
});

// GOOD: Tests behavior
it('should not find deleted user', async () => {
  await repo.delete('user-id');
  const user = await repo.findById('user-id');
  expect(user).toBeNull(); // External behavior
});
```

### ❌ 3. Skipping RED Phase

```typescript
// BAD: Test passes immediately
it('should return true', () => {
  expect(true).toBe(true); // Useless test!
});

// GOOD: Write failing test first
it('should validate email', () => {
  expect(validateEmail('invalid')).toBe(false);
});
// Run → RED: validateEmail is not defined
// Then implement validateEmail
```

### ❌ 4. Not Refactoring

```typescript
// After GREEN: Code works but is messy
function calculateTotal(items) {
  let t = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].discount) {
      t += items[i].price * (1 - items[i].discount);
    } else {
      t += items[i].price;
    }
  }
  return t;
}
// Tests pass, but code is hard to read

// REFACTOR: Clean it up
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.getFinalPrice(), 0);
}
// Tests still pass, code is cleaner
```

### ❌ 5. Creating Contracts Before Tests

```typescript
// BAD: Architect creates contracts.md with interfaces
interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
}
// Then developer writes tests against this interface

// GOOD: Developer writes test first
it('should create user', async () => {
  const repo = getUserRepository();
  const user = await repo.create({ email: 'test@example.com', name: 'Test' });
  expect(user.id).toBeDefined();
});
// After several tests, extract interface from usage patterns
```

---

## TDD Success Metrics

### Code Coverage (Byproduct, Not Goal)

- Overall: 70%+ (naturally achieved through TDD)
- Domain Layer: 90%+ (pure logic, easy to test)
- Infrastructure Layer: 80%+ (integration tests)
- Application Layer: 80%+ (service tests)

### Test Quality (MC-FIRE)

- **M**eaningful: Tests verify important behavior
- **C**omplete: All edge cases covered
- **F**ast: Run quickly (see speed expectations above)
- **I**solated: Tests don't depend on each other
- **R**epeatable: Same result every time
- **E**xpressive: Test names clearly describe behavior

### TDD Compliance Checklist

- [ ] All tests written BEFORE implementations
- [ ] Each test started RED (failing)
- [ ] Each test went GREEN (passing) with minimal code
- [ ] Refactored while maintaining GREEN
- [ ] Interfaces emerged from test usage (not designed up-front)
- [ ] Tests document expected behavior
- [ ] Zero TypeScript errors throughout development

---

## Quick Reference

### TDD Mantra

> **RED** (write failing test) → **GREEN** (make it pass) → **REFACTOR** (improve code)

### Golden Rule

**If you write implementation code without a failing test demanding it, you're not doing TDD.**

### When in Doubt

1. Write a test showing how you want to use the code
2. Watch it fail (RED)
3. Write the simplest code to make it pass (GREEN)
4. Clean up the code (REFACTOR)
5. Repeat

---

## Resources

- **Primary Reference**: [knowledge-base/tdd/README.md](../../knowledge-base/tdd/README.md) (800+ lines)
- **Martin Fowler**: https://martinfowler.com/bliki/TestDrivenDevelopment.html
- **Kent Beck**: _Test-Driven Development: By Example_ (canonical book)
- **Test Double**: https://github.com/testdouble/contributing-tests/wiki/Test-Driven-Development
- **Codecademy**: https://www.codecademy.com/article/tdd-red-green-refactor
