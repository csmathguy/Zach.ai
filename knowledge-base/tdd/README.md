# Test-Driven Development (TDD) Knowledge Base

## Overview

Test-Driven Development (TDD) is a software development technique where you **write tests before writing the functional code**. It was developed by Kent Beck in the late 1990s as part of Extreme Programming.

**Official Resources**:

- Kent Beck's canonical guide: https://tidyfirst.substack.com/p/canon-tdd
- Martin Fowler on TDD: https://martinfowler.com/bliki/TestDrivenDevelopment.html
- Kent Beck's book: _Test-Driven Development: By Example_

**Philosophy**: Tests drive the design. You think about the interface first (how code will be used) before thinking about implementation (how it works internally).

**Key Benefit**: Forces separation of interface from implementation, a core element of good design.

---

## Core TDD Cycle: RED → GREEN → REFACTOR

The essence of TDD is three simple steps repeated continuously:

```
┌─────────────────────────────────────┐
│  1. RED: Write a failing test      │
│     "What do I want to build?"      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  2. GREEN: Make it pass             │
│     "How do I make it work?"        │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  3. REFACTOR: Improve the code      │
│     "How can I make it better?"     │
└──────────┬──────────────────────────┘
           │
           └──────┐
                  │
                  ▼
           (Repeat with next feature)
```

### Phase 1: RED (Write a Failing Test)

**Purpose**: Define what you want to build. Think about the interface.

**Steps**:

1. Write a test for the next bit of functionality you want to add
2. Run the test → ❌ FAIL (expected - no implementation yet)
3. The error message guides your implementation

**Example**:

```typescript
// 1. Write the test FIRST
describe('sortArray', () => {
  it('should sort numbers in ascending order', () => {
    const result = sortArray([2, 4, 1]);
    expect(result).toEqual([1, 2, 4]);
  });
});

// 2. Run test → ❌ FAIL: "sortArray is not defined"
```

**Key Point**: You are now "in the red" - tests are failing, which is **expected and good**!

### Phase 2: GREEN (Make It Pass)

**Purpose**: Find a solution. Don't worry about perfection yet.

**Steps**:

1. Write the **minimum** code to make the test pass
2. Don't optimize prematurely
3. Run the test → ✅ PASS

**Example**:

```typescript
// Implement just enough to pass the test
function sortArray(arr: number[]): number[] {
  // Simple bubble sort (not optimized, but it works!)
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Run test → ✅ PASS (19ms)
```

**Key Point**: You are now "in the green" - tests pass! You have a safety net for refactoring.

### Phase 3: REFACTOR (Improve the Code)

**Purpose**: Optimize and clean up while staying "in the green."

**Questions to Ask**:

- ✅ Can I make my test suite more expressive?
- ✅ Can I reduce duplication?
- ✅ Can I make implementation code more descriptive?
- ✅ Can I implement something more efficiently?
- ✅ Are my tests isolated and reliable?

**Example**:

```typescript
// Refactor to use more efficient merge sort
function sortArray(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = sortArray(arr.slice(0, mid));
  const right = sortArray(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result = [];
  let i = 0,
    j = 0;

  while (i < left.length && j < right.length) {
    result.push(left[i] < right[j] ? left[i++] : right[j++]);
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

// Run test → ✅ PASS (7ms) - Much faster!
```

**Key Point**: Tests ensure your refactoring doesn't break functionality.

---

## The Vital Initial Step: List Test Cases First

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

**Then pick one test and apply RED-GREEN-REFACTOR to it.**

**Sequencing Skill**: Pick tests that drive you quickly to salient design points. Start with simplest cases, build toward complex ones.

---

## TDD Best Practices

### 1. Test-First Programming Benefits

**Primary Benefits**:

- ✅ **Self-Testing Code**: Can only write functional code in response to making a test pass
- ✅ **Interface-First Design**: Think about how code will be used before how it works
- ✅ **Separates Interface from Implementation**: Key element of good design

**Secondary Benefits**:

