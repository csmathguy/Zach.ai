---
name: Testing guidelines
applyTo: '**/*.test.{ts,tsx}'
---

## Testing Framework

- **Jest** + **Testing Library** (React components)
- **Supertest** (API endpoints)
- **70%+ coverage** target
- **Reference**: [Jest KB](../../knowledge-base/jest/README.md) | [Testing Library KB](../../knowledge-base/testing-library/README.md)

---

## Jest-DOM Configuration with @jest/globals

**CRITICAL**: When using `@jest/globals` imports, use the special jest-dom variant:

```typescript
// jest.setup.ts
import '@testing-library/jest-dom/jest-globals'; // ✅ Correct for @jest/globals

// NOT the standard import:
// import '@testing-library/jest-dom'; // ❌ Causes TypeScript matcher errors
```

**Why**: `@jest/globals` requires explicit imports which changes the matcher type system. The `/jest-globals` suffix extends these types correctly.

**Symptoms if wrong**:

- TypeScript error: "Property 'toBeInTheDocument' does not exist"
- Tests pass but red squiggles in editor
- `tsc --noEmit` fails

---

## Test Structure - AAA Pattern

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Component/Function', () => {
  it('should perform expected behavior', () => {
    // Arrange - Setup
    const input = 'test';

    // Act - Execute
    const result = myFunction(input);

    // Assert - Verify
    expect(result).toBe('expected');
  });
});
```

---

## React Component Testing Quick Reference

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle interaction', async () => {
  render(<Button onClick={jest.fn()}>Click</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

**Patterns**: [Testing Library KB](../../knowledge-base/testing-library/README.md)

---

## API Testing Quick Reference

```typescript
import request from 'supertest';
import app from './app';

it('should return 200', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
});
```

**Patterns**: [Supertest KB](../../knowledge-base/supertest/README.md)

---

## Mocking Quick Reference

```typescript
// Mock function
const mockFn = jest.fn().mockReturnValue(42);

// Mock module
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ id: 1 })),
}));
```

**Deep Dive**: [Jest KB - Mocking](../../knowledge-base/jest/README.md#mocking-best-practices)

---

## Coverage & Validation

```bash
npm test -- --coverage        # Generate coverage report
npm run typecheck             # Zero TypeScript errors required
```

**Target**: 70%+ coverage per project (frontend/backend)

**Best Practices**: [Jest KB](../../knowledge-base/jest/README.md) | [TDD KB](../../knowledge-base/tdd/README.md)

expect(screen.getByText('Loading...')).toBeInTheDocument();

await waitFor(() => {
expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
});

````

## Custom Hooks Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

it('should increment counter', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
````

## Best Practices

### Test Behavior, Not Implementation

## Core Testing Principles

- **Test behavior, not implementation**: `screen.getByText('Count: 1')` not `component.state.count`
- **Testing Library query priority**: getByRole > getByLabelText > getByText > getByTestId
- **Coverage targets**: 70%+ overall, focus on behavior over line coverage
- **Pre-commit**: All tests pass, no `.skip`, `npm run typecheck` passes

## SQLite Concurrency (Critical)

**Symptoms**: `deleteMany` timeouts, `Transaction already closed`, `database is locked` - disappear with `--runInBand`

**Fix**: Set `maxWorkers: 1` in `backend/jest.config.js` and document why (SQLite file-based DB cannot handle concurrent writers in WAL mode)

**Deep Dive**: [knowledge-base/jest/README.md - SQLite Section](../../knowledge-base/jest/README.md#sqlite-and-file-based-databases)

## Testability Categories

- **High (100% target)**: Pure functions, React components, hooks, utilities
- **Medium (80% target)**: Components with side effects, event handlers, state management
- **Lower (60% target)**: Browser APIs (`window.location`), env detection, error boundaries - **document why in comments**

## Coverage vs Quality

Coverage is a **metric to find untested code**, not a goal. Focus on:

- User-facing behavior
- Critical paths (auth, mutations, business logic)
- Edge cases (errors, empty data, boundaries)
- Integration points (APIs, storage, routing)

**Deep Dive**: [knowledge-base/jest/README.md](../../knowledge-base/jest/README.md) | [knowledge-base/testing-library/README.md](../../knowledge-base/testing-library/README.md)
