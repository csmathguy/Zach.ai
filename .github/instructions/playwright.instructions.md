---
name: Playwright E2E guidelines
applyTo: 'e2e/**/*.ts'
---

## Playwright Basics

- Use `@playwright/test` from the root config [`playwright.config.ts`](../../playwright.config.ts).
- Tests live in the [`e2e/`](../../e2e) folder.
- Base URL is configured in the config; prefer `page.goto('/')` instead of hardcoding host/port.

## Best Practices

- **Test user-visible behavior**
  - Interact with the app like a user (click buttons, assert visible text and headings).
  - Avoid asserting on brittle implementation details (CSS classes, deeply nested selectors) unless necessary.
- **Use resilient locators**
  - Prefer `page.getByRole`, `page.getByText`, or `page.getByTestId` to raw CSS/XPath.
  - Example: `page.getByRole('heading', { name: /zach\.ai/i })`.
- **Use web-first assertions**
  - Always `await expect(locator).toBeVisible()` / `toHaveText()` instead of manual visibility checks.
- **Keep tests small and focused**
  - One clear responsibility per test (e.g., "app loads", "health card shows status").
  - Avoid long, fragile end-to-end scripts that cover many flows at once.

## Project Conventions

- Run all E2E tests from the repo root:
  - `npm run test:e2e` – standard E2E run.
  - `npm run verify:all` – full suite (typecheck, lint, format:check, unit tests, E2E).
- The backend and frontend are started via `npm run dev` in the Playwright config `webServer` block.

For deeper Playwright docs and patterns, see [knowledge-base/playwright/README.md](../../knowledge-base/playwright/README.md).
