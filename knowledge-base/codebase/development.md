# Development Workflow

This document summarizes the practical development workflow for this codebase and points to the authoritative guides.

## Core References

- [development-guide.md](development-guide.md) – Principles, patterns, and the **Current Codebase Stack**.
- [structure.md](structure.md) – Repository and directory layout.
- [validation.md](validation.md) – Typechecking, linting, formatting, and test scripts.

## Local Development

### Setup

1. Install dependencies at the root:
   ```bash
   npm install
   ```
2. (Optional) Install dependencies in each project for direct usage:
   ```bash
   npm install --prefix frontend
   npm install --prefix backend
   ```

### Running the App

- Start both frontend (Vite) and backend (Express) together:

  ```bash
  npm run dev
  ```

  - Frontend: Vite dev server on port 5173.
  - Backend: Express API on port 3000 (with CORS enabled in development).

### Testing

- Frontend tests:
  ```bash
  npm test --prefix frontend
  ```
- Backend tests:
  ```bash
  npm test --prefix backend
  ```

See the Jest knowledge base for more details: [../jest/README.md](../jest/README.md).

### Validation

Before committing, run the full validation suite (or rely on pre-commit hooks):

```bash
npm run validate
```

This runs typechecking, ESLint, and Prettier across the monorepo. See [validation.md](validation.md) for details.

## Deployment (Snapshot-Based)

- Build both projects and snapshot to `deploy/current`:
  ```bash
  npm run deploy
  ```
- PM2 uses this snapshot to run the production process defined in [../../ecosystem.config.js](../../ecosystem.config.js).

For deeper deployment details, see [../deployment/README.md](../deployment/README.md) and [../pm2/README.md](../pm2/README.md).
