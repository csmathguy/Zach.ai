# Test-Driven Development (TDD) Instructions

**Apply to**: All test and implementation files  
**Reference**: [knowledge-base/tdd/README.md](../../knowledge-base/tdd/README.md) (800+ lines comprehensive guide)

---

## Core Principle

**Tests come FIRST. Always.** If you write implementation code without a failing test demanding it, you're not doing TDD.

**Cycle**: RED (failing test) → GREEN (make it pass) → REFACTOR (improve code) → Repeat

**Deep Dive**: [knowledge-base/tdd/README.md - RED-GREEN-REFACTOR Section](../../knowledge-base/tdd/README.md#the-red-green-refactor-cycle)

---

## Phase -1: Environment Verification (Project-Specific)

**Before listing test cases, verify actual file locations and tool versions.**

### Critical Checks

```powershell
# Verify file locations (prevents path errors)
Get-ChildItem backend -Recurse -Filter "*.db"  # Database at backend/dev.db NOT prisma/dev.db

# Check existing patterns (Prisma 7.x requires adapter)
grep_search "new PrismaClient" backend/src/infrastructure/

# Verify PowerShell version (npm scripts compatibility)
Get-Command powershell.exe  # Windows PS 5.1 - use "powershell" not "pwsh"
```

**Document findings** in `work-items/<branch>/dev/implementation-notes.md`

**Deep Dive**: [knowledge-base/tdd/README.md - Phase -1 Section](../../knowledge-base/tdd/README.md#phase--1-verify-environment)

---

## Phase 0: List Test Cases

**Before starting RED-GREEN-REFACTOR**, write checklist of test cases:

```markdown
- [ ] Create user with valid data returns User with ID
- [ ] Create user with duplicate email throws error
- [ ] Find user by ID returns null when not exists
```

Then pick one and apply RED-GREEN-REFACTOR.

---

## Phase 1: RED - Write Failing Test

**CRITICAL**: RED phase means:

- ✅ Tests COMPILE and RUN successfully
- ✅ Tests FAIL with ASSERTION ERRORS
- ❌ NOT "Cannot find module" or TypeScript errors

**Create minimal stubs** to allow compilation, THEN see assertion failures.

```typescript
// Step 1: Create stub (allows compilation)
export class PrismaUserRepository {
  create(): any {
    return undefined;
  }
}

// Step 2: Write test (compiles, but assertion fails)
it('should create user', async () => {
  const user = await repo.create({ email: 'test@example.com', name: 'Test' });
  expect(user.id).toBeDefined(); // ❌ FAIL: Expected undefined to be defined
});
// This is PROPER RED - assertion failure, not compilation error
```

---

## Phase 2: GREEN - Make It Pass

Write **minimum code** to pass the test. Don't optimize yet.

```typescript
async create(data: { email: string; name: string }): Promise<User> {
  const prismaUser = await this.prisma.user.create({ data });
  return new User(prismaUser.id, prismaUser.email, prismaUser.name);
}
// ✅ PASS - minimal implementation
```

---

## Phase 3: REFACTOR - Improve Code

Clean up while maintaining GREEN:

- Extract duplicated code
- Rename for clarity
- Optimize performance
- Apply SOLID principles

```typescript
// Extract mapper (refactor while GREEN)
private toDomain(prismaUser: any): User {
  return new User(prismaUser.id, prismaUser.email, prismaUser.name);
}
```

**Deep Dive**: [knowledge-base/tdd/README.md - Complete Workflow Example](../../knowledge-base/tdd/README.md#tdd-example-complete-workflow)

---

## When to Extract Interfaces

**NOT before tests.** Extract interfaces **AFTER** you've written 3-5 tests and see patterns emerge.

**Deep Dive**: [knowledge-base/tdd/README.md - When to Extract Interfaces](../../knowledge-base/tdd/README.md#when-to-extract-interfaces)

---

## Outside-In TDD (Layered Architecture)

For Domain → Infrastructure → Application → API layers, **start from outside (API) and work inward**.

**Flow**: API Test → Service Test → Domain Test → Repository Test

**Deep Dive**: [knowledge-base/tdd/README.md - Outside-In TDD](../../knowledge-base/tdd/README.md#outside-in-tdd-for-layered-architecture)

---

## Project-Specific Patterns

### Test File Structure

```
src/
├── domain/__tests__/User.test.ts          # Domain model tests
├── infrastructure/__tests__/PrismaUserRepository.test.ts  # Integration
└── application/__tests__/UserService.test.ts   # Service with mocks
```

### Test Commands

```bash
npm test -- --watch User.test.ts  # Watch mode
npm test -- --coverage            # Coverage
```

### Speed Expectations

- Domain: <1ms (pure TypeScript)
- Services: <10ms (mocked)
- Repositories: <100ms (in-memory DB)
- API: <1s (full stack)

### Test Naming

```typescript
// ✅ Good: User-facing behavior
it('should return null when user not found', () => {});

// ❌ Bad: Implementation details
it('should call prisma.user.create', () => {});
```

### AAA Pattern

```typescript
it('should update user', async () => {
  // Arrange
  const user = await repo.create({ email: 'test@test.com', name: 'Test' });

  // Act
  const updated = await repo.update(user.id, { name: 'New' });

  // Assert
  expect(updated.name).toBe('New');
});
```

### Mocking (Application Layer)

```typescript
const mockRepo: IUserRepository = {
  create: jest.fn().mockResolvedValue(mockUser),
  findById: jest.fn(),
  findAll: jest.fn(),
};
```

### Real Objects (Domain + Infrastructure)

```typescript
// Domain: Real models
const user = new User('id', 'test@test.com', 'Test');

// Infrastructure: Real repository with in-memory DB
const repo = new PrismaUserRepository(prisma);
```

---

## Common Antipatterns

- ❌ **Writing implementation first** - Not TDD
- ❌ **Testing implementation details** - Test behavior
- ❌ **Skipping RED phase** - Must fail first
- ❌ **Not refactoring** - Clean up while GREEN
- ❌ **Creating contracts before tests** - Let tests drive interfaces

**Deep Dive**: [knowledge-base/tdd/README.md - Antipatterns](../../knowledge-base/tdd/README.md#common-tdd-antipatterns)

---

## Clean Test Output (Project-Specific)

**Suppress expected error logs** in repository integration tests:

```typescript
let originalConsoleLog: typeof console.log;

beforeAll(() => {
  originalConsoleLog = console.log;
  console.log = (...args: unknown[]) => {
    const message = String(args[0]);
    if (message.includes('prisma:error')) return; // Suppress Prisma errors
    originalConsoleLog(...args);
  };
});

afterAll(() => {
  console.log = originalConsoleLog;
});
```

**Why**: Prisma logs expected errors (duplicate email tests) - suppress to keep output clean.

---

## Success Metrics

- **Coverage** (byproduct): 70%+ overall, 90%+ domain, 80%+ infrastructure/application
- **Test Quality** (MC-FIRE): Meaningful, Complete, Fast, Isolated, Repeatable, Expressive
- **TDD Compliance**: All tests written BEFORE implementation, proper RED→GREEN→REFACTOR cycle

---

## Quick Reference

**Mantra**: RED (write failing test) → GREEN (make it pass) → REFACTOR (improve code)

**Golden Rule**: If you write implementation code without a failing test demanding it, you're not doing TDD.

**When in Doubt**:

1. Write test showing how you want to use the code
2. Watch it fail (RED)
3. Write simplest code to make it pass (GREEN)
4. Clean up the code (REFACTOR)
5. Repeat

---

**Deep Dive**: [knowledge-base/tdd/README.md](../../knowledge-base/tdd/README.md) (800+ lines)  
**Resources**: [Martin Fowler](https://martinfowler.com/bliki/TestDrivenDevelopment.html) | [Kent Beck Book](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
