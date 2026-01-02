# Development Guide

Comprehensive guidelines and best practices for developing in this TypeScript monorepo.

---

## Table of Contents

- [Core Principles](#core-principles)
- [SOLID Principles](#solid-principles)
- [DRY & KISS](#dry--kiss)
- [TypeScript Best Practices](#typescript-best-practices)
- [React Best Practices](#react-best-practices)
- [Design Patterns](#design-patterns)
- [Code Quality](#code-quality)
- [Testing Guidelines](#testing-guidelines)
- [Git Workflow](#git-workflow)
- [Current Codebase Stack](#current-codebase-stack)

---

## Core Principles

### Development Philosophy

All code in this codebase must adhere to:

1. **SOLID Principles** - Object-oriented design fundamentals
2. **DRY** (Don't Repeat Yourself) - Avoid code duplication
3. **KISS** (Keep It Simple, Stupid) - Prefer simplicity over complexity
4. **Automation First** - Script complex operations for deterministic workflows
5. **Enterprise TypeScript** - Type-safe, maintainable, scalable code
6. **Enterprise React** - Component-driven, performant UI architecture
7. **Gang of Four Design Patterns** - Proven solutions to common problems

### Automation First Principle

**Core Tenet**: If a task requires more than 3 manual commands or complex conditional logic, create a script.

#### Benefits

- **Deterministic**: Same result every time, regardless of who runs it
- **Documented**: Scripts are living documentation
- **Testable**: Scripts can be tested in CI/CD
- **Onboarding**: New developers run scripts, not multi-step instructions
- **Error Prevention**: Validation and error handling built-in

#### When to Automate

✅ **Always Script**:

- Database setup and migrations
- Build processes with multiple steps
- Deployment workflows
- Environment setup
- Test data seeding
- Backup and restore operations

❌ **Don't Script** (unless frequent):

- Simple one-line commands (`npm install`)
- IDE-specific actions
- One-time exploratory tasks

#### Script Standards

```powershell
# ✅ Good - Complete automation script
<#
.SYNOPSIS
    Initialize database with Prisma
.DESCRIPTION
    Sets up Prisma, generates client, creates database, and runs migrations
.PARAMETER Environment
    Target environment (development, staging, production)
.PARAMETER Reset
    Reset existing database before initialization
.EXAMPLE
    .\db-init.ps1
    .\db-init.ps1 -Environment production
    .\db-init.ps1 -Reset
#>
param(
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',
    [switch]$Reset
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Database Initialization - $Environment" -ForegroundColor Cyan

try {
    # Validation
    if (-not (Test-Path "backend/package.json")) {
        throw "backend/package.json not found. Run from repository root."
    }

    Set-Location backend

    # Install dependencies
    Write-Host "📦 Installing Prisma..." -ForegroundColor Yellow
    npm install --save-dev prisma @prisma/client

    # Reset if requested
    if ($Reset -and (Test-Path "prisma/dev.db")) {
        Write-Host "🗑️  Removing existing database..." -ForegroundColor Yellow
        Remove-Item "prisma/dev.db" -Force
    }

    # Generate client
    Write-Host "⚙️  Generating Prisma Client..." -ForegroundColor Yellow
    npx prisma generate

    # Run migrations
    Write-Host "🔄 Running migrations..." -ForegroundColor Yellow
    if ($Environment -eq 'production') {
        npx prisma migrate deploy
    } else {
        npx prisma db push
    }

    Write-Host "✅ Database initialized successfully!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location ..
}
```

#### Integration with npm Scripts

```json
{
  "scripts": {
    "db:init": "pwsh -File scripts/db-init.ps1",
    "db:migrate": "pwsh -File scripts/db-migrate.ps1",
    "db:reset": "pwsh -File scripts/db-reset.ps1",
    "db:seed": "pwsh -File scripts/db-seed.ps1",
    "db:studio": "pwsh -File scripts/db-studio.ps1"
  }
}
```

**Usage**:

```bash
npm run db:init      # First-time setup
npm run db:reset     # Clean slate
npm run db:seed      # Add test data
```

### Code Quality Standards

- ✅ **Type-safe**: TypeScript strict mode enabled
- ✅ **Linted**: ESLint strict + stylistic rules
- ✅ **Formatted**: Prettier with consistent style
- ✅ **Tested**: Jest unit tests with 70%+ coverage
- ✅ **Documented**: Clear comments and documentation
- ✅ **Validated**: Pre-commit hooks enforce quality

## Current Codebase Stack

This section describes how this repository is structured today. For a more detailed breakdown of folders and files, see [knowledge-base/codebase/structure.md](structure.md).

### Monorepo Overview

- Root workspace hosting both backend and frontend projects.
- Shared tooling at the root: TypeScript, ESLint (flat config with typescript-eslint), Prettier, Jest, Husky, lint-staged, PM2.
- All code is written in TypeScript and uses strict compiler settings.

Key root scripts (see [package.json](../../package.json)):

- `npm run dev` – Run frontend (Vite) and backend (Express) together for local development.
- `npm run build` – Build both projects (frontend `dist/`, backend `dist/`).
- `npm run typecheck` – Run `tsc --noEmit` for frontend and backend.
- `npm run lint` / `npm run lint:fix` – Run ESLint (and auto-fix).
- `npm run format` / `npm run format:check` – Run Prettier.
- `npm run validate` – Combined typecheck + lint + format; used before commits/CI.

### Backend (Express + TypeScript)

Location: [backend/](../../backend)

- Framework: Express 4.x with TypeScript (strict mode enabled via [backend/tsconfig.json](../../backend/tsconfig.json)).
- Entry point: [backend/src/server.ts](../../backend/src/server.ts) creates the Express app, configures middleware, and starts the HTTP server.
- Core responsibilities:
  - `GET /health` – Health check endpoint used by the frontend dashboard and external monitoring.
  - `GET /api/metrics` – Returns basic server metrics (uptime, memory, response timing) from [backend/src/utils/metrics.ts](../../backend/src/utils/metrics.ts).
  - Dev-only CORS support (via `cors`) to allow the Vite dev server to talk to the backend.
  - In production, serves the built frontend assets from the `frontend/dist` snapshot (see [deploy/](../../deploy)).
- Development workflow:
  - `npm run dev --prefix backend` – Start the backend in watch mode using `ts-node-dev`.
  - Type-checking and linting are run via root scripts (`typecheck`, `lint`).
- Testing:
  - Jest + ts-jest with Node test environment ([backend/jest.config.js](../../backend/jest.config.js)).
  - HTTP endpoint tests using Supertest in [backend/src/**tests**/server.test.ts](../../backend/src/__tests__/server.test.ts).
  - Utility tests (e.g., metrics) in [backend/src/**tests**/metrics.test.ts](../../backend/src/__tests__/metrics.test.ts).

### Frontend (Vite + React + TypeScript)

Location: [frontend/](../../frontend)

- Tooling: Vite 5.x with React plugin and TypeScript in strict mode ([frontend/tsconfig.json](../../frontend/tsconfig.json)).
- Entry point: [frontend/src/main.tsx](../../frontend/src/main.tsx) mounts the React app into `index.html` and imports global styles from [frontend/src/styles.css](../../frontend/src/styles.css).
- App shell: [frontend/src/app/App.tsx](../../frontend/src/app/App.tsx) defines the top-level layout (header, main content, footer) and composes feature modules.
- Feature structure (DDD-inspired):
  - `frontend/src/app/` – Application shell and high-level layout.
  - `frontend/src/features/` – Vertical slices; currently `dashboard/` for the monitoring UI.
  - `frontend/src/shared/` – Cross-cutting utilities such as the `DEBUGGER` helper.
  - `frontend/src/utils/` – Generic utilities (e.g., formatting helpers).
- Dashboard feature:
  - [frontend/src/features/dashboard/Dashboard.tsx](../../frontend/src/features/dashboard/Dashboard.tsx) renders three cards (Health, Dashboard Metrics, Environment Info) and triggers data loading on mount.
  - [frontend/src/features/dashboard/dashboard-api.ts](../../frontend/src/features/dashboard/dashboard-api.ts) calls the backend (`/health`, `/api/metrics`) using the browser `fetch` API and updates the dashboard DOM containers.
  - A shared `DEBUGGER` object in [frontend/src/shared/debugger.ts](../../frontend/src/shared/debugger.ts) provides env-gated logging and is exposed on `window.ZACH_DEBUGGER` for interactive debugging.
- Styling:
  - Global styles live in [frontend/src/styles.css](../../frontend/src/styles.css) for base layout and utility classes.
  - CSS Modules are used for feature and app-level components: [App.module.css](../../frontend/src/app/App.module.css) and [Dashboard.module.css](../../frontend/src/features/dashboard/Dashboard.module.css).

### Testing Strategy (Current)

- Each project (frontend and backend) has its own Jest configuration.
- Frontend:
  - Jest with jsdom environment ([frontend/jest.config.js](../../frontend/jest.config.js)).
  - React Testing Library + jest-dom + user-event configured via [frontend/jest.setup.ts](../../frontend/jest.setup.ts).
  - Example component tests in [frontend/src/**tests**/App.test.tsx](../../frontend/src/__tests__/App.test.tsx) and utility tests in [frontend/src/**tests**/formatters.test.ts](../../frontend/src/__tests__/formatters.test.ts).
- Backend:
  - Jest with Node environment and ts-jest preset ([backend/jest.config.js](../../backend/jest.config.js)).
  - Supertest for HTTP endpoint tests (see `server.test.ts`).
- Minimum coverage target: 70%+ for both projects, enforced via Jest config and CI where applicable.

---

## SOLID Principles

### Single Responsibility Principle (SRP)

**Definition**: A class/module should have only one reason to change.

#### ✅ Good Example

```typescript
// metrics.service.ts - Handles only metrics calculation
export class MetricsService {
  calculateUptime(startTime: number): number {
    return Date.now() - startTime;
  }

  calculateAverageResponseTime(times: number[]): number {
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}

// metrics.formatter.ts - Handles only formatting
export class MetricsFormatter {
  formatUptime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    return `${hours}h`;
  }

  formatResponseTime(ms: number): string {
    return `${ms.toFixed(2)}ms`;
  }
}
```

#### ❌ Bad Example

```typescript
// metrics.ts - Too many responsibilities
export class Metrics {
  calculateUptime(startTime: number): number {
    /* ... */
  }
  formatUptime(ms: number): string {
    /* ... */
  }
  saveToDatabase(data: any): void {
    /* ... */
  }
  sendToAPI(data: any): void {
    /* ... */
  }
  logMetrics(data: any): void {
    /* ... */
  }
}
```

### Open/Closed Principle (OCP)

**Definition**: Open for extension, closed for modification.

#### ✅ Good Example

```typescript
// logger.interface.ts
export interface ILogger {
  log(message: string): void;
}

// console.logger.ts
export class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(message);
  }
}

// file.logger.ts
export class FileLogger implements ILogger {
  log(message: string): void {
    // Write to file
  }
}

// Usage - extend without modifying existing code
const logger: ILogger =
  process.env.NODE_ENV === 'production' ? new FileLogger() : new ConsoleLogger();
```

### Liskov Substitution Principle (LSP)

**Definition**: Derived classes must be substitutable for their base classes.

#### ✅ Good Example

```typescript
abstract class HttpClient {
  abstract get(url: string): Promise<Response>;
}

class FetchClient extends HttpClient {
  async get(url: string): Promise<Response> {
    return fetch(url);
  }
}

class AxiosClient extends HttpClient {
  async get(url: string): Promise<Response> {
    const response = await axios.get(url);
    return new Response(JSON.stringify(response.data));
  }
}

// Both can be used interchangeably
function fetchData(client: HttpClient) {
  return client.get('/api/data');
}
```

### Interface Segregation Principle (ISP)

**Definition**: Clients shouldn't depend on interfaces they don't use.

#### ✅ Good Example

```typescript
// Small, focused interfaces
interface IReadable {
  read(id: string): Promise<Data>;
}

interface IWritable {
  write(data: Data): Promise<void>;
}

interface IDeletable {
  delete(id: string): Promise<void>;
}

// Implement only what you need
class ReadOnlyRepository implements IReadable {
  async read(id: string): Promise<Data> {
    /* ... */
  }
}

class FullRepository implements IReadable, IWritable, IDeletable {
  async read(id: string): Promise<Data> {
    /* ... */
  }
  async write(data: Data): Promise<void> {
    /* ... */
  }
  async delete(id: string): Promise<void> {
    /* ... */
  }
}
```

#### ❌ Bad Example

```typescript
// Fat interface forces unnecessary implementations
interface IRepository {
  read(id: string): Promise<Data>;
  write(data: Data): Promise<void>;
  delete(id: string): Promise<void>;
  backup(): Promise<void>;
  restore(): Promise<void>;
}

// ReadOnlyRepository forced to implement methods it doesn't need
class ReadOnlyRepository implements IRepository {
  async read(id: string): Promise<Data> {
    /* ... */
  }
  async write(data: Data): Promise<void> {
    throw new Error('Not supported');
  }
  async delete(id: string): Promise<void> {
    throw new Error('Not supported');
  }
  async backup(): Promise<void> {
    throw new Error('Not supported');
  }
  async restore(): Promise<void> {
    throw new Error('Not supported');
  }
}
```

### Dependency Inversion Principle (DIP)

**Definition**: Depend on abstractions, not concretions.

#### ✅ Good Example

```typescript
// Abstraction
interface IDatabase {
  query(sql: string): Promise<any[]>;
}

// High-level module depends on abstraction
class UserService {
  constructor(private db: IDatabase) {}

  async getUser(id: string): Promise<User> {
    const rows = await this.db.query(`SELECT * FROM users WHERE id = ${id}`);
    return rows[0];
  }
}

// Low-level modules implement abstraction
class PostgresDatabase implements IDatabase {
  async query(sql: string): Promise<any[]> {
    /* ... */
  }
}

class MongoDatabase implements IDatabase {
  async query(sql: string): Promise<any[]> {
    /* ... */
  }
}

// Inject dependency
const db = new PostgresDatabase();
const userService = new UserService(db);
```

---

## DRY & KISS

### DRY (Don't Repeat Yourself)

**Principle**: Every piece of knowledge must have a single, unambiguous representation.

#### ✅ Good Example

```typescript
// utils/validators.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Multiple places use the same function
import { isValidEmail } from './utils/validators';

function validateUser(email: string) {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email');
  }
}

function sendEmail(email: string) {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email');
  }
}
```

#### ❌ Bad Example

```typescript
// Duplicated validation logic
function validateUser(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email');
  }
}

function sendEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email');
  }
}
```

#### When to Repeat

Not all duplication is bad. Consider:

- **Accidental Duplication**: Code that looks similar but serves different purposes
- **Coupling Risk**: Shared code that might diverge in the future
- **Domain Boundaries**: Different domains may have similar concepts but different rules

```typescript
// Both format time, but for different purposes
// Keep separate to allow independent evolution
function formatServerUptime(ms: number): string {
  return `${Math.floor(ms / 3600000)}h`;
}

function formatUserSessionDuration(ms: number): string {
  return `${Math.floor(ms / 60000)}m`;
}
```

### KISS (Keep It Simple, Stupid)

**Principle**: Simplicity should be a key goal; unnecessary complexity should be avoided.

#### ✅ Good Example

```typescript
// Simple, clear, easy to understand
function isAdult(age: number): boolean {
  return age >= 18;
}

function getUserFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}
```

#### ❌ Bad Example

```typescript
// Over-engineered, unnecessary abstraction
abstract class AgeValidator {
  abstract validate(age: number): boolean;
}

class AdultAgeValidator extends AgeValidator {
  private readonly MINIMUM_AGE = 18;

  validate(age: number): boolean {
    return this.performValidation(age);
  }

  private performValidation(age: number): boolean {
    return this.compareAge(age, this.MINIMUM_AGE);
  }

  private compareAge(age: number, threshold: number): boolean {
    return age >= threshold;
  }
}

const validator = new AdultAgeValidator();
const isAdult = validator.validate(age);
```

#### Complexity Guidelines

**Add complexity only when:**

- Performance requires it
- Scalability demands it
- Multiple teams need coordination
- Future requirements are certain

**Prefer simplicity for:**

- Single-use functions
- Clear, straightforward logic
- Early-stage features
- Utilities and helpers

---

## TypeScript Best Practices

### Type Safety

#### Always Use Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

#### Prefer Interfaces Over Types for Objects

```typescript
// ✅ Good - Use interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good - Use type for unions, intersections, primitives
type UserId = string;
type Status = 'active' | 'inactive' | 'pending';
type UserWithTimestamps = User & { createdAt: Date; updatedAt: Date };
```

#### Avoid `any` - Use `unknown` Instead

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value; // No type checking
}

// ✅ Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

#### Use Discriminated Unions

```typescript
// ✅ Good - Type-safe state management
type LoadingState = { status: 'loading' };
type SuccessState = { status: 'success'; data: User };
type ErrorState = { status: 'error'; error: string };
type State = LoadingState | SuccessState | ErrorState;

function handleState(state: State) {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data.name; // TypeScript knows data exists
    case 'error':
      return state.error; // TypeScript knows error exists
  }
}
```

#### Use Readonly for Immutability

```typescript
// ✅ Good
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

function getConfig(): Readonly<Config> {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
  };
}

const config = getConfig();
// config.apiUrl = 'new'; // Error: Cannot assign to 'apiUrl'
```

### Type Utilities

```typescript
// Use built-in utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserWithoutEmail = Omit<User, 'email'>;
type UserIdAndName = Pick<User, 'id' | 'name'>;
type UserRecord = Record<string, User>;

// Create custom utility types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

### Generics

```typescript
// ✅ Good - Type-safe generic functions
function identity<T>(value: T): T {
  return value;
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// ✅ Good - Generic constraints
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}
```

### Function Overloads

```typescript
// ✅ Good - Clear overload signatures
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: boolean): string;
function formatValue(value: string | number | boolean): string {
  if (typeof value === 'string') return value.toUpperCase();
  if (typeof value === 'number') return value.toFixed(2);
  return value ? 'Yes' : 'No';
}
```

---

## React Best Practices

### Frontend Structure (DDD-Oriented)

The frontend follows a lightweight, DDD-inspired layout:

- `src/app/` – Application shell (root `App`, layout, routing, top-level providers)
- `src/features/` – Vertical feature slices (bounded contexts)
  - Example: `src/features/dashboard/` contains the monitoring dashboard UI and integration code
- `src/shared/` – Cross-cutting UI and utilities (reusable components, hooks, helpers)

Guidelines:

- New UI capabilities should be added under a feature folder (not directly under `src/`).
- The app layer composes features but does not contain feature-specific business logic.
- Shared code must be generic and reusable across multiple features.

### Component Structure

#### Functional Components with TypeScript

```typescript
// ✅ Good - Clear, type-safe component
import { FC, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

### Hooks Best Practices

#### Custom Hooks

```typescript
// ✅ Good - Reusable, testable hook
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch(url);
        const json = await response.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
```

#### Memoization

```typescript
import { useMemo, useCallback } from 'react';

// ✅ Good - Memoize expensive computations
function UserList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  const handleUserClick = useCallback((id: string) => {
    console.log('User clicked:', id);
  }, []);

  return (
    <ul>
      {sortedUsers.map((user) => (
        <li key={user.id} onClick={() => handleUserClick(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

### Component Composition

```typescript
// ✅ Good - Compose small, focused components
interface CardProps {
  children: ReactNode;
}

export const Card: FC<CardProps> = ({ children }) => (
  <div className="card">{children}</div>
);

export const CardHeader: FC<CardProps> = ({ children }) => (
  <div className="card-header">{children}</div>
);

export const CardBody: FC<CardProps> = ({ children }) => (
  <div className="card-body">{children}</div>
);

// Usage
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
</Card>
```

### State Management

```typescript
// ✅ Good - UseReducer for complex state
import { useReducer } from 'react';

type State = {
  count: number;
  step: number;
};

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; step: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.step };
    case 'reset':
      return { count: 0, step: 1 };
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  );
}
```

---

## Design Patterns

### Creational Patterns

#### Singleton Pattern

```typescript
// ✅ Good - Thread-safe singleton
export class ConfigService {
  private static instance: ConfigService;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): Config {
    return {
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      timeout: 5000,
    };
  }

  public getConfig(): Config {
    return { ...this.config };
  }
}

// Usage
const config = ConfigService.getInstance().getConfig();
```

#### Factory Pattern

```typescript
// ✅ Good - Factory for creating related objects
interface INotification {
  send(message: string): void;
}

class EmailNotification implements INotification {
  send(message: string): void {
    console.log(`Email: ${message}`);
  }
}

class SMSNotification implements INotification {
  send(message: string): void {
    console.log(`SMS: ${message}`);
  }
}

class PushNotification implements INotification {
  send(message: string): void {
    console.log(`Push: ${message}`);
  }
}

class NotificationFactory {
  static create(type: 'email' | 'sms' | 'push'): INotification {
    switch (type) {
      case 'email':
        return new EmailNotification();
      case 'sms':
        return new SMSNotification();
      case 'push':
        return new PushNotification();
    }
  }
}

// Usage
const notification = NotificationFactory.create('email');
notification.send('Hello!');
```

#### Builder Pattern

```typescript
// ✅ Good - Builder for complex object construction
interface HttpRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

class HttpRequestBuilder {
  private request: Partial<HttpRequest> = {
    method: 'GET',
    headers: {},
  };

  setUrl(url: string): this {
    this.request.url = url;
    return this;
  }

  setMethod(method: string): this {
    this.request.method = method;
    return this;
  }

  addHeader(key: string, value: string): this {
    this.request.headers![key] = value;
    return this;
  }

  setBody(body: string): this {
    this.request.body = body;
    return this;
  }

  build(): HttpRequest {
    if (!this.request.url) {
      throw new Error('URL is required');
    }
    return this.request as HttpRequest;
  }
}

// Usage
const request = new HttpRequestBuilder()
  .setUrl('https://api.example.com/users')
  .setMethod('POST')
  .addHeader('Content-Type', 'application/json')
  .setBody(JSON.stringify({ name: 'John' }))
  .build();
```

### Structural Patterns

#### Adapter Pattern

```typescript
// ✅ Good - Adapt third-party library interface
interface IHttpClient {
  get(url: string): Promise<any>;
  post(url: string, data: any): Promise<any>;
}

class AxiosAdapter implements IHttpClient {
  constructor(private axios: any) {}

  async get(url: string): Promise<any> {
    const response = await this.axios.get(url);
    return response.data;
  }

  async post(url: string, data: any): Promise<any> {
    const response = await this.axios.post(url, data);
    return response.data;
  }
}

class FetchAdapter implements IHttpClient {
  async get(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }

  async post(url: string, data: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

#### Decorator Pattern

```typescript
// ✅ Good - Add functionality without modifying original
interface IDataSource {
  read(): string;
  write(data: string): void;
}

class FileDataSource implements IDataSource {
  constructor(private filename: string) {}

  read(): string {
    return `Reading from ${this.filename}`;
  }

  write(data: string): void {
    console.log(`Writing to ${this.filename}: ${data}`);
  }
}

abstract class DataSourceDecorator implements IDataSource {
  constructor(protected source: IDataSource) {}

  read(): string {
    return this.source.read();
  }

  write(data: string): void {
    this.source.write(data);
  }
}

class EncryptionDecorator extends DataSourceDecorator {
  read(): string {
    const data = super.read();
    return this.decrypt(data);
  }

  write(data: string): void {
    const encrypted = this.encrypt(data);
    super.write(encrypted);
  }

  private encrypt(data: string): string {
    return Buffer.from(data).toString('base64');
  }

  private decrypt(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
}

// Usage
let source: IDataSource = new FileDataSource('data.txt');
source = new EncryptionDecorator(source);
source.write('sensitive data');
```

### Behavioral Patterns

#### Strategy Pattern

```typescript
// ✅ Good - Interchangeable algorithms
interface ISortStrategy {
  sort(data: number[]): number[];
}

class BubbleSortStrategy implements ISortStrategy {
  sort(data: number[]): number[] {
    // Bubble sort implementation
    return data.sort((a, b) => a - b);
  }
}

class QuickSortStrategy implements ISortStrategy {
  sort(data: number[]): number[] {
    // Quick sort implementation
    return data.sort((a, b) => a - b);
  }
}

class Sorter {
  constructor(private strategy: ISortStrategy) {}

  setStrategy(strategy: ISortStrategy): void {
    this.strategy = strategy;
  }

  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}

// Usage
const sorter = new Sorter(new BubbleSortStrategy());
const sorted = sorter.sort([3, 1, 4, 1, 5, 9]);
```

#### Observer Pattern

```typescript
// ✅ Good - Event-driven architecture
interface IObserver {
  update(data: any): void;
}

interface ISubject {
  attach(observer: IObserver): void;
  detach(observer: IObserver): void;
  notify(data: any): void;
}

class EventManager implements ISubject {
  private observers: IObserver[] = [];

  attach(observer: IObserver): void {
    this.observers.push(observer);
  }

  detach(observer: IObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: any): void {
    for (const observer of this.observers) {
      observer.update(data);
    }
  }
}

class Logger implements IObserver {
  update(data: any): void {
    console.log('Logger:', data);
  }
}

class EmailSender implements IObserver {
  update(data: any): void {
    console.log('Email sent:', data);
  }
}

// Usage
const manager = new EventManager();
manager.attach(new Logger());
manager.attach(new EmailSender());
manager.notify({ event: 'user_registered' });
```

#### Repository Pattern

```typescript
// ✅ Good - Database abstraction with interface
// Domain layer - DB-agnostic interface
interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// Domain model - Pure TypeScript
class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: Date
  ) {}
}

// Infrastructure layer - Prisma implementation
class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDto): Promise<User> {
    const prismaUser = await this.prisma.user.create({ data });
    return this.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.toDomain(u));
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // Mapper: Prisma model → Domain model
  private toDomain(prismaUser: any): User {
    return new User(prismaUser.id, prismaUser.name, prismaUser.email, prismaUser.createdAt);
  }
}

// Service layer - Uses interface only
class UserService {
  constructor(private userRepo: IUserRepository) {}

  async registerUser(name: string, email: string): Promise<User> {
    // Business logic here
    return this.userRepo.create({ name, email });
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}

// Dependency injection
const prisma = new PrismaClient();
const userRepo = new PrismaUserRepository(prisma);
const userService = new UserService(userRepo);

// Can easily swap implementations
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async create(data: CreateUserDto): Promise<User> {
    const user = new User(Math.random().toString(), data.name, data.email, new Date());
    this.users.push(user);
    return user;
  }

  // ... other methods
}

// Testing with mock
const mockRepo = new MockUserRepository();
const testService = new UserService(mockRepo);
```

**Benefits**:

- Database implementation can be swapped without changing business logic
- Easy to test with mock repositories
- Clear separation between domain and infrastructure
- Supports multiple database providers simultaneously

---

## Layered Architecture & Modularity

### Architecture Overview

This codebase follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│   Presentation Layer (API/UI)      │  ← HTTP endpoints, React components
├─────────────────────────────────────┤
│   Application Layer (Services)     │  ← Business logic, orchestration
├─────────────────────────────────────┤
│   Domain Layer (Models)            │  ← Core business entities, interfaces
├─────────────────────────────────────┤
│   Infrastructure Layer             │  ← Database, external APIs, file system
└─────────────────────────────────────┘
```

### Directory Structure

```
backend/src/
├── domain/                    # Core business logic (DB-agnostic)
│   ├── models/               # Domain entities (User, Thought, Project)
│   ├── repositories/         # Repository interfaces
│   └── types/                # Shared types and DTOs
├── application/              # Business logic orchestration
│   └── services/             # Application services
├── infrastructure/           # External dependencies
│   ├── prisma/              # Database implementation
│   │   ├── repositories/    # Prisma repository implementations
│   │   ├── schema.prisma    # Prisma schema
│   │   └── client.ts        # Prisma Client singleton
│   └── external/            # Third-party API clients
├── api/                      # HTTP layer
│   ├── routes/              # Express routes
│   ├── controllers/         # Request handlers
│   └── middleware/          # Express middleware
└── shared/                   # Cross-cutting concerns
    ├── utils/               # Utility functions
    └── errors/              # Custom error classes
```

### Layer Responsibilities

#### Domain Layer

**Purpose**: Define core business entities and contracts

**Rules**:

- ✅ Pure TypeScript (no framework dependencies)
- ✅ No imports from infrastructure, application, or API layers
- ✅ Contains interfaces for repositories
- ❌ No database-specific types (e.g., Prisma types)
- ❌ No HTTP-specific code

```typescript
// domain/models/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {}
}

// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  create(data: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
}
```

#### Application Layer (Services)

**Purpose**: Implement business logic and orchestrate domain operations

**Rules**:

- ✅ Depends on domain layer (models and interfaces)
- ✅ Uses repository interfaces, not implementations
- ❌ No direct database access
- ❌ No HTTP-specific code (req/res objects)

```typescript
// application/services/UserService.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/models/User';

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async registerUser(name: string, email: string): Promise<User> {
    // Business logic validation
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }

    return this.userRepo.create({ name, email });
  }
}
```

#### Infrastructure Layer

**Purpose**: Implement technical details (database, APIs, file system)

**Rules**:

- ✅ Implements domain interfaces
- ✅ Contains framework-specific code (Prisma, Axios, etc.)
- ✅ Maps between domain models and persistence models
- ❌ No business logic

```typescript
// infrastructure/prisma/repositories/PrismaUserRepository.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
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

  private toDomain(prismaUser: any): User {
    return new User(prismaUser.id, prismaUser.name, prismaUser.email);
  }
}
```

#### API Layer

**Purpose**: Handle HTTP requests and responses

**Rules**:

- ✅ Depends on application services
- ✅ Handles request validation and serialization
- ❌ No business logic
- ❌ No direct repository access

```typescript
// api/routes/users.routes.ts
import { Router } from 'express';
import { UserService } from '../../application/services/UserService';

export function createUserRoutes(userService: UserService): Router {
  const router = Router();

  router.post('/users', async (req, res) => {
    try {
      const user = await userService.registerUser(req.body.name, req.body.email);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
```

### Dependency Flow

**Always flows inward** (outer layers depend on inner layers):

```
API Layer → Application Layer → Domain Layer ← Infrastructure Layer
```

**Key principle**: Inner layers never import from outer layers.

### Testing Strategy by Layer

#### Domain Layer Tests

```typescript
// Pure unit tests - no mocks needed
describe('User', () => {
  it('should create user with valid data', () => {
    const user = new User('1', 'John', 'john@example.com');
    expect(user.name).toBe('John');
  });
});
```

#### Application Layer Tests

```typescript
// Unit tests with mocked repositories
describe('UserService', () => {
  it('should register user', async () => {
    const mockRepo: IUserRepository = {
      create: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn(),
    };

    const service = new UserService(mockRepo);
    const user = await service.registerUser('John', 'john@example.com');

    expect(mockRepo.create).toHaveBeenCalled();
    expect(user.name).toBe('John');
  });
});
```

#### Infrastructure Layer Tests

```typescript
// Integration tests with real database (in-memory)
describe('PrismaUserRepository', () => {
  let prisma: PrismaClient;
  let repo: IUserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasource: { url: 'file::memory:' } });
    repo = new PrismaUserRepository(prisma);
  });

  it('should create user', async () => {
    const user = await repo.create({ name: 'John', email: 'john@example.com' });
    expect(user.id).toBeDefined();
  });
});
```

#### API Layer Tests

```typescript
// E2E tests with Supertest
describe('POST /users', () => {
  it('should create user', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'John', email: 'john@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John');
  });
});
```

### Modularity Benefits

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear boundaries reduce cognitive load
3. **Flexibility**: Swap implementations without touching business logic
4. **Scalability**: Easy to add new features without breaking existing code
5. **Team Collaboration**: Teams can work on different layers simultaneously

### Anti-Patterns to Avoid

#### ❌ Tight Coupling to Database

```typescript
// BAD: Service directly uses Prisma
class UserService {
  constructor(private prisma: PrismaClient) {}

  async getUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

#### ❌ Business Logic in Controllers

```typescript
// BAD: Business logic in API layer
router.post('/users', async (req, res) => {
  if (!req.body.email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
});
```

#### ❌ Domain Models with Framework Dependencies

```typescript
// BAD: Prisma decorators in domain model
import { Prisma } from '@prisma/client';

class User {
  @Prisma.Field()
  name: string;
}
```

### Migration Path Example

**Scenario**: Migrate from SQLite (Prisma) to MongoDB (Mongoose)

**Steps**:

1. Create new repository implementation

```typescript
// infrastructure/mongoose/repositories/MongoUserRepository.ts
export class MongoUserRepository implements IUserRepository {
  // Implement interface using Mongoose
}
```

2. Update dependency injection

```typescript
// Before
const userRepo = new PrismaUserRepository(prisma);

// After
const userRepo = new MongoUserRepository(mongoose);
```

3. **No changes needed in**:
   - Domain models
   - Application services
   - API routes
   - Tests (business logic)

4. Update infrastructure tests only

```typescript
// New integration tests for Mongoose implementation
describe('MongoUserRepository', () => {
  // Test MongoDB-specific behavior
});
```

---

## Code Quality

### Pre-commit Validation

All code must pass validation before commit:

```bash
npm run validate
```

This runs:

1. **TypeScript**: Type checking with `tsc --noEmit`
2. **ESLint**: Linting with auto-fix
3. **Prettier**: Code formatting
4. **Jest**: Unit tests (run manually)

### Code Review Checklist

#### Before Submitting PR

- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets threshold (70%+)
- [ ] TypeScript has no errors
- [ ] ESLint has no warnings
- [ ] Code is formatted with Prettier
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Functions are small (<50 lines)
- [ ] Classes follow SRP
- [ ] No magic numbers (use constants)
- [ ] Error handling is comprehensive
- [ ] Documentation is updated

#### Code Review Standards

**Must Have:**

- Clear variable/function names
- Type annotations on function parameters
- JSDoc comments for public APIs
- Unit tests for business logic
- Error handling with proper types

**Should Have:**

- Inline comments for complex logic
- Examples in documentation
- Integration tests for APIs
- Performance considerations documented

**Nice to Have:**

- Architectural diagrams
- Usage examples
- Migration guides
- Performance benchmarks

---

## Testing Guidelines

### Test Structure

```typescript
// ✅ Good - AAA pattern (Arrange, Act, Assert)
import { describe, it, expect } from '@jest/globals';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };
      const service = new UserService();

      // Act
      const user = service.createUser(userData);

      // Assert
      expect(user).toHaveProperty('id');
      expect(user.name).toBe('John');
      expect(user.email).toBe('john@example.com');
    });

    it('should throw error with invalid email', () => {
      // Arrange
      const userData = { name: 'John', email: 'invalid' };
      const service = new UserService();

      // Act & Assert
      expect(() => service.createUser(userData)).toThrow('Invalid email');
    });
  });
});
```

### Test Coverage

- **Unit Tests**: 70%+ coverage minimum
- **Integration Tests**: Critical paths
- **E2E Tests**: User workflows

### Mocking Best Practices

```typescript
// ✅ Good - Mock external dependencies
import { jest } from '@jest/globals';

const mockFetch = jest.fn();
global.fetch = mockFetch;

it('should fetch user data', async () => {
  mockFetch.mockResolvedValue({
    json: async () => ({ id: '1', name: 'John' }),
  });

  const user = await fetchUser('1');

  expect(user.name).toBe('John');
  expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
});
```

---

## Git Workflow

### Branch Naming

```
feature/add-user-authentication
bugfix/fix-login-redirect
hotfix/critical-security-patch
refactor/simplify-metrics-service
docs/update-readme
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: simplify metrics calculation
test: add unit tests for user service
chore: update dependencies
```

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

---

## Summary

### Development Workflow

1. **Plan**: Break down work into small, testable units
2. **Code**: Follow SOLID, DRY, KISS principles
3. **Test**: Write tests with 70%+ coverage
4. **Validate**: Run `npm run validate` before commit
5. **Review**: Self-review against checklist
6. **Commit**: Use conventional commits with Husky hooks
7. **PR**: Submit with clear description and tests

### Key Takeaways

- ✅ **SOLID**: Every class has one job, open for extension
- ✅ **DRY**: Extract common logic, avoid duplication
- ✅ **KISS**: Prefer simple solutions over clever ones
- ✅ **TypeScript**: Strict types, no `any`, use generics
- ✅ **React**: Functional components, custom hooks, composition
- ✅ **Patterns**: Factory, Builder, Strategy, Observer when appropriate
- ✅ **Quality**: Pre-commit validation, comprehensive testing, clear documentation

### Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Best Practices](https://react.dev/learn)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
