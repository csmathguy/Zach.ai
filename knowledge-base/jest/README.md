# Jest Testing Framework

## Overview

Jest is a delightful JavaScript testing framework with a focus on simplicity. It works out of the box for most JavaScript projects and provides a complete testing solution with excellent TypeScript and React support.

**Official Documentation**: https://jestjs.io/

**Version Recommendation**: Latest stable (30.0+)

**Philosophy**: Zero config, fast, isolated tests with built-in mocking, coverage, and snapshots.

---

## Quick Reference

### Essential Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.test.ts

# Update snapshots
npm test -- -u

# Run tests matching pattern
npm test -- --testNamePattern="should handle"
```

### Test File Naming Conventions

```
# Recommended patterns
*.test.ts      # Component.test.ts
*.test.tsx     # Button.test.tsx
*.spec.ts      # service.spec.ts
*.spec.tsx     # Modal.spec.tsx

# Directory structure
__tests__/     # Dedicated test folders
```

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Component Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should perform expected behavior', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

---

## Enterprise Best Practices

### 1. Test Organization

#### Directory Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx          # Co-located tests
│   ├── services/
│   │   └── api.ts
│   └── utils/
│       └── helpers.ts
├── __tests__/
│   ├── integration/                  # Integration tests
│   ├── e2e/                          # End-to-end tests
│   └── __fixtures__/                 # Test data
├── __mocks__/                        # Manual mocks
└── jest.config.js
```

#### Co-location vs Separation

- **Co-located**: Place `*.test.ts` files next to source files
- **Separated**: Use `__tests__/` folders for complex test suites
- **Prefer co-location** for unit tests, separation for integration/e2e

#### Test Categories

```typescript
// Unit tests - Fast, isolated
describe('Unit: parseJSON', () => {
  /* ... */
});

// Integration tests - Test interactions
describe('Integration: UserService', () => {
  /* ... */
});

// E2E tests - Full user flows
describe('E2E: User Login Flow', () => {
  /* ... */
});
```

### 2. Configuration Best Practices

#### jest.config.js (Root)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  // Use projects for monorepos
  projects: ['<rootDir>/frontend', '<rootDir>/backend'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Watch mode optimizations
  watchPathIgnorePatterns: ['node_modules', 'dist', 'coverage'],

  // Fail fast in CI
  bail: process.env.CI ? 1 : 0,

  // Verbose output in CI only
  verbose: !!process.env.CI,
};
```

#### Frontend Jest Config (TypeScript + React)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jsdom',

  // File patterns
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],

  // TypeScript transformation
  transform: {
    '^.+\\.tsx?$': ['@babel/preset-typescript', { tsconfig: './tsconfig.json' }],
  },

  // Module resolution
  moduleNameMapper: {
    // CSS/SCSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Image/file imports
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',

    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/vite-env.d.ts',
  ],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: ['node_modules/(?!(module-to-transform)/)'],
};
```

#### Backend Jest Config (Node.js + TypeScript)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'backend',
  testEnvironment: 'node',

  // File patterns
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],

  // TypeScript transformation
  preset: 'ts-jest',

  // Coverage
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],

  // Global setup/teardown for database
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
};
```

### 3. TypeScript Configuration

#### Using ts-jest (Recommended for Node.js)

```bash
npm install --save-dev ts-jest @types/jest
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // ts-jest specific config
  globals: {
    'ts-jest': {
      tsconfig: {
        // Faster compilation
        isolatedModules: true,

        // Allow JS in TS
        allowJs: true,
      },
    },
  },
};
```

#### Using Babel (Recommended for React)

```bash
npm install --save-dev babel-jest @babel/preset-typescript @babel/preset-react
```

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
```

#### Type Definitions

```typescript
// Option 1: Import from @jest/globals (Recommended)
import { describe, it, expect, jest } from '@jest/globals';

// Option 2: Use @types/jest (Global types)
// No imports needed, but less explicit
```

### 4. React Testing Best Practices

#### Testing Library Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### jest.setup.ts

```typescript
import '@testing-library/jest-dom';

// Custom matchers available:
// expect(element).toBeInTheDocument()
// expect(element).toHaveTextContent('text')
// expect(element).toBeVisible()
```

#### Component Testing Pattern

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

#### Snapshot Testing

```typescript
import renderer from 'react-test-renderer';
import { Link } from './Link';

it('should match snapshot', () => {
  const tree = renderer.create(<Link page="/">Home</Link>).toJSON();
  expect(tree).toMatchSnapshot();
});

// Update snapshots with: npm test -- -u
```

### 5. Mocking Best Practices

#### Mock Functions

```typescript
// Create mock
const mockFn = jest.fn();

// Mock implementation
mockFn.mockImplementation((x) => x * 2);

// Mock return value
mockFn.mockReturnValue(42);

// Mock resolved promise
mockFn.mockResolvedValue({ data: 'success' });

// Mock rejected promise
mockFn.mockRejectedValue(new Error('Failed'));

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(3);
```

#### Module Mocking

