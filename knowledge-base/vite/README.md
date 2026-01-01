# Vite

> Next-generation frontend tooling used to build and serve the Zach.ai frontend.

**Current Version**: 5.x (`vite` ^5.0.0 in frontend)  
**Last Updated**: 2025-12-31  
**Status**: 🚧 In Progress (tooling in use · docs growing)

## Quick Links

- [Official Documentation](https://vite.dev/)
- [Config Reference](https://vite.dev/config/)
- [GitHub Repository](https://github.com/vitejs/vite)

---

## Table of Contents

1. [Overview](#overview)
2. [Why We Use It](#why-we-use-it)
3. [Official Resources](#official-resources)
4. [Version History](#version-history)
5. [Installation & Setup](#installation--setup)
6. [Core Concepts](#core-concepts)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [TypeScript Integration](#typescript-integration)
11. [Testing](#testing)
12. [Performance](#performance)
13. [Security](#security)
14. [Troubleshooting](#troubleshooting)
15. [Migration Guides](#migration-guides)
16. [Comparison with Alternatives](#comparison-with-alternatives)
17. [Learning Resources](#learning-resources)
18. [Maintenance Notes](#maintenance-notes)

---

## Overview

Vite is a modern frontend build tool and dev server focused on speed and developer experience. In Zach.ai it is used to:

- Run the frontend dev server with hot module replacement (HMR) on port 5173.
- Build optimized static assets into `frontend/dist` for production.
- Provide TypeScript-aware bundling for our `frontend/src` code.

The configuration lives in [frontend/vite.config.ts](../../frontend/vite.config.ts), and the app entry is [frontend/src/main.ts](../../frontend/src/main.ts).

In production, the backend Express server (see [express/README.md](../express/README.md)) serves the Vite build output.

---

## Why We Use It

### Our Specific Needs

For Zach.ai, we wanted frontend tooling that:

- Starts quickly and provides fast HMR for local development.
- Plays well with TypeScript and (future) React components.
- Produces efficient, production-ready bundles with minimal configuration.

Vite meets these needs by leveraging native ES modules in development and Rollup under the hood for production builds.

### Alternatives Considered

- **Webpack**:
	- Pros: Very flexible, massive ecosystem.
	- Cons: More complex configuration; slower cold starts compared to Vite.

- **Create React App (CRA)**:
	- Pros: Batteries-included React setup.
	- Cons: Less flexible, slower builds, and de-emphasized in the React docs.

Vite struck the right balance between flexibility, performance, and simplicity, especially for a TypeScript-first project.

---

## Official Resources

Key references from the Vite docs:

- **Getting Started** – Basic project setup and CLI usage.
- **Config Reference** – Detailed explanation of `defineConfig` options.
- **Server Options** – Dev server configuration (ports, proxies, HMR settings).
- **Build Options** – Control over output directory, minification, and Rollup options.
- **Env and Modes** – How `import.meta.env` and `.env` files work.

Use the official docs to look up specific configuration keys or behavior. This document focuses on how we use Vite in Zach.ai.

---

## Version History

We currently use Vite 5.x via the `^5.0.0` range in [frontend/package.json](../../frontend/package.json).

Future major upgrades (e.g., Vite 6) should:

- Be driven by reading the official migration guide and release notes.
- Be validated by running `npm run build` in `frontend/` and then testing the production artifacts served by the backend.

---

## Installation & Setup

### Where Vite Is Installed

Vite is a dev dependency of the frontend project only:

- [frontend/package.json](../../frontend/package.json) lists `vite` under `devDependencies`.

### CLI Scripts

Frontend scripts in [frontend/package.json](../../frontend/package.json):

- `dev` – `vite` (starts the dev server on port 5173).
- `build` – `vite build` (produces a production build in `frontend/dist`).
- `preview` – `vite preview --port 5173` (serves the built app for local testing).

At the root level, higher-level scripts orchestrate frontend and backend, but Vite-specific work is isolated to the frontend package.

---

## Core Concepts

### Dev Server

- Runs on **port 5173** by default (configured in `vite.config.ts`).
- Serves files from `frontend/` using native ES modules.
- Supports hot module replacement (HMR) so code changes are reflected quickly without full page reloads.

### Build Pipeline

- Uses Rollup under the hood to build optimized bundles.
- Outputs static assets (JS, CSS, etc.) into `frontend/dist`.
- These assets are later served by Express in production.

### Preview Server

- `vite preview` serves the built app from `dist` for production-like local testing.
- Also runs on port 5173 in our configuration.

---

## Configuration

Our Vite config is intentionally minimal and lives at [frontend/vite.config.ts](../../frontend/vite.config.ts):

```ts
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 5173,
		open: false,
	},
	preview: {
		port: 5173,
	},
});
```

### Server Options

- `server.port: 5173` – Aligns with our dev tooling and CORS config in the backend.
- `server.open: false` – Prevents automatic browser opening on dev server start.

### Preview Options

- `preview.port: 5173` – Uses the same port for consistency when previewing production builds.

### Future Configuration Considerations

As the frontend grows, we may extend this config to include:

- Path aliases (e.g., `@/` pointing to `src/`).
- Plugins (e.g., React plugin when React is adopted).
- Custom build options (chunking, manual entry points, etc.).

Any such changes should be documented here.

---

## Best Practices

### Keep Config Minimal

- Start with the smallest possible configuration that meets our needs.
- Add options only when we can articulate the problem being solved.

### Align Ports with Backend

- The backend CORS configuration in `server.ts` expects the frontend dev server at `http://localhost:5173`.
- If you change the dev server port, update the backend CORS settings accordingly.

### Clear Separation of Concerns

- Use Vite for **frontend tooling only**; do not run backend code through Vite.
- Keep `vite.config.ts` focused on frontend concerns such as dev server, build, and assets.

---

## Common Patterns

### Dev Workflow

1. Start the backend in dev mode (e.g., via a root script or `backend` package script).
2. In `frontend/`, run `npm run dev` to start the Vite dev server.
3. Open `http://localhost:5173` to work on the frontend.

### Production Workflow

1. In `frontend/`, run `npm run build` to generate `dist`.
2. Deployment scripts (see [scripts/README.md](../../scripts/README.md)) bundle the frontend and backend into the `deploy/` snapshot.
3. Express serves the contents of `frontend/dist` (or snapshot) in production.

---

## TypeScript Integration

Vite has first-class TypeScript support:

- Uses esbuild to transpile TypeScript during dev and build.
- Does **not** run type checking by default; we run `tsc --noEmit` separately (see [typescript/README.md](../typescript/README.md)).

Our frontend `tsconfig.json` (see [frontend/tsconfig.json](../../frontend/tsconfig.json)) is configured with:

- `module: "ESNext"` and `moduleResolution: "Bundler"` to align with Vite.
- `noEmit: true` since Vite handles emitting compiled assets.
- `isolatedModules: true` to ensure each file is compilable in isolation.

---

## Testing

We currently use **Jest** for frontend tests, not Vitest.

- Tests run against TypeScript source files, independent of Vite.
- For most unit tests (like utilities), Vite is not directly involved.

If we introduce tests that depend on Vite-specific behavior (e.g., env variables from `import.meta.env`), we should:

- Document the patterns here.
- Consider whether Vitest or an alternative test runner is appropriate.

---

## Performance

Vite is designed for fast dev and efficient builds out of the box. Potential future optimizations include:

- Configuring Rollup options (e.g., manualChunks) for large apps.
- Tweaking caching or dependency pre-bundling for heavy dependency graphs.

At the current project size, the default behavior is sufficient.

---

## Security

While Vite mainly affects the build and dev environments, keep in mind:

- Do not commit secrets to `.env` files that are bundled into client code.
- Use server-side config (backend) for sensitive values.
- Understand which env variables are exposed to the client via `import.meta.env`.

Production security (TLS, headers, etc.) is handled at the backend or reverse proxy level, not by Vite itself.

---

## Troubleshooting

### Dev Server Won't Start

- Check if port 5173 is already in use.
- Ensure dependencies are installed in `frontend/` (`npm install`).

### CORS or Backend Connection Issues

- Verify that the backend is running on the expected port.
- Check CORS configuration in `backend/src/server.ts` and ensure it matches the Vite dev server URL.

### Build Failures

- Run `npm run typecheck` to ensure TypeScript types are valid.
- Read the Vite build output carefully; it often points directly to problematic imports or syntax.

---

## Migration Guides

When upgrading Vite to a new major version:

1. Consult the official migration guide for that version.
2. Update `vite` in [frontend/package.json](../../frontend/package.json).
3. Run `npm run build` and fix any deprecation or breaking-change issues.
4. Verify that the backend can still serve the built assets correctly.

---

## Comparison with Alternatives

At the time of selection, Vite offered:

- Faster cold start and HMR compared to webpack-based setups.
- Simpler configuration than CRA or custom webpack.

This remains true for our current project size and complexity.

---

## Learning Resources

- Vite Official Docs – https://vite.dev/
- Config Reference – https://vite.dev/config/

When looking for examples, prefer those using **TypeScript** and (eventually) **React**, as they will most closely match our stack.

---

## Maintenance Notes

- **Next Review Due**: 2026-03-31
- **Known Gaps**:
	- This document will need updates when React is introduced and Vite plugins are added.
- **Enhancement Ideas**:
	- Add a `quick-reference.md` with common Vite commands and workflow tips.
	- Document any non-default aliases or plugins once configured.

Review this file during quarterly knowledge base updates and whenever `vite.config.ts` changes.
