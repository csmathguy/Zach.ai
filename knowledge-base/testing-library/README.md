# Testing Library (React)

> Primary tool for testing React components and user interactions in the Zach.ai frontend.

**Current Version**: @testing-library/react ^16.3.1, @testing-library/jest-dom ^6.9.1, @testing-library/user-event ^14.6.1  
**Last Updated**: 2025-12-31  
**Status**: 🚧 In Progress (core patterns documented · more feature examples to add)

## Quick Links

- React Testing Library: https://testing-library.com/react
- jest-dom: https://github.com/testing-library/jest-dom
- user-event: https://testing-library.com/docs/user-event/intro

---

## Overview

The Testing Library family (React Testing Library, jest-dom, and user-event) is used to test UI behavior from the user’s perspective.

In Zach.ai:

- Packages are installed in the frontend (see [frontend/package.json](../../frontend/package.json)).
- Jest is configured with jsdom in [frontend/jest.config.js](../../frontend/jest.config.js).
- Global Testing Library setup lives in [frontend/jest.setup.ts](../../frontend/jest.setup.ts).
- Our first React test is [frontend/src/**tests**/App.test.tsx](../../frontend/src/__tests__/App.test.tsx).

The goal is for all React UI tests to:

- Interact with the app the way a user would (via DOM and events).
- Avoid reliance on component internals (implementation details).
- Be readable, resilient to refactors, and focused on behavior.

---

## Why We Use It

Testing Library is a natural fit with React, Jest, and our TypeScript setup because it:

- Encourages **behavior-first tests** (what the user sees and does) instead of brittle implementation checks.
- Promotes **accessibility-aligned queries** (roles, labels, visible text) which improves both tests and UI a11y.
- Works seamlessly with **jsdom + Jest** and our existing TypeScript tooling.

We follow Testing Library’s guiding principle: _“The more your tests resemble the way your software is used, the more confidence they can give you.”_

---

## Installation & Setup

These packages are already installed in the frontend devDependencies (see [frontend/package.json](../../frontend/package.json)):

- `@testing-library/react` ^16.3.1
- `@testing-library/jest-dom` ^6.9.1
- `@testing-library/user-event` ^14.6.1

### Jest Configuration

Jest for the frontend is configured in [frontend/jest.config.js](../../frontend/jest.config.js):

- `testEnvironment: "jsdom"` to simulate a browser DOM.
- TypeScript support via `ts-jest`.
- CSS and asset imports mapped to mocks for React components.
- `setupFilesAfterEnv` includes [frontend/jest.setup.ts](../../frontend/jest.setup.ts) so jest-dom matchers are available in every test.

### Global Setup (jest.setup.ts)

[frontend/jest.setup.ts](../../frontend/jest.setup.ts) currently:

- Imports `@testing-library/jest-dom` so matchers like `toBeInTheDocument` are globally available.
- Provides hooks for additional global setup/teardown if needed.

When adding more global behavior (for example, configuring `@testing-library/react` or `user-event` defaults), extend this file rather than individual tests.

### TypeScript Configuration

The frontend TypeScript config [frontend/tsconfig.json](../../frontend/tsconfig.json) includes Jest and jest-dom types so tests compile cleanly:

- `types: ["jest", "@testing-library/jest-dom"]` under `compilerOptions`.
- `include: ["src"]` so `__tests__` under `src` are type-checked.

All test files should use `.test.tsx` (for React components) or `.test.ts` (for utilities) and live under `src/__tests__/` or next to the code they test.

---

## Core Concepts

### Render, Query, Assert

Most tests follow this pattern:

1. **Render**: Mount a React component into a jsdom container.
2. **Query**: Find elements the way a user would (roles, labels, visible text).
3. **Assert**: Use Jest + jest-dom matchers to assert on state and behavior.

Example from [frontend/src/**tests**/App.test.tsx](../../frontend/src/__tests__/App.test.tsx):

- `render(<App />);`
- `screen.getByRole('heading', { level: 1, name: /zach.ai/i });`
- `expect(...).toBeInTheDocument();`

### Query Priority

We follow Testing Library’s recommended query priority (from most to least user-centric):

1. **Role-based**: `getByRole`, `queryByRole`, `findByRole`
2. **Label-based**: `getByLabelText`, `queryByLabelText`, `findByLabelText`
3. **Placeholder / Display Value**: `getByPlaceholderText`, `getByDisplayValue`
4. **Text-based**: `getByText`, `getByTitle`
5. **Test IDs**: `getByTestId` (last resort only)

In practice:

- Prefer `getByRole` with an accessible `name` whenever possible.
- Use `findBy*` for async behavior (loading → loaded state).
- Use `queryBy*` for checking absence (e.g., an element is removed).

### Synchronous vs Asynchronous Queries

- `getBy*`: Synchronous; throws if not found. Use when the element should already be present.
- `queryBy*`: Synchronous; returns `null` instead of throwing. Use for asserting absence.
- `findBy*`: Asynchronous; returns a Promise and waits up to a timeout. Use when the UI changes after async work (network, timers).

Combine `findBy*` with `async/await` for data-fetching components or delayed updates.

---

## jest-dom

