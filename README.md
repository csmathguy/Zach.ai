# TypeScript Web Monorepo Template

TypeScript monorepo with a Vite + React frontend, an Express + TypeScript backend, strong testing (Jest + Playwright), and a consolidated knowledge base.

## Tech Stack

- **Frontend**: Vite 5, React 18, TypeScript (strict)
- **Backend**: Express 4, TypeScript (strict)
- **Testing**:
  - Unit: Jest + Testing Library (frontend), Jest + Supertest (backend)
  - E2E: Playwright (`@playwright/test`)
- **Code Quality**: ESLint (flat config, typescript-eslint), Prettier, Husky + lint-staged
- **Runtime / Deployment**: Node.js, PM2, snapshot deploys under `deploy/current`

## Quick Start

```bash
# Install all dependencies
npm install

# Start frontend + backend in dev mode (Vite + Express)
npm run dev
```

- Frontend dev server: http://localhost:5173
- Backend dev server: http://localhost:3000

## Testing & Quality

```bash
# Run all unit tests (frontend + backend)
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run Playwright E2E tests
npm run test:e2e

# Typecheck, lint (with fix), and format
npm run validate

# Full verification (typecheck, lint, format check, unit + E2E tests)
npm run verify:all
```

## Project Structure

See the codebase documentation for details:

- [knowledge-base/codebase/structure.md](knowledge-base/codebase/structure.md) – Repository layout
- [knowledge-base/codebase/development-guide.md](knowledge-base/codebase/development-guide.md) – Principles & **Current Codebase Stack**
- [knowledge-base/codebase/architecture.md](knowledge-base/codebase/architecture.md) – Runtime architecture
- [knowledge-base/codebase/development.md](knowledge-base/codebase/development.md) – Day-to-day dev workflow

## Knowledge Base

All technology and project docs live under [knowledge-base/](knowledge-base/README.md):

- TypeScript, React, Vite, Node.js, Express
- Jest, Testing Library, Supertest, Playwright
- ESLint, Prettier, PM2, deployment, Copilot

Start at [knowledge-base/README.md](knowledge-base/README.md) for an index and links.

## Reusing This Template

To reuse this setup for a new project:

1. Clone the repo and update metadata (name, description) in `package.json` and `frontend/backend` package.json files.
2. Update branding/text in the frontend (header, dashboard copy).
3. Adjust backend routes as needed (starting from `/health` and `/api/metrics`).
4. Keep the existing testing + quality tooling and extend tests as you add features.
5. Update the knowledge base incrementally to match your domain.

This repository is intended as a strong starting point for TypeScript monorepos with a React SPA and Node/Express API, with testing and documentation baked in from day one.