- ✅ **Reduced Defects**: Catches bugs early
- ✅ **Improved Productivity**: Tighter feedback loops
- ✅ **Increased Focus**: One test at a time
- ✅ **Less Future-Proofing**: YAGNI (You Aren't Gonna Need It)

### 2. Write the Test Before the Interface

**❌ Wrong Order**:

```typescript
// 1. Write the interface
interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
}

// 2. Write the test
it('should create user', async () => {
  /* ... */
});
```

**✅ Correct Order** (True TDD):

```typescript
// 1. Write the test FIRST
it('should create user with email and name', async () => {
  const repo = new UserRepository(db);
  const user = await repo.create({
    email: 'test@example.com',
    name: 'Test User',
  });

  expect(user.id).toBeDefined();
  expect(user.email).toBe('test@example.com');
  expect(user.name).toBe('Test User');
});

// 2. Test drives the interface into existence
// The test tells us we need a create() method that:
// - Accepts an object with email and name
// - Returns a User with id, email, name
```

**Key Insight**: The test **drives the interface into existence**. You discover the API through usage, not design up-front.

### 3. Outside-In TDD for Layered Architecture

For systems with multiple layers (Domain, Infrastructure, Application, API), use **Outside-In TDD**:

**Start from the outside (user-facing) and work inward:**

```
1. API Layer Test → Drives API interface
   ↓
2. Application Service Test → Drives service interface
   ↓
3. Domain Model Test → Drives model interface
   ↓
4. Infrastructure Repository Test → Implements interfaces
```

**Example Flow**:

```typescript
// 1. Start with API layer test (Outside)
describe('POST /users', () => {
  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'test@example.com', name: 'Test' });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
// This test drives the route handler interface

// 2. Service layer test
describe('UserService', () => {
  it('should create user via repository', async () => {
    const mockRepo = { create: jest.fn().mockResolvedValue(mockUser) };
    const service = new UserService(mockRepo);

    const user = await service.registerUser('test@example.com', 'Test');

    expect(mockRepo.create).toHaveBeenCalled();
  });
});
// This test drives the service interface and repository dependency

// 3. Domain model test
describe('User', () => {
  it('should create user instance', () => {
    const user = new User('id', 'test@example.com', 'Test');
    expect(user.email).toBe('test@example.com');
  });
});
// This test drives the domain model interface

// 4. Repository integration test (Inside)
describe('PrismaUserRepository', () => {
  it('should create user in database', async () => {
    const repo = new PrismaUserRepository(prisma);
    const user = await repo.create({ email: 'test@example.com', name: 'Test' });

    expect(user.id).toBeDefined();
    // Verify in database
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(dbUser).toBeDefined();
  });
});
```

**Key Benefit**: Each layer's interface is discovered through usage by the layer above.

### 4. Testing Immutability

**Pattern**: Test for the ABSENCE of methods, not just their presence.

**Why**: Some domain models are intentionally immutable (e.g., audit logs, event sourcing).

#### Example: Immutable Thought Repository

```typescript
// Test that update() and delete() methods DO NOT exist
describe('PrismaThoughtRepository Immutability Contract', () => {
  it('should NOT have update method (thoughts are immutable)', () => {
    const repo = new PrismaThoughtRepository(prisma);
    expect((repo as unknown as { update?: unknown }).update).toBeUndefined();
  });

  it('should NOT have delete method (thoughts are append-only)', () => {
    const repo = new PrismaThoughtRepository(prisma);
    expect((repo as unknown as { delete?: unknown }).delete).toBeUndefined();
  });
});
```

**Document in Interface**:

```typescript
/**
 * Repository for managing thoughts.
 *
 * **Immutability Contract**:
 * - Thoughts are append-only (no update/delete methods)
 * - Once created, thoughts cannot be modified
 * - Supports audit trails and historical analysis
 */
export interface IThoughtRepository {
  create(data: CreateThoughtDto): Promise<Thought>;
  findById(id: string): Promise<Thought | null>;
  findByUser(userId: string): Promise<Thought[]>;
  findAll(): Promise<Thought[]>;
  // NO update() - immutable by design
  // NO delete() - append-only for audit trail
}
```

**Benefits of Testing Immutability**:

- ✅ Prevents accidental addition of mutation methods
- ✅ Documents design intent in tests
- ✅ Catches violations during refactoring
- ✅ Simplifies reasoning about state (no changes to track)

### 5. The Most Common Mistake: Neglecting Refactor

**Warning**: The most common way to fail at TDD is **skipping the refactor step**.

Without refactoring:

- ❌ Code becomes a messy aggregation of fragments
- ❌ Technical debt accumulates rapidly
- ❌ Tests still pass but code is unmaintainable

**Refactor continuously**:

- ✅ Extract duplicate code into functions
- ✅ Rename variables for clarity
- ✅ Simplify complex conditionals
- ✅ Optimize performance
- ✅ Apply design patterns where appropriate

### 5. Keep Tests Small and Focused

**❌ Bad Test** (Tests too much):

```typescript
it('should handle complete user workflow', async () => {
  const user = await repo.create({ email: 'test@example.com' });
  const updated = await repo.update(user.id, { name: 'New Name' });
  const found = await repo.findById(user.id);
  await repo.delete(user.id);
  const deleted = await repo.findById(user.id);

  expect(deleted).toBeNull();
});
```

**✅ Good Tests** (One assertion per test):

```typescript
describe('UserRepository', () => {
  it('should create user', async () => {
    const user = await repo.create({ email: 'test@example.com' });
    expect(user.id).toBeDefined();
  });

  it('should update user name', async () => {
    const user = await repo.create({ email: 'test@example.com' });
    const updated = await repo.update(user.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
  });

  it('should return null when user deleted', async () => {
    const user = await repo.create({ email: 'test@example.com' });
    await repo.delete(user.id);
    const found = await repo.findById(user.id);
    expect(found).toBeNull();
  });
});
```

### 6. TDD Schools of Thought

There are two main approaches to TDD:

#### Detroit-School (Classicist) TDD

- ✅ Test real objects, not mocks
- ✅ Mock only external dependencies (database, API)
- ✅ Tests focus on behavior, not implementation
- ✅ Better integration testing

**Example**:

```typescript
it('should calculate total price', () => {
  const cart = new ShoppingCart();
  const product = new Product('Laptop', 1000);

  cart.addProduct(product);

  expect(cart.totalPrice()).toBe(1000);
});
// Uses real ShoppingCart and Product objects
```

#### London-School (Mockist) TDD

- ✅ Mock all collaborators
- ✅ Tests focus on interactions between objects
- ✅ Discover interfaces through mocking
- ✅ Better isolation, faster tests

**Example**:

```typescript
it('should add product to cart', () => {
  const mockProduct = { getPrice: jest.fn().mockReturnValue(1000) };
  const cart = new ShoppingCart();

  cart.addProduct(mockProduct);

  expect(mockProduct.getPrice).toHaveBeenCalled();
});
// Mocks the Product collaborator
```

**Recommendation**: Use **Detroit-School for domain logic**, **London-School for infrastructure**.

---

## TDD Workflow for TypeScript + Jest

### Step-by-Step Process

**Phase 0: List Test Cases**

```bash
# Create test plan
1. List all scenarios to test
2. Prioritize by importance
3. Start with simplest case
```

**Phase 1: RED - Write Failing Test**

```bash
# 1. Create test file
touch src/domain/__tests__/User.test.ts

# 2. Write test
describe('User', () => {
  it('should create user with email', () => {
    const user = new User('id', 'test@example.com', 'Test');
    expect(user.email).toBe('test@example.com');
  });
});

# 3. Run test
npm test
# ❌ FAIL: Cannot find module '../models/User'
```

**Phase 2: GREEN - Make It Pass**

```bash
# 1. Create minimal implementation
touch src/domain/models/User.ts

# 2. Write code to pass test
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string
  ) {}
}

# 3. Run test
npm test
# ✅ PASS
```

**Phase 3: REFACTOR - Improve Code**

```bash
# 1. Improve code (e.g., add validation)
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string
  ) {
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
}

# 2. Run test
npm test
# ✅ PASS

# 3. Add test for new behavior
it('should throw on invalid email', () => {
  expect(() => new User('id', 'invalid', 'Test')).toThrow('Invalid email');
});

# 4. Run test
npm test
# ✅ PASS
```

---

## TDD in Layered Architecture

### Application to Repository Pattern

When using Repository Pattern with Domain/Infrastructure layers:

**1. Start with Test (Not Interface)**

```typescript
// ❌ WRONG: Don't start by defining interface
interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
}

// ✅ CORRECT: Start with test
describe('UserRepository', () => {
  it('should create user in database', async () => {
    const repo = getUserRepository(); // Function to get repo instance

    const user = await repo.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

**2. Extract Interface from Usage**

After writing several tests, you'll see the pattern:

```typescript
// The tests reveal the interface we need:
interface IUserRepository {
  create(data: { email: string; name: string }): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**3. Test-Driven Contract Guarantees**

Tests drive contract behavior:

```typescript
it('findById returns null when not found, not throws', async () => {
  const user = await repo.findById('nonexistent');
  expect(user).toBeNull(); // Contract: returns null
});

it('delete is idempotent', async () => {
  await repo.delete('some-id');
  await expect(repo.delete('some-id')).resolves.not.toThrow(); // Contract: idempotent
});

it('create throws on duplicate email', async () => {
  await repo.create({ email: 'test@example.com', name: 'Test' });
  await expect(repo.create({ email: 'test@example.com', name: 'Test2' })).rejects.toThrow(); // Contract: throws on duplicate
});
```

### Order of Development (TDD-Driven)

**1. Domain Models (Pure TypeScript)**

```typescript
// Test drives model
it('should create thought as immutable', () => {
  const thought = new Thought('id', 'text', 'user-id');
  expect(thought.text).toBe('text');
  expect(() => {
    thought.text = 'new';
  }).toThrow(); // readonly
});

// Implementation
export class Thought {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly userId: string
  ) {}
}
```

**2. Repository Tests with Mocks (Application Layer)**

```typescript
// Test drives service interface
it('should create thought via repository', async () => {
  const mockRepo = {
    create: jest.fn().mockResolvedValue(new Thought('id', 'text', 'user-id')),
  };
  const service = new ThoughtService(mockRepo);

  const thought = await service.createThought('text', 'user-id');

  expect(mockRepo.create).toHaveBeenCalledWith({ text: 'text', userId: 'user-id' });
});
```

**3. Repository Implementation (Infrastructure Layer)**

```typescript
// Integration test drives repository implementation
it('should save thought to database', async () => {
  const repo = new PrismaThoughtRepository(prisma);

  const thought = await repo.create({ text: 'text', userId: 'user-id' });

  expect(thought.id).toBeDefined();

  // Verify in database
  const dbThought = await prisma.thought.findUnique({ where: { id: thought.id } });
  expect(dbThought).toBeDefined();
});
```

---

## Common TDD Antipatterns

### 1. ❌ Writing Implementation First

```typescript
// WRONG ORDER:
// 1. Write interface
interface IUserRepository {
  /* ... */
}

// 2. Write implementation
class PrismaUserRepository implements IUserRepository {
  /* ... */
}

// 3. Write tests
describe('PrismaUserRepository', () => {
  /* ... */
});
```

**Problem**: You're not doing TDD if implementation comes before tests.

**Solution**: Write test first, let it drive the interface.

### 2. ❌ Testing Implementation Details

```typescript
// BAD: Tests internal state
it('should set isDeleted flag', async () => {
  await repo.delete('user-id');
  expect(repo['_users'][0].isDeleted).toBe(true); // Internal detail!
});

// GOOD: Tests behavior
it('should not find deleted user', async () => {
  await repo.delete('user-id');
  const user = await repo.findById('user-id');
  expect(user).toBeNull(); // Behavior from outside
});
```

### 3. ❌ Skipping RED Phase

```typescript
// BAD: Write passing test immediately
it('should return true', () => {
  expect(true).toBe(true); // Already passes!
});

// GOOD: Write failing test first
it('should validate email', () => {
  expect(validateEmail('invalid')).toBe(false);
});
// Run → FAIL: validateEmail is not defined
// Then implement validateEmail
```

### 4. ❌ Not Refactoring

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

// REFACTOR: Clean it up
function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.getFinalPrice(), 0);
}
```

---

## TDD with TypeScript Best Practices

### 1. Use Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

Tests will catch type errors immediately.

### 2. Test TypeScript Compilation

```typescript
// Test that interfaces compile correctly
it('should compile with correct types', () => {
  const repo: IUserRepository = new PrismaUserRepository(prisma);
  // If this compiles, interface is correct
  expect(repo).toBeDefined();
});
```

### 3. Use Type Guards in Tests

```typescript
it('should return User or null', async () => {
  const user = await repo.findById('id');

  if (user === null) {
    expect(user).toBeNull();
  } else {
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
  }
});
```

---

## TDD Metrics and Success Criteria

### Code Coverage

- **Target**: 70%+ overall
- **Domain Layer**: 90%+ (pure logic, easy to test)
- **Infrastructure Layer**: 80%+ (integration tests)
- **Application Layer**: 80%+ (mocked dependencies)

### Test Speed

- **Unit Tests**: <1ms per test (domain models)
- **Application Tests**: <10ms per test (mocked repositories)
- **Integration Tests**: <100ms per test (in-memory database)
- **E2E Tests**: <1s per test (full stack)

### Test Quality (MC-FIRE)

- **M**eaningful: Tests verify important behavior
- **C**omplete: All edge cases covered
- **F**ast: Run quickly
- **I**solated: Tests don't depend on each other
- **R**epeatable: Same result every time
- **E**xpressive: Test names clearly describe what they test

---

## TDD Tools and Frameworks

### TypeScript + Jest Setup

```bash
npm install --save-dev jest @types/jest ts-jest @jest/globals
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Test Organization

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

