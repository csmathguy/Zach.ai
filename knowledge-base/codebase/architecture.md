# Architecture Overview

High-level architecture of the application template.

## Monorepo Layout

This is a TypeScript monorepo with two main runtime projects:

- **Frontend**: Vite + React + TypeScript SPA in [frontend/](../../frontend)
- **Backend**: Express + TypeScript API server in [backend/](../../backend)

Shared tooling (TypeScript, ESLint, Prettier, Jest, Husky, lint-staged, PM2) lives at the repository root. See the **Current Codebase Stack** section in [development-guide.md](development-guide.md) for a detailed description.

## Runtime Architecture

### Backend (API Server)

- **Framework**: Express 4.x with strict TypeScript.
- **Entry Point**: [backend/src/server.ts](../../backend/src/server.ts).
- **Responsibilities**:
  - Expose `GET /health` for health checks.
  - Expose `GET /api/metrics` for basic server metrics (uptime, memory, timing) via [backend/src/utils/metrics.ts](../../backend/src/utils/metrics.ts).
  - In development, enable CORS so the Vite dev server (port 5173) can call the API.
  - In production, serve the built frontend assets from the `frontend/dist` snapshot (deployed under [deploy/current](../../deploy)).

The backend is intentionally thin today, acting as an API boundary and integration point for future features.

### Frontend (SPA)

- **Tooling**: Vite 5.x with React and strict TypeScript.
- **Entry Point**: [frontend/src/main.tsx](../../frontend/src/main.tsx) mounts the React app and imports global styles.
- **App Shell**: [frontend/src/app/App.tsx](../../frontend/src/app/App.tsx) provides the page layout (header, main content area, footer).
- **Feature Slice**: [frontend/src/features/dashboard](../../frontend/src/features/dashboard) implements the initial monitoring dashboard:
  - `Dashboard.tsx` renders three cards (Health, Metrics, Environment Information).
  - `dashboard-api.ts` calls the backend (`/health`, `/api/metrics`) using `fetch` and updates the dashboard DOM containers.
  - `Dashboard.module.css` defines the responsive layout and card styling.
- **Shared Utilities**:
  - [frontend/src/shared/debugger.ts](../../frontend/src/shared/debugger.ts) defines a `DEBUGGER` helper that gates console output by environment and is exposed as `window.APP_DEBUGGER` for interactive debugging.

### Communication Path

- The React dashboard invokes functions from `dashboard-api.ts` on mount.
- `dashboard-api.ts` uses the browser `fetch` API to call the backend endpoints.
- Responses are rendered into the dashboard card containers using HTML that relies on global styles in [frontend/src/styles.css](../../frontend/src/styles.css).

## Deployment & Runtime

- **Build**: `npm run build` builds both frontend and backend into their respective `dist/` directories.
- **Snapshot Deploy**: `npm run deploy` creates a snapshot under [deploy/current](../../deploy), containing built frontend assets and compiled backend code.
- **Process Management**: PM2 runs the production app using [ecosystem.config.js](../../ecosystem.config.js), with the main process serving on port 8080.

## Related Documents

- [development-guide.md](development-guide.md) – Principles, patterns, and the Current Codebase Stack.
- [structure.md](structure.md) – Directory-level repository structure.
- [validation.md](validation.md) – Typechecking, linting, formatting, and test workflow.
