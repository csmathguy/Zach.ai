# Supertest (API Testing)

> Library for testing HTTP endpoints in our Express backend.

**Current Version**: ^7.1.4 (see [backend/package.json](../../backend/package.json))  
**Status**: 🚧 MVP

---

## 1. Why We Use It

- Exercise Express routes through real HTTP requests instead of calling handlers directly.
- Keep backend tests focused on behavior (status codes, JSON payloads) rather than implementation details.
- Combine cleanly with Jest so our backend tests stay fast and readable.

---

## 2. Where It Lives

- Installed in the backend: [backend/package.json](../../backend/package.json).
- Used in backend tests, for example:
  - [backend/src/**tests**/server.test.ts](../../backend/src/__tests__/server.test.ts)
- Runs via the backend Jest scripts:
  - `npm test --prefix backend`
  - `npm run test:coverage --prefix backend`

---

## 3. How It’s Wired Up

- Supertest is a devDependency of the backend.
- Tests import it as:
  - `import request from 'supertest';`
- We pass an Express app instance to `request(app)` and chain HTTP verbs like `.get('/health')`.
- Jest is configured in [backend/jest.config.js](../../backend/jest.config.js) so Supertest tests run with `npm test` from the repo root.

---

## 4. Core Usage Patterns (Today)

- Create an in-memory Express app for tests, without binding to a real port.
- Use `await request(app).get('/health')` to hit an endpoint.
- Assert on:
  - HTTP status: `expect(response.status).toBe(200);`
  - JSON body: `expect(response.body).toEqual({...});`
- Use Jest matchers like `expect.any(String)` for dynamic values (e.g. timestamps).

See [backend/src/**tests**/server.test.ts](../../backend/src/__tests__/server.test.ts) for our current health-check tests.

---

## 5. Gotchas & Local Conventions

- Prefer creating a lightweight test app (like `createTestApp()`) instead of importing the full production server to keep tests fast and isolated.
- Keep tests focused on public HTTP behavior; avoid reaching into private Express internals.
- Use realistic JSON shapes that match what the frontend consumes (status, env, port, metrics, etc.).

---

## 6. Maintenance Notes (MVP)

- **Next Review**: 2026-03-31
- **Future Improvements**:
  - Add examples for testing error paths and non-2xx responses.
  - Document patterns for authenticated routes if/when they are added.
  - Link to additional backend test files as the API surface grows.