---

## TDD Example: Complete Workflow

### Scenario: Build User Repository

**Test Case List**:

```
1. [ ] Create user with email and name
2. [ ] Find user by ID when exists
3. [ ] Find user by ID returns null when not exists
4. [ ] Find all users returns empty array when no users
5. [ ] Update user changes fields
6. [ ] Delete user removes from database
7. [ ] Create user throws on duplicate email
8. [ ] Delete is idempotent
```

**Pick Test #1: Create User**

```typescript
// RED: Write failing test
describe('UserRepository', () => {
  it('should create user with email and name', async () => {
    const repo = new PrismaUserRepository(prisma);

    const user = await repo.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });
});

// Run → ❌ FAIL: PrismaUserRepository is not defined
```

```typescript
// GREEN: Minimal implementation
export class PrismaUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { email: string; name: string }): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return new User(prismaUser.id, prismaUser.email, prismaUser.name);
  }
}

// Run → ✅ PASS
```

```typescript
// REFACTOR: Extract mapper
export class PrismaUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { email: string; name: string }): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return this.toDomain(prismaUser);
  }

  private toDomain(prismaUser: any): User {
    return new User(prismaUser.id, prismaUser.email, prismaUser.name);
  }
}

// Run → ✅ PASS
```

**Move to Test #2, repeat RED-GREEN-REFACTOR...**