```typescript
// Automatic mock
jest.mock('./api');

// Mock with implementation
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ id: 1, name: 'Test' })),
}));

// Partial mock
jest.mock('./config', () => ({
  ...jest.requireActual('./config'),
  API_URL: 'http://test.local',
}));

// Mock only for one test
import { fetchUser } from './api';
jest.mock('./api');

it('should fetch user', () => {
  (fetchUser as jest.Mock).mockResolvedValue({ id: 1 });
  // test code
});
```

#### Manual Mocks

```typescript
// __mocks__/axios.ts
export default {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
};
```

### 6. Async Testing

#### Promises

```typescript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ success: true });
});

// Or using .resolves
it('should fetch data', () => {
  return expect(fetchData()).resolves.toEqual({ success: true });
});
```

#### Callbacks

```typescript
it('should call callback with data', (done) => {
  function callback(data) {
    expect(data).toBe('result');
    done();
  }

  fetchDataWithCallback(callback);
});
```

#### Timers

```typescript
jest.useFakeTimers();

it('should delay execution', () => {
  const callback = jest.fn();

  setTimeout(callback, 1000);

  jest.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});

jest.useRealTimers();
```

### 7. Coverage Best Practices

#### Configuration

```javascript
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',

  // Report formats
  coverageReporters: ['text', 'lcov', 'html'],

  // Collect from
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
  ],

  // Thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Per-directory thresholds
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

#### Ignoring Code from Coverage

```typescript
// Ignore next line
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  // dev only code
}

// Ignore function
/* istanbul ignore next */
function debugOnly() {
  console.log('debug');
}
```

### 8. Performance Optimization

#### Parallel Execution

```javascript
module.exports = {
  // Use all available cores (default)
  maxWorkers: '100%',

  // Or limit workers
  maxWorkers: 4,

  // Worker threads (faster)
  workerThreads: true,
};
```

#### Test Isolation

```javascript
module.exports = {
  // Clear mocks between tests
  clearMocks: true,

  // Reset modules between tests (slower but safer)
  resetModules: true,

  // Restore mocks (includes clearMocks + restore original)
  restoreMocks: true,
};
```

#### Cache

````javascript
module.exports = {

### SQLite and File-Based Databases

Jest's default behavior is to spawn multiple workers. That works well for most projects, but **file-based databases such as SQLite (especially when using WAL mode) cannot handle concurrent writers**. When multiple workers issue `deleteMany`, `insert`, or long-running transactions simultaneously, SQLite exhausts its lock table and begins throwing errors such as:

- `PrismaClientKnownRequestError: Transaction already closed: A writer needs the exclusive lock`
- `Error: database is locked` or long running `deleteMany` calls that never return

#### Symptoms

- Integration tests pass when run individually or with `--runInBand` but fail in the full suite
- Random timeouts anytime multiple suites manipulate the same SQLite database
- WAL files (`*.db-wal`, `*.db-shm`) keep growing between tests because workers exit mid-transaction

#### Mitigation Strategies

1. **Serialize workers for SQLite-backed projects**

  ```javascript
  // backend/jest.config.js
  /** @type {import('jest').Config} */
  module.exports = {
    displayName: 'backend',
    testEnvironment: 'node',
    preset: 'ts-jest',
    // SQLite uses a single file, so concurrent writers cause WAL locks.
    // Force Jest to use one worker for deterministic tests.
    maxWorkers: 1,
  };
````

Document this decision inline (see example comment) so future contributors do not remove it for perceived performance gains.

2. **Run suites sequentially when debugging**

```bash
npx jest --runInBand src/__tests__/infrastructure/PrismaProjectRepository.test.ts
```

If failures disappear with `--runInBand`, the database lock limit—not the test code—is at fault.

3. **Per-worker databases for advanced parallelism**

For teams that require Jest parallelism, provision a **unique database per worker**:

```typescript
// jest.setup.ts or a global setup file
process.env.DATABASE_URL = `file:./dev-worker-${process.env.JEST_WORKER_ID}.db?journal_mode=WAL`;
```

Create and tear down these files in `globalSetup/globalTeardown` to avoid leaking artifacts.

Always update the feature's **test plan** and ADRs when enforcing serialized workers so downstream tooling (CI, PM2 scripts) mirrors the same constraint.

---

// Cache directory (speeds up subsequent runs)
cacheDirectory: '<rootDir>/.jest-cache',

// Disable cache when needed
cache: false,
};

````

---

## Setup Instructions

### Step 1: Install Dependencies

#### For TypeScript + React Project

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-environment-jsdom
````

#### For TypeScript + Node.js Project

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest
```

### Step 2: Create Configuration

#### jest.config.js (Frontend - Vite + React)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'frontend',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/vite-env.d.ts',
  ],
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

#### jest.config.js (Backend - Express + TypeScript)

```javascript
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'backend',
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
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

### Step 3: Create Setup Files

#### jest.setup.ts (Frontend)

