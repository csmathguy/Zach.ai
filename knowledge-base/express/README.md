# Express

> Minimalist web framework powering the Zach.ai backend HTTP API.

**Current Version**: 4.19.2  
**Last Updated**: 2025-12-31  
**Status**: 🚧 In Progress (framework stable · docs growing)

## Quick Links

- [Official Site](https://expressjs.com/)
- [4.x API Reference](https://expressjs.com/en/4x/api.html)
- [GitHub Repository](https://github.com/expressjs/express)
- **[Error Handling Guide](error-handling.md)** - Custom error classes, middleware patterns, request ID correlation

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

Express is a minimalist web framework for Node.js. In Zach.ai it is responsible for:

- Serving the backend HTTP API (health and metrics endpoints).
- Acting as a thin layer over Node's HTTP server, wiring middleware and routes.
- Serving the built frontend assets in production.

The main Express application lives in [backend/src/server.ts](../../backend/src/server.ts). It:

- Configures CORS for development.
- Tracks basic metrics like uptime, response times, and memory usage.
- Exposes:
  - `GET /health` – basic health check.
  - `GET /api/metrics` – metrics for dashboards.
- Serves static files from the built frontend directory when `NODE_ENV=production`.

Express is intentionally kept thin; business logic and utilities should live in separate modules, not directly in route handlers.

### CORS Middleware

Development-only CORS support is provided by the [`cors`](https://github.com/expressjs/cors) package:

- Enabled when `NODE_ENV === 'development'` to allow the Vite dev server (typically `http://localhost:5173`) to call the backend.
- Configured in [backend/src/server.ts](../../backend/src/server.ts) to:
  - Allow the frontend origin.
  - Handle common HTTP methods used by our API.

In production, we currently do **not** enable wide-open CORS: the backend is expected to sit behind the same origin as the built frontend. If we expose APIs to other origins, update the CORS configuration in `server.ts` and document the policy here.

---

## Why We Use It

### Our Specific Needs

For Zach.ai, we needed a backend framework that is:

- **Simple**: Minimal boilerplate for a small but growing API surface.
- **Mature**: Stable 4.x series with a long history and abundant resources.
- **Ecosystem-friendly**: Integrates well with TypeScript, Jest, Supertest, and PM2.

Express 4.x meets these goals by offering an unopinionated core while letting us structure the app according to [development-guide.md](../codebase/development-guide.md) (SOLID, DRY, KISS).

### Alternatives Considered

- **NestJS**:
  - Pros: Strong opinionated architecture, decorators, DI.
  - Cons: More complex; heavier abstraction layer for a small service.
  - Decision: Overkill for our current scope.

- **Fastify**:
  - Pros: Higher performance, plugin ecosystem.
  - Cons: Smaller ecosystem compared to Express; less familiar to many devs.
  - Decision: Performance is not currently a bottleneck; Express is sufficient.

- **Raw Node `http` module**:
  - Pros: Zero dependencies; fine-grained control.
  - Cons: Manual routing, parsing, and middleware handling.
  - Decision: Too low-level for day-to-day work; Express removes boilerplate.

---

## Official Resources

Use these pages as the canonical reference for Express behavior:

- **Main Docs** – https://expressjs.com/  
  High-level guides (routing, middleware, error handling, static files).

- **4.x API Reference** – https://expressjs.com/en/4x/api.html  
  Complete reference for `express()` app, `Request`, `Response`, and built-in middleware.

- **Guide Section** – https://expressjs.com/en/guide/routing.html  
  Recommended patterns for routing and middleware.

- **Security Topics** – https://expressjs.com/en/advanced/best-practice-security.html  
  Best practices for headers, cookies, and general security posture.

---

## Version History

We currently standardize on **Express 4.19.2** (pinned via `^4.19.2` in [backend/package.json](../../backend/package.json)).

- 4.x is stable and widely used; most guides and Stack Overflow answers apply directly.
- Express 5 is in progress but not yet the default; we track its progress for future migration.

When Express 5 becomes stable and widely adopted, we will revisit migration (see [Migration Guides](#migration-guides)).

---

## Installation & Setup

### Dependencies

Backend dependencies (in [backend/package.json](../../backend/package.json)):

- `express` – core framework.
- `cors` – CORS middleware for development.
- `@types/express` and `@types/cors` – TypeScript type definitions.

### Basic Setup in This Repo

The main server file [backend/src/server.ts](../../backend/src/server.ts) shows the essential setup:

- Create the app with `express()`.
- Configure development-only CORS.
- Add a metrics middleware to track response times.
- Register `/health` and `/api/metrics` routes.
- In production, serve static assets and route all other paths to `index.html`.

The server listens on a port determined by the `PORT` environment variable (default 3000).

---

## Core Concepts

### Application Object

`const app = express();` creates the main application instance. We attach middleware and routes to it via `app.use`, `app.get`, etc.

### Middleware

Middleware functions sit between the incoming HTTP request and the final route handler. In our server:

- A CORS middleware (development only).
- A custom metrics middleware that measures request durations and tracks them in memory.

### Routing

We currently use `app.get` directly for the few endpoints we expose. As the API grows, we may refactor to separate routers.

### Request/Response Lifecycle

Express wraps Node's `IncomingMessage` and `ServerResponse` with convenience methods such as `res.json` and `res.sendFile`, which we use heavily in `/health`, `/api/metrics`, and static file serving.

---

## Configuration

Key configuration logic lives in [backend/src/server.ts](../../backend/src/server.ts).

### Environment Variables

- `PORT` – port on which the server listens (default: 3000).
- `NODE_ENV` – `development` or `production`; used to toggle CORS and static serving.
- `FRONTEND_DIR` – optional override for the frontend static directory in production.

### Development CORS

When `NODE_ENV === 'development'`, we enable CORS to allow the Vite dev server (typically running at `http://localhost:5173`) to access the backend:

- Only the frontend origin is allowed.
- Credentials are enabled for cookies/headers when needed.

### Static Frontend Serving (Production)

In production, Express serves the built frontend assets. It chooses the static directory in this order:

1. `FRONTEND_DIR` environment variable, if set and exists.
2. `deploy/current/frontend/dist` snapshot directory, if present.
3. Local `frontend/dist` build output.

All non-API routes (`*`) are routed to `index.html` to support client-side routing.

---

## Best Practices

We keep Express usage minimal and align with the general guidance in [development-guide.md](../codebase/development-guide.md).

### Separation of Concerns

- `server.ts` should focus on **wiring** (middleware, routes, static assets), not business logic.
- As logic grows, move it into separate modules (e.g., `controllers/`, `services/`, `utils/`).

### Explicit Middleware Ordering

- Logging/metrics middleware should appear **before** route handlers.
- Error-handling middleware (if added) should appear **after** all routes.

### Clear Route Contracts

- Define response shapes clearly (using TypeScript interfaces or types).
- Keep route handlers small; delegate complex work to functions that can be unit-tested.

---

## Common Patterns

### Health Check Endpoint

`GET /health` returns a simple JSON payload:

- `status` – string (e.g., `"ok"`).
- `timestamp` – ISO timestamp string.
- `env` – value of `NODE_ENV`.
- `port` – effective port number.

This is primarily consumed by monitoring and quick manual checks.

### Metrics Endpoint

`GET /api/metrics` returns structured metrics, including:

- Uptime in various units (ms, seconds, minutes, hours, days) and a formatted string.
- Average response time and recent sample durations.
- Basic memory usage in MB (RSS, heap total, heap used, external).
- Number of tracked requests.

The metrics middleware populates an in-memory array of request durations. This is intentionally simple and non-persistent.

### Static Asset Hosting

In production, Express serves the frontend build as static assets and routes all unknown paths to `index.html`. This allows the frontend to handle client-side routing while Express only serves the initial HTML and static files.

---

## TypeScript Integration

We use `@types/express` for type definitions and write all server code in TypeScript.

### Typing Request Handlers

Handlers can use `Request`, `Response`, and `NextFunction` types for clarity and safety, for example:

```ts
import type { Request, Response } from 'express';

export function healthHandler(_req: Request, res: Response): void {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

As the API grows, prefer extracting typed handlers into separate modules instead of inlining everything in `server.ts`.

---

## Testing

Express routes and middleware can be tested using Jest and Supertest.

### Supertest

- Supertest allows us to make HTTP-like calls against an Express app instance without starting a real network server.
- Backend tests live under [backend/src/**tests**](../../backend/src/__tests__).

Typical pattern:

```ts
import request from 'supertest';
import app from '../server'; // if we refactor server.ts to export the app

it('returns ok for /health', async () => {
  const response = await request(app).get('/health');
  expect(response.status).toBe(200);
  expect(response.body.status).toBe('ok');
});
```

Currently `server.ts` calls `app.listen` directly; if we need more granular testing, we may refactor to export the `app` instance separately from the listener.

---

## Performance

Express itself is reasonably fast for our current needs. Basic considerations:

- Avoid heavy synchronous work in route handlers; use async I/O instead.
- Keep middleware lightweight; avoid unnecessary work on every request.
- Use PM2 (see [pm2/README.md](../pm2/README.md)) to manage clustering or multiple instances if needed.

Our current metrics endpoint already exposes average response times and request counts for basic introspection.

---

## Security

Express does not enforce security by default; we must configure it correctly.

Current measures:

- Limited CORS in development (only dev frontend origin is allowed).
- No CORS configured in production (assumes same-origin frontend/backend).

Future enhancements may include:

- Helmet for secure HTTP headers.
- Rate limiting for sensitive endpoints.
- Input validation middleware.

See Express security best practices: https://expressjs.com/en/advanced/best-practice-security.html

---

## Troubleshooting

### Common Issues

1. **CORS errors in development**
   - Symptom: Browser errors about blocked cross-origin requests.
   - Cause: Frontend origin differs from what CORS is configured to allow.
   - Fix: Ensure Vite dev server is running on `http://localhost:5173` and that the CORS config matches.

2. **Static files not served in production**
   - Symptom: 404s when loading frontend assets.
   - Cause: `FRONTEND_DIR` or snapshot directories not found, or frontend not built.
   - Fix: Verify `deploy/current/frontend/dist` exists or set `FRONTEND_DIR` to the correct path.

3. **Port already in use**
   - Symptom: Server fails to start with EADDRINUSE.
   - Cause: Another process is using the configured port.
   - Fix: Stop the conflicting process or change `PORT`.

---

## Migration Guides

### Towards Express 5

When Express 5 is stable and we decide to upgrade:

1. Review the official migration guide (once published).
2. Update `express` in [backend/package.json](../../backend/package.json).
3. Run backend tests and manual verification for `/health`, `/api/metrics`, and static serving.
4. Adjust any API changes, such as routing behavior or middleware signatures.

---

## Comparison with Alternatives

At our current scale, Express offers the best trade-off between simplicity and capability. More opinionated frameworks like NestJS may be considered if the backend grows significantly in complexity.

---

## Learning Resources

- Official Express Guide – https://expressjs.com/en/guide/routing.html
- Express Best Practices – https://expressjs.com/en/advanced/best-practice-performance.html

Prefer resources that align with TypeScript usage and modern Node.js.

---

## Maintenance Notes

- **Next Review Due**: 2026-03-31
- **Known Gaps**:
  - More concrete examples from backend tests can be added as they evolve.
  - Static hosting configuration may change if deployment strategy changes.
- **Enhancement Ideas**:
  - Extract the Express `app` into its own module for easier testing.
  - Add a dedicated `troubleshooting.md` for HTTP and routing issues as they arise.

Review this document during quarterly knowledge base maintenance and whenever we change significant Express wiring in `server.ts`.