---

## Resources

### Essential Reading

- **Kent Beck**: _Test-Driven Development: By Example_ - The original TDD book
- **Martin Fowler**: https://martinfowler.com/bliki/TestDrivenDevelopment.html
- **James Shore**: _The Art of Agile Development_ - Chapter on TDD
- **Let's Play TDD**: http://www.jamesshore.com/Blog/Lets-Play - Screencasts

### Related Practices

- **Refactoring**: Clean up code while maintaining passing tests
- **Continuous Integration**: Run tests on every commit
- **Pair Programming**: Two people, one keyboard, TDD together

### TDD Schools

- **Detroit/Classical TDD**: Minimize mocking, test real objects
- **London/Mockist TDD**: Mock all collaborators, test interactions
- **Discovery Testing**: Outside-in, discover interfaces through tests

---

## Summary

**TDD in 10 Points**:

1. ✅ **Write test first** before any implementation code
2. ✅ **Test drives interface** into existence (not designed up-front)
3. ✅ **RED → GREEN → REFACTOR** is the fundamental cycle
4. ✅ **List test cases** before starting to organize your work
5. ✅ **Keep tests small** - one assertion per test when possible
6. ✅ **Don't skip refactor** - most common failure mode
7. ✅ **Tests are safety net** - refactor fearlessly
8. ✅ **Outside-in for layers** - start from API, work inward
9. ✅ **Mock sparingly** - prefer real objects for domain logic
10. ✅ **Coverage is byproduct** - TDD naturally achieves high coverage