```typescript
import '@testing-library/jest-dom';

// Global test setup
beforeAll(() => {
  // Setup before all tests
});

afterAll(() => {
  // Cleanup after all tests
});
```

#### **mocks**/fileMock.js

```javascript
module.exports = 'test-file-stub';
```

### Step 4: Add npm Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Step 5: Update TypeScript Config

```json
{
  "compilerOptions": {
    "types": ["jest", "@testing-library/jest-dom"]
  }
}
```

---

## ts-jest (TypeScript + Jest MVP)

`ts-jest` lets Jest run our TypeScript tests directly without a manual build step.

**Official Documentation**: https://kulshekhar.github.io/ts-jest/

### Why We Use It Here

- Both frontend and backend tests are written in TypeScript.
- `ts-jest` integrates Jest with our existing `tsconfig.json` files, so tests and source share the same type settings.
- Avoids a separate `tsc` compilation phase just to run tests.

### Where It’s Configured

- Frontend: [frontend/jest.config.js](../../../frontend/jest.config.js)
  - Uses a `transform` entry to compile `.ts`/`.tsx` test files with `ts-jest`.
- Backend: [backend/jest.config.js](../../../backend/jest.config.js)
  - Uses `preset: 'ts-jest'` for a simple Node + TypeScript setup.

### How We Use It (MVP)

- Write tests as `.test.ts` / `.test.tsx` under `src/__tests__/`.
- Keep strict TypeScript settings in each project’s `tsconfig.json`.
- Run tests with:
  - `npm test --prefix frontend`
  - `npm test --prefix backend`

As we grow the suite we can document any custom `ts-jest` options we enable (e.g. `isolatedModules`, diagnostics config, or separate test tsconfig files).

---

## Common Testing Patterns

### Testing API Endpoints

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

### Testing Forms

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

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

### Testing Hooks

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

---

## Integration with Tools

### ESLint Integration

```javascript
// eslint.config.mjs
import jest from 'eslint-plugin-jest';

export default [
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    plugins: { jest },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error',
    },
  },
];
```

### VS Code Integration

```json
{
  "jest.autoRun": "off",
  "jest.showCoverageOnLoad": false,
  "jest.enableCodeLens": true
}
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

---

## Troubleshooting

### Common Issues

#### 1. SyntaxError: Cannot use import statement outside a module

**Solution**: Configure transform in jest.config.js

```javascript
module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
```

#### 2. Module not found errors

**Solution**: Configure moduleNameMapper

```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

#### 3. Tests timing out

**Solution**: Increase timeout

```typescript
it('slow test', async () => {
  // ...
}, 10000); // 10 seconds

// Or globally in jest.config.js
module.exports = {
  testTimeout: 10000,
};
```

#### 4. Memory leaks in watch mode

**Solution**: Use --maxWorkers flag

```bash
npm test -- --watch --maxWorkers=1
```

### Debug Mode

```bash
# Node.js debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal"
}
```

---

## Migration from Other Frameworks

### From Mocha/Chai

- Replace `describe.only` → `describe.only` (same)
- Replace `it.skip` → `it.skip` (same)
- Replace `chai.expect` → `expect` (built-in)
- Replace `sinon` → `jest.fn()`, `jest.mock()`

### From Jasmine

- Most APIs are compatible
- Replace `spyOn` → `jest.spyOn`
- Replace `jasmine.createSpy` → `jest.fn()`

---

## Resources

### Official Documentation

- Getting Started: https://jestjs.io/docs/getting-started
- Configuration: https://jestjs.io/docs/configuration
- API Reference: https://jestjs.io/docs/api
- CLI Options: https://jestjs.io/docs/cli

### Testing Library

- React Testing Library: https://testing-library.com/react
- User Event: https://testing-library.com/docs/user-event/intro
- Jest DOM: https://github.com/testing-library/jest-dom

### TypeScript

- ts-jest: https://kulshekhar.github.io/ts-jest/
- Type Definitions: https://www.npmjs.com/package/@types/jest

### Best Practices

- Kent C. Dodds Testing: https://kentcdodds.com/testing
- React Testing Best Practices: https://github.com/goldbergyoni/javascript-testing-best-practices

---

## Summary

Jest is the industry-standard testing framework for JavaScript/TypeScript projects. Key takeaways:

1. **Zero Configuration**: Works out of the box for most projects
2. **Fast & Isolated**: Parallel test execution with isolated environments
3. **Rich API**: Built-in mocking, snapshots, coverage, and assertions
4. **TypeScript Support**: Excellent via ts-jest or Babel
5. **React Integration**: First-class support with Testing Library
6. **Enterprise Ready**: Coverage thresholds, CI/CD integration, monorepo support

For most projects, use:

- **ts-jest** for Node.js/backend projects
- **babel-jest** for React/frontend projects
- **Testing Library** for React component testing
- **Coverage thresholds** to maintain code quality

Next steps:

1. Install Jest and dependencies
2. Create jest.config.js for frontend/backend
3. Write first test file
4. Run `npm test` and see results
5. Add to CI/CD pipeline
