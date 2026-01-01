# Husky & lint-staged (Git Hooks)

> Tools for enforcing code quality checks on every commit.

**Current Versions**: Husky ^9.1.7, lint-staged 16.2.7 (see [package.json](../../package.json))  
**Status**: 🚧 MVP

---

## 1. Why We Use Them

- Automatically run fast validation (lint + format) on staged files before each commit.
- Block commits when linting/formatting fails so broken or unformatted code cannot enter the repo.
- Enforce a must-pass local gate before changes are committed or pushed.

---

## 2. Where They Live

- Root config:
  - Husky is wired via the `prepare` script in [package.json](../../package.json).
  - lint-staged configuration is defined under the `"lint-staged"` key in [package.json](../../package.json).
- Git hook scripts:
  - `.husky/pre-commit` runs `npx lint-staged` for fast per-file lint/format.
  - `.husky/pre-push` runs `npm run verify:all` (typecheck, lint, format:check, unit tests, E2E tests).

These are root-level hooks that apply to all work in this monorepo (frontend + backend) and must pass before code can be committed or pushed.

---

## 3. How They’re Wired Up

- Husky install:
  - `"prepare": "husky"` in [package.json](../../package.json) ensures Husky hooks are installed after `npm install`.
- Pre-commit hook:
  - [.husky/pre-commit](../../.husky/pre-commit) contains a single command: `npx lint-staged`.
- Pre-push hook:
  - [.husky/pre-push](../../.husky/pre-push) runs `npm run verify:all`.
- lint-staged tasks (from [package.json](../../package.json)):
  - For `*.{js,mjs,cjs,ts,tsx}`:
    - `eslint --fix`
    - `prettier --write`
  - For `*.{json,md,html,css}`:
    - `prettier --write`

This means every commit auto-fixes lint issues and formats staged files, and every push must pass full typecheck, lint, format:check, unit tests, and E2E tests.

---

## 4. Core Usage Patterns (Today)

- You don’t call Husky directly in day-to-day work.
- Typical commit flow:
  - Edit files.
  - `git add ...` to stage changes.
  - `git commit ...`.
  - Husky triggers `.husky/pre-commit`, which runs `npx lint-staged`.
  - lint-staged runs the configured commands only on staged files.
- Typical push flow:
  - `git push`.
  - Husky triggers `.husky/pre-push`, which runs `npm run verify:all`.
- If any command fails (lint, format, typecheck, or tests), the commit or push is blocked until issues are fixed.

---

## 5. Gotchas & Local Conventions

- Keep pre-commit checks **fast**: only quick validations should live in lint-staged (no full test suites).
- Heavy checks (full `npm run verify:all`) now run in the pre-push hook so they must pass before code leaves your machine.
- When updating lint or format rules, remember they also affect pre-commit behavior via lint-staged and pre-push behavior via `verify:all`.
- If a commit is blocked, run `npm run validate:staged` or the reported command manually to see full output.
- If a push is blocked, run `npm run verify:all` locally to reproduce and fix issues.

---

## 6. Maintenance Notes (MVP)

- **Next Review**: 2026-03-31
- **Future Improvements**:
  - Consider adding a single top-level script (e.g. `npm run validate:staged`) as the sole lint-staged command for easier maintenance.
  - Document a standard workflow in the main codebase README so new contributors understand why commits may be blocked.
  - Revisit which file types are validated as we add more technologies (e.g. config formats, additional languages).
