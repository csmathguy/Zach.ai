---
name: Testing guidelines
applyTo: '**/*.test.{ts,tsx}'
---

## Testing Framework

- **Jest** for test runner and assertions
- **Testing Library** for React component testing
- **Supertest** for API endpoint testing
- **70%+ coverage** target for all code

## Jest-DOM Configuration with @jest/globals

**Critical Pattern**: When using `@jest/globals` imports, you MUST use the special jest-dom import variant:

```typescript
// jest.setup.ts
import '@testing-library/jest-dom/jest-globals'; // ← NOT the standard import!

// Standard import will cause TypeScript errors:
// import '@testing-library/jest-dom'; // ❌ Will fail with @jest/globals
```

**Why**: The `@jest/globals` pattern requires explicit imports (`import { describe, it, expect }`), which creates a different matcher type system. The `/jest-globals` variant properly extends these types.

**Symptoms of incorrect import**:

- TypeScript error: "Property 'toBeInTheDocument' does not exist on type 'Matchers<...>'"
- Tests pass at runtime but show red squiggles in editor
- `tsc --noEmit` reports matcher type errors

**Solution**: Always use `/jest-globals` suffix when project uses `@jest/globals` imports.

## Test Structure - AAA Pattern

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Component/Function Name', () => {
  it('should perform expected behavior', () => {
    // Arrange - Set up test data and conditions
    const input = 'test';

    // Act - Execute the code being tested
    const result = myFunction(input);

    // Assert - Verify the result
    expect(result).toBe('expected');
  });
});
```

## React Component Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## API Testing

```typescript
import request from 'supertest';
import app from './app';

describe('GET /api/health', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      timestamp: expect.any(Number),
    });
  });
});
```

## Mocking

### Mock Functions

```typescript
const mockFn = jest.fn();

// Mock implementation
mockFn.mockImplementation((x) => x * 2);

// Mock return value
mockFn.mockReturnValue(42);

// Mock resolved promise
mockFn.mockResolvedValue({ data: 'success' });

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(3);
```

### Mock Modules

```typescript
// Mock entire module
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ id: 1, name: 'Test' })),
}));

// Partial mock
jest.mock('./config', () => ({
  ...jest.requireActual('./config'),
  API_URL: 'http://test.local',
}));
```

## Async Testing

```typescript
// Using async/await
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ success: true });
});

// Using waitFor for UI updates
it('should show loading then data', async () => {
  render(<DataComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

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
```

## Best Practices

### Test Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation details
expect(component.state.count).toBe(1);

// ✅ Good - Testing user-facing behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### Use Testing Library Queries Correctly

```typescript
// Priority order:
1. getByRole - Most accessible
2. getByLabelText - Forms
3. getByPlaceholderText - Forms
4. getByText - Non-interactive
5. getByTestId - Last resort

// ✅ Good
screen.getByRole('button', { name: 'Submit' });

// ❌ Bad
screen.getByTestId('submit-button');
```

### Setup and Teardown

```typescript
import { beforeEach, afterEach } from '@jest/globals';

describe('Component', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });
});
```

## Coverage Requirements

- **70%+ overall coverage** (lines, functions, branches)
- **100% for critical paths** (authentication, payments, data mutations)
- **Focus on behavior** not just line coverage
- Run: `npm run test:coverage`

## Common Patterns

### Test User Interactions

```typescript
// Click
await userEvent.click(screen.getByRole('button'));

// Type
await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');

// Select
await userEvent.selectOptions(screen.getByRole('combobox'), 'option1');
```

### Test Forms

```typescript
it('should submit form with valid data', async () => {
  const onSubmit = jest.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### Test Error States

```typescript
it('should display error message on failure', async () => {
  const mockFetch = jest.fn().mockRejectedValue(new Error('Failed'));

  render(<DataComponent fetch={mockFetch} />);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed')).toBeInTheDocument();
  });
});
```

## Naming Conventions

- `describe` blocks: Component/function name
- `it` blocks: "should [expected behavior]"
- Test files: `ComponentName.test.tsx` or `function.test.ts`
- Test folder: `__tests__/` co-located with source

## Pre-Commit

- All tests pass (`npm test`)
- No skipped tests (`.skip`) in committed code
- Coverage meets threshold (70%+)
- Tests are fast (< 5 seconds total)
- No console errors or warnings
- Mock cleanup properly handled
- **Zero TypeScript errors**: Run `npm run typecheck` before committing

## Testability Categories

Different code types have different testability characteristics:

### High Testability (Target: 100%)

- **Pure functions**: Utilities, formatters, parsers, validators
- **React components**: UI logic with Testing Library
- **Hooks**: Custom React hooks with `renderHook`
- **API utilities**: Functions that process data

### Medium Testability (Target: 80%+)

- **Components with side effects**: API calls, localStorage
- **Event handlers**: User interactions with async behavior
- **State management**: Complex useState/useReducer logic

### Lower Testability (Target: 60%+, Document Why)

- **Browser-specific APIs**: `window.location.reload()`, `window.open()`
- **Environment detection**: `import.meta.env` checks
- **Error boundaries**: React error handling components

**Best Practice**: For lower testability code, document why in comments and ensure critical paths have integration/E2E tests.

## Coverage vs. Quality

**Coverage is not the goal** - it's a metric to find untested code:

- ✅ **High coverage + high quality**: Tests verify behavior, edge cases handled
- ⚠️ **High coverage + low quality**: Tests check implementation details, brittle
- ❌ **Low coverage**: Missing tests, unknown behavior

Focus on:

1. **User-facing behavior**: What users see and interact with
2. **Critical paths**: Authentication, data mutations, business logic
3. **Edge cases**: Error states, empty data, boundary conditions
4. **Integration points**: API calls, localStorage, routing

---

**For detailed patterns**: See [knowledge-base/jest/README.md](../../knowledge-base/jest/README.md)  
**For Testing Library**: See [knowledge-base/testing-library/README.md](../../knowledge-base/testing-library/README.md) (when documented)
