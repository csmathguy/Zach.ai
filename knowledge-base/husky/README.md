# Husky & lint-staged (Git Hooks)

> Tools for enforcing code quality checks on every commit.

**Current Versions**: Husky ^9.1.7, lint-staged 16.2.7 (see [package.json](../../package.json))  
**Status**: 🚧 MVP

---

## 1. Why We Use Them

- Automatically run fast validation (typecheck, lint, format) on staged files before each commit.
- Prevent broken or unformatted code from entering the repo, without requiring developers to remember extra commands.
- Keep pre-commit checks consistent across the team and across machines.

---

## 2. Where They Live

- Root config:
  - Husky is wired via the `prepare` script in [package.json](../../package.json).
  - lint-staged configuration is defined under the `"lint-staged"` key in [package.json](../../package.json).
- Git hook scripts:
  - `.husky/pre-commit` runs `npx lint-staged`.

These are root-level hooks that apply to all work in this monorepo (frontend + backend).

---

## 3. How They’re Wired Up

- Husky install:
  - `"prepare": "husky"` in [package.json](../../package.json) ensures Husky hooks are installed after `npm install`.
- Pre-commit hook:
  - [.husky/pre-commit](../../.husky/pre-commit) contains a single command: `npx lint-staged`.
- lint-staged tasks (from [package.json](../../package.json)):
  - For `*.{js,mjs,cjs,ts,tsx}`:
    - `tsc --noEmit --skipLibCheck`
    - `eslint --fix`
    - `prettier --write`
  - For `*.{json,md,html,css}`:
    - `prettier --write`

This means every commit runs a quick TypeScript check, auto-fixes lint issues, and formats staged files.

---

## 4. Core Usage Patterns (Today)

- You don’t call Husky directly in day-to-day work.
- Typical flow:
  - Edit files.
  - `git add ...` to stage changes.
  - `git commit ...`.
  - Husky triggers `.husky/pre-commit`, which runs `npx lint-staged`.
  - lint-staged runs the configured commands only on staged files.
- If any command fails (e.g. type errors, lint failures), the commit is blocked until issues are fixed.

---

## 5. Gotchas & Local Conventions

- Keep pre-commit checks **fast**: only quick validations should live in lint-staged (no full test suites).
- Prefer adding heavier checks (full `npm run validate`, long-running tests) to CI, not to Husky hooks.
- When updating lint or format rules, remember they also affect pre-commit behavior via lint-staged.
- If a commit is blocked, run `npm run validate:staged` or the reported command manually to see full output.

---

## 6. Maintenance Notes (MVP)

- **Next Review**: 2026-03-31
- **Future Improvements**:
  - Consider adding a single top-level script (e.g. `npm run validate:staged`) as the sole lint-staged command for easier maintenance.
  - Document a standard workflow in the main codebase README so new contributors understand why commits may be blocked.
  - Revisit which file types are validated as we add more technologies (e.g. config formats, additional languages).
