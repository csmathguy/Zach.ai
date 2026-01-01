# Playwright (E2E Testing)

Playwright is a modern end-to-end testing framework for web applications. It bundles a test runner, assertions, parallelization, and tooling for debugging and reporting.

**Official Docs**: https://playwright.dev/

## Why We Use Playwright Here (MVP)

- End-to-end smoke tests that hit the real app in a browser.
- Simple, TypeScript-friendly API (`@playwright/test`).
- Built-in test runner and HTML reports (available when we need them).
- Easy to grow into multi-browser, multi-project setups later.

For now we follow KISS:

- Single config at repo root.
- `e2e/` folder with a minimal smoke test that asserts the app loads.

## Current Setup in This Repo

- **Package**: `@playwright/test` (dev dependency at root).
- **Config**: [playwright.config.ts](../../playwright.config.ts)
  - `testDir: './e2e'` – all Playwright tests live under `e2e/`.
  - `use.baseURL: 'http://localhost:5173'` – points to the Vite dev server.
  - `webServer`:
    - `command: 'npm run dev'` – starts both frontend and backend via the existing dev script.
    - `port: 5173` – waits for Vite.
    - `reuseExistingServer: !process.env.CI` – in local dev, reuse an already-running dev server.
    - `timeout: 120000` – generous timeout for startup.
- **Tests directory**: [e2e/](../../e2e)
  - [e2e/app-loads.spec.ts](../../e2e/app-loads.spec.ts) – simple smoke test that checks the app header renders.

## How to Run E2E Tests

From the repo root:

```bash
# Install Playwright test runner (and browsers if not yet installed)
npm install
npx playwright install

# Run all Playwright tests
npx playwright test

# Or via npm script
npm run test:e2e
```

The config will:

- Start `npm run dev` (frontend + backend) if needed.
- Wait for `http://localhost:5173`.
- Run tests in `e2e/` using `@playwright/test`.

## Example Test (Current Smoke Test)

```ts
import { test, expect } from '@playwright/test';

test('app loads and shows dashboard header', async ({ page }) => {
  await page.goto('/');
  const title = page.getByRole('heading', { name: /zach\.ai/i });
  await expect(title).toBeVisible();
});
```

This is intentionally minimal and only verifies that the root page loads and the main header is visible.

## Basic Best Practices (From Official Docs)

Source: https://playwright.dev/docs/best-practices

- **Test user-visible behavior**
  - Focus on what a real user sees and does.
  - Avoid asserting on implementation details (DOM structure, CSS classes) when possible.
- **Use locators and web-first assertions**
  - Prefer `page.getByRole`, `page.getByText`, and `page.getByTestId` to brittle CSS/XPath selectors.
  - Use `await expect(locator).toBeVisible()` instead of manual `isVisible()` checks.
- **Keep tests isolated**
  - Each test runs with its own browser context.
  - Use `test.beforeEach` for shared setup like navigating or logging in.
- **Avoid testing third-party dependencies**
  - Use Playwright's network mocking (`page.route`) instead of hitting external services.
- **Use tooling for productivity**
  - `npx playwright codegen <url>` to record flows and generate locators.
  - UI mode (`npx playwright test --ui`) and the VS Code extension for live debugging.
  - Trace viewer (`npx playwright show-report` with traces enabled) for CI/debugging.

## KISS Guidelines for This Project (Initial Phase)

- Start with **one or two smoke tests**:
  - App loads.
  - Key dashboard widgets appear.
- Use **user-facing locators** when possible:
  - Roles (`getByRole('heading', { name: /zach\.ai/i })`).
  - Visible text for stable headings.
- Keep specs small and readable:
  - One `describe` block per feature area when we expand.
  - Clear test names: `"should show health card"`, `"should show metrics after load"`.
- Defer advanced features for later:
  - No auth fixtures, projects, or traces until we need them.

## Future Enhancements (Ideas)

When we’re ready to grow the E2E suite:

- **Feature-level flows**
  - Test happy paths through upcoming features (AI interactions, settings, etc.).
- **Projects for multiple browsers**
  - Use Playwright `projects` to cover Chromium, Firefox, WebKit.
- **Traces and HTML reports**
  - Enable traces on CI-only retries for failed tests.
  - Publish HTML reports for debugging.
- **CI integration**
  - Add a dedicated Playwright job in GitHub Actions (or other CI).
- **Shared fixtures**
  - Reuse common setup like logging in, seeding data, or navigating to feature pages.

## Resources

- **Official**
  - Intro / Installation: https://playwright.dev/docs/intro
  - Best Practices: https://playwright.dev/docs/best-practices
  - Writing Tests: https://playwright.dev/docs/writing-tests
  - Locators: https://playwright.dev/docs/locators
  - VS Code Extension: https://playwright.dev/docs/getting-started-vscode

- **Learning**
  - Microsoft Learn: https://learn.microsoft.com/en-us/training/modules/build-with-playwright/
  - Learn Videos: https://playwright.dev/community/learn-videos

This is an MVP knowledge base entry; as we add more Playwright tests, we’ll document our patterns (fixtures, auth, CI) here.