`@testing-library/jest-dom` extends Jest’s `expect` with DOM-specific matchers that improve readability and reduce boilerplate.

Common matchers we use or plan to use:

- `toBeInTheDocument()` – Element exists in the rendered tree.
- `toHaveTextContent(text)` – Element’s text matches the expected content.
- `toBeVisible()` – Element is visible to the user.
- `toBeDisabled()` / `toBeEnabled()` – Form controls state.
- `toHaveAttribute(name, value)` – Attribute assertion.
- `toHaveClass(name)` – CSS class assertion (use sparingly; behavior-first still applies).

Because jest-dom is imported in [frontend/jest.setup.ts](../../frontend/jest.setup.ts), these matchers are available globally; no per-test imports are needed.

Guidelines:

- Prefer jest-dom matchers over raw `expect(element).not.toBeNull()` style checks.
- Use `toBeInTheDocument` and `toBeVisible` for presence/visibility instead of checking `innerHTML`.

---

## user-event

`@testing-library/user-event` provides high-level interaction helpers that better model real user actions than `fireEvent`.

Typical usage patterns:

- `await userEvent.click(button);`
- `await userEvent.type(input, "hello world");`
- `await userEvent.tab();`

Guidelines:

- Prefer `userEvent` over `fireEvent` for most interactions.
- Use `await` with `userEvent` calls, especially under React 18, to allow state updates and effects to flush.
- Reserve `fireEvent` for low-level events that `userEvent` does not cover.

As we add interactive components (forms, filters, toggles), tests should express user behavior in terms of `userEvent` interactions and visible outcomes, not internal state changes.

---

## Patterns for Zach.ai

### Basic Component Test Structure

We follow the Arrange–Act–Assert pattern and co-locate simple tests near their components or under `__tests__`:

- **Arrange**: Render the component with required props.
- **Act**: Optionally simulate user interaction or async behavior.
- **Assert**: Verify what the user sees.

Example style (simplified from our App test):

- `render(<App />);`
- `expect(screen.getByRole('heading', { level: 1, name: /zach.ai/i })).toBeInTheDocument();`

### Using `screen` Instead of Destructuring

Our tests import `screen` from `@testing-library/react` rather than destructuring queries from the render result. This keeps queries in one place and matches Testing Library docs:

- `import { render, screen } from '@testing-library/react';`
- `render(<App />);`
- `screen.getByRole(...);`

New tests should follow this pattern.

### Asserting on Sections and Headings

Our dashboard UI has prominent headings for key sections (Health, Dashboard, Environment). Tests assert on these using accessible roles and names rather than CSS selectors or IDs. This ensures that renaming or restyling the components does not break tests as long as the visible text and semantics stay stable.

---

## Async and Data-Fetching Components

As we add tests around the dashboard’s data-fetching behavior (health, metrics, environment info), we will:

- Use `findBy*` queries for elements that appear after async work.
- Use `waitFor` when we need to wait for arbitrary assertions after effects.
- Prefer checking **user-visible state** (loading text, error messages, displayed values) over internal fetch calls.

Example patterns to follow:

- Initial state: `expect(screen.getByText(/checking server/i)).toBeInTheDocument();`
- After data load: `expect(await screen.findByText(/uptime:/i)).toBeInTheDocument();`
- Error case: use mocks to force failures and assert that error text is shown.

---

## TypeScript Usage

All tests in the frontend are written in TypeScript, benefiting from strict typing:

- Component props and state are checked at compile time.
- Helpers like `render` and `screen` are fully typed.
- Misuse of Testing Library functions (wrong arguments, missing options) is caught early.

Guidelines:

- Type component props explicitly; tests should consume those props just like production code.
- When creating custom helpers (e.g., a `renderWithProviders` function), type them generically so they remain reusable and safe.

---

## Common Patterns (Planned)

As the React UI grows, we will add concrete examples for:

- Form testing (inputs, validation messages, submit behavior).
- Routing-aware tests (once React Router is introduced).
- Tests involving context providers or shared state.
- Accessibility checks (ensuring labels, roles, and keyboard navigation work as expected).

Each new pattern should be documented here with a short example and a link to the corresponding test file.

---

## Anti-Patterns to Avoid

- **Testing implementation details**:
  - Avoid asserting on internal state, private methods, or hook calls.
  - Prefer checking rendered output and user-visible behavior.

- **Overusing test IDs**:
  - `data-testid` should be a last resort; prefer roles, labels, and text.

- **Brittle selectors**:
  - Do not query by CSS class names, tag names, or DOM structure unless absolutely necessary.

- **Over-mocking React or browser APIs**:
  - Mock only what you must (e.g., network calls), and keep mocks close to tests or in focused helpers.

---

## Maintenance Notes

- **Next Review Due**: 2026-03-31
- **Known Gaps**:
  - Only a small number of React tests exist (currently App-level); feature-level tests for the dashboard and future components still need to be added.
  - No shared `renderWithProviders` helper yet; introduce one if we add global providers (router, context, etc.).
- **Enhancement Ideas**:
  - Add concrete examples for `user-event` usage once interactive components are created.
  - Cross-link specific patterns to real test files as the test suite grows.
  - Consider adding basic accessibility checks to enforce good ARIA usage alongside Testing Library’s best practices.