**Golden Rule**: If you write implementation code without a failing test demanding it, you're not doing TDD.

**Next Steps**:

1. Pick a feature to build
2. List test cases
3. Write one failing test
4. Make it pass with minimal code
5. Refactor
6. Repeat

---

## Integration with This Codebase

### Current Workflow Adjustment

**Previous (Not True TDD)**:

```
Architect → Creates interfaces → Tester → Designs tests → Developer → Implements
```

**TDD Way**:

```
Developer → Writes test → Test drives interface → Implements → Refactors
```

### Recommended Approach for O1-Database-Foundation

**Phase 1: Test-Driven Domain Models**

```typescript
// Write test FIRST
it('should create immutable Thought', () => {
  const thought = new Thought('id', 'text', 'user-id');
  expect(thought.text).toBe('text');
});
// Then implement Thought class
```

**Phase 2: Test-Driven Repository (Integration)**

```typescript
// Write integration test FIRST
it('should save thought to database', async () => {
  const repo = new PrismaThoughtRepository(prisma);
  const thought = await repo.create({ text: 'test', userId: 'user-id' });
  expect(thought.id).toBeDefined();
});
// Then implement repository
```

**Phase 3: Extract Interface (Retrospectively)**

```typescript
// After several passing tests, extract common interface
interface IThoughtRepository {
  create(data: CreateThoughtDto): Promise<Thought>;
  findById(id: string): Promise<Thought | null>;
  // Methods discovered through tests
}
```

This is **true TDD** - tests first, interface emerges from usage.
