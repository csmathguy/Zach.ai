# Tooling (Concurrently & cross-env)

> Small CLI helpers used to orchestrate dev workflows from npm scripts.

**Current Versions**: concurrently ^8.2.2, cross-env ^7.0.3 (see [package.json](../../package.json))  
**Status**: 🚧 MVP

---

## 1. Why We Use Them

- **concurrently**: Run the frontend and backend dev servers at the same time from a single root command.
- **cross-env**: Set environment variables in a cross-platform way inside npm scripts (even though we currently rely more on PowerShell for env on Windows).

These tools keep our dev and build scripts simple while working consistently across environments.

---

## 2. Where They Live

- Installed as devDependencies in the root [package.json](../../package.json).
- Used primarily in root npm scripts:
  - `concurrently` in the `dev` script to start both frontend and backend.
  - `cross-env` is available for future scripts that need portable `NODE_ENV` or other env variables.

---

## 3. How They’re Wired Up

### concurrently

- Defined in [package.json](../../package.json) under the `dev` script:
  - `"dev": "npm run setup && concurrently -n frontend,backend -c blue,green \"npm run dev --prefix frontend\" \"npm run dev --prefix backend\""`
- Behavior:
  - Ensures `npm run setup` installs frontend and backend dependencies first.
  - Starts `npm run dev --prefix frontend` (Vite dev server) and `npm run dev --prefix backend` (backend dev server) in parallel.
  - Uses colored prefixes (`frontend`, `backend`) so logs are easy to distinguish.

### cross-env

- Installed and ready for use in scripts, but not heavily used yet because our main env handling is done via PowerShell scripts and PM2.
- When we need to set environment variables in a portable way in npm scripts (e.g., `NODE_ENV=production`), we will use:
  - `cross-env NODE_ENV=production <command>`

---

## 4. Core Usage Patterns (Today)

- **Daily development**:
  - Run `npm run dev` from the repo root to:
    - Install dependencies (via `npm run setup`).
    - Start both frontend and backend dev servers via `concurrently`.
- **Future scripts** may use `cross-env` for simple, portable env configuration in npm scripts when needed.

---

## 5. Gotchas & Local Conventions

- Avoid putting complex logic directly in `concurrently` commands; prefer small, focused npm scripts composed with `concurrently`.
- For Windows-specific automation (deployment, PM2 management), use the PowerShell scripts under [scripts/](../../scripts/README.md) instead of relying solely on `cross-env`.
- If we introduce more processes (e.g., additional services), consider whether they belong in `npm run dev` or should be managed separately by PM2.

---

## 6. Maintenance Notes (MVP)

- **Next Review**: 2026-03-31
- **Future Improvements**:
  - Add concrete examples of `cross-env` usage once we have scripts that need portable env variables.
  - Document any new `concurrently` scripts if we expand beyond the current frontend+backend dev workflow.
