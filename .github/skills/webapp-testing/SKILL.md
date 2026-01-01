name: webapp-testing
description: Helps plan and implement web UI tests and monorepo checks (unit + E2E) for this template.

---

# Webapp Testing Skill

Use this skill when:

- You need to design or extend tests for the Zach.ai-style monorepo (Vite + React frontend, Express backend).
- You want to run the full verification suite (typecheck, lint, format check, unit tests, Playwright E2E).

## Repository Context

- Frontend: Vite + React + TypeScript under `frontend/`.
- Backend: Express + TypeScript under `backend/`.
- E2E tests: Playwright in `e2e/` with root [`playwright.config.ts`](../../../playwright.config.ts).
- Knowledge base: see `knowledge-base/` for stack-specific docs.

## When Generating or Updating Tests

- Prefer unit tests first (Jest + Testing Library / Supertest), then E2E for key flows.
- For E2E:
  - Use `@playwright/test`.
  - Use resilient locators (`getByRole`, `getByText`, `getByTestId`).
  - Assert on user-visible behavior, not DOM implementation details.
- Keep tests small and focused; avoid long, brittle scenarios.

## Commands to Run

From the repo root:

- Full verification (typecheck, lint, format:check, unit tests, E2E):
  - `npm run verify:all`
- Only unit tests:
  - `npm test`
- Only Playwright E2E tests:
  - `npm run test:e2e`

## References

- Monorepo structure: `knowledge-base/codebase/structure.md`
- Development guide and Current Codebase Stack: `knowledge-base/codebase/development-guide.md`
- Testing docs: `knowledge-base/jest/README.md`, `knowledge-base/testing-library/README.md`, `knowledge-base/playwright/README.md`
