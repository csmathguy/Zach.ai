# Node.js

> JavaScript runtime used to host the Zach.ai backend and all Node-based tooling.

**Current Version**: Node.js LTS (document the exact deployed version in ops notes)  
**Last Updated**: 2025-12-31  
**Status**: 🚧 In Progress (runtime in use · docs growing)

## Quick Links

- [Official Documentation](https://nodejs.org/docs)
- [Download / Releases](https://nodejs.org/en/download)
- [GitHub Repository](https://github.com/nodejs/node)

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

Node.js is the JavaScript runtime that executes all server-side and tooling code in this project. It is used to:

- Run the Express backend (see [backend/src/server.ts](../../backend/src/server.ts)).
- Execute TypeScript compilation, Jest tests, ESLint, and Prettier via npm scripts.
- Run Vite for the frontend dev server and production builds.
- Host the production process via PM2 using [ecosystem.config.js](../../ecosystem.config.js).

The entire Zach.ai stack is built on top of Node.js, with TypeScript providing type safety on both frontend and backend.

---

## Why We Use It

### Single-Language Stack

- JavaScript/TypeScript is used on both client and server.
- This simplifies mental models, hiring, and code sharing.

### Ecosystem and Tooling

- Rich ecosystem of libraries for HTTP servers (Express), testing (Jest, Supertest), linters (ESLint), formatters (Prettier), and bundlers (Vite).
- npm scripts provide a simple orchestration layer, as seen in [package.json](../../package.json) and [backend/package.json](../../backend/package.json).

### Operational Fit

- Works well with PM2 for process management on a single host.
- Easy to automate via PowerShell scripts in [scripts/](../../scripts/README.md).

---

## Official Resources

Relevant official docs:

- **API Docs (Latest LTS)** – https://nodejs.org/docs/latest-v20.x/api/
- **Guides** – https://nodejs.org/en/docs/guides
- **Security Releases** – https://nodejs.org/en/security

Use these for detailed runtime behavior and built-in modules; this document focuses on usage in Zach.ai.

---

## Version History

- We target a current **LTS** line (for example, Node 20 LTS at time of writing).
- The exact version used in production should be recorded in deployment/ops documentation.

When upgrading Node.js, follow the steps in [Migration Guides](#migration-guides).

---

## Installation & Setup

Recommended developer setup:

- Use a Node version manager (`nvm`, `fnm`, or `nvs`) to install the correct LTS version.
- Keep your local version in sync with the version used in production.

Initial project setup:

1. Install Node.js LTS via your chosen version manager.
2. Clone the repository.
3. From the repo root, run `npm install` to install root dev dependencies.
4. Run `npm run setup` to install frontend and backend dependencies.

---

## Core Concepts

Key Node.js concepts relevant to Zach.ai:

- **Single-threaded Event Loop** – Node processes requests asynchronously; avoid long blocking operations on the main thread.
- **Asynchronous I/O** – Use async/await (Promises) for file, network, and other I/O.
- **Module Systems** – Backend uses CommonJS (`type: "commonjs"` in [backend/package.json](../../backend/package.json)), while tooling and frontend configs may use ES modules.
- **Process & Environment** – `process.env` provides configuration such as `PORT` and `NODE_ENV`, used in [backend/src/server.ts](../../backend/src/server.ts).

Understanding these helps when debugging, tuning performance, or extending the backend.

---

## Configuration

Common Node-related configuration aspects in this repo:

- **Environment Variables** – `PORT`, `NODE_ENV`, and optional variables for static frontend directory.
- **Process Management** – PM2 reads [ecosystem.config.js](../../ecosystem.config.js) to start Node processes with the right script and env.
- **Windows PowerShell** – Root scripts like `deploy` and `start:main` call PowerShell files in [scripts/](../../scripts/README.md), which in turn invoke Node commands.

Avoid putting secrets directly in code; prefer environment variables or host-level configuration.

---

## Best Practices

Node-specific guidelines for Zach.ai:

- **Avoid Blocking the Event Loop** – Don’t perform CPU-heavy or synchronous I/O operations in hot request paths.
- **Use Async/Await** – Prefer async/await over callbacks for readability and error handling.
- **Graceful Shutdown** – When integrating with PM2 or future orchestration, ensure the app can respond to termination signals if needed.
- **Consistent Env Handling** – Use `NODE_ENV` to branch behavior (development vs production) in a small, controlled way (e.g., CORS, logging).

---

## Common Patterns

From a Node.js perspective, typical backend patterns include:

- **Express App as the Entry Point** – A single `server.ts` that wires middleware and routes.
- **Utility Modules** – Reusable helpers in `backend/src/utils/` to keep `server.ts` slim.
- **Scripted Tooling** – npm scripts in [backend/package.json](../../backend/package.json) and [package.json](../../package.json) orchestrate builds, tests, and validation.

As the backend grows, extracting routers and services into separate modules will keep the Node entry point simple and maintainable.

---

## TypeScript Integration

TypeScript is compiled to Node-targeted JavaScript:

- Backend uses `tsc` with a CommonJS target, emitting to `dist/`.
- `ts-node-dev` runs `src/server.ts` directly in development.

For more on TypeScript configuration, see [knowledge-base/typescript/README.md](../typescript/README.md).

---

## ts-node-dev (MVP)

`ts-node-dev` is used to run the backend TypeScript entrypoint directly in development with automatic restarts.

**Official Documentation**: https://github.com/wclr/ts-node-dev

### Why We Use It Here

- Lets us run `backend/src/server.ts` without a separate `tsc` build step during development.
- Watches for file changes and restarts the server automatically, speeding up the feedback loop.
- Integrates cleanly with our existing TypeScript config in [backend/tsconfig.json](../../backend/tsconfig.json).

### Where It’s Configured

- Declared as a devDependency in [backend/package.json](../../backend/package.json).
- Used in the backend `dev` script:
  - `"dev": "ts-node-dev --respawn --transpile-only src/server.ts"`

### How We Use It (MVP)

- From the repo root, `npm run dev` ultimately runs `npm run dev --prefix backend`, which invokes ts-node-dev for the backend.
- Developers can also run `npm run dev --prefix backend` directly when working only on the backend.

In the future, we can document any ts-node-dev flags we tune (e.g., polling, ignore patterns) if the default behavior needs refinement.

---

## Testing

Node runs the entire backend testing toolchain:

- **Jest** – Executes tests defined in `backend/src/__tests__/`.
- **Supertest** – Used from Jest to make HTTP requests to the Express app.

Tests are executed via npm scripts (`test`, `test:watch`, `test:coverage`, `test:ci`) defined in [backend/package.json](../../backend/package.json).

---

## Performance

Current performance needs are modest, but Node gives us:

- Efficient I/O handling for lightweight HTTP APIs.
- Integration with PM2 for process restarts and clustering (if needed later).

Metrics utilities in [backend/src/utils/metrics.ts](../../backend/src/utils/metrics.ts) help observe runtime behavior (uptime, memory, response times).

---

## Security

Node security considerations include:

- **Runtime Updates** – Stay on supported LTS lines and apply security patches.
- **Dependency Hygiene** – Use tools like `npm audit` and Dependabot to track vulnerabilities.
- **Environment Isolation** – Separate configurations for development, staging, and production.

Express-specific security (e.g., headers, rate limiting) is documented in [knowledge-base/express/README.md](../express/README.md).

---

## Troubleshooting

Common Node issues and checks:

- `node` command not found – Ensure Node is installed and on PATH.
- Different behavior across machines – Verify everyone uses the same Node LTS version.
- Port already in use – Another process may be running the backend; stop it or change ports.
- Script failures – Run commands from the repo root or appropriate package directory; ensure dependencies are installed.

---

## Migration Guides

When upgrading to a new Node.js LTS:

1. Review the Node.js changelog and migration notes for breaking changes.
2. Update your version manager and any server installations.
3. Run `npm run validate` at the root.
4. Run the dev servers and run through key flows.
5. Deploy to staging first and monitor logs and metrics.

---

## Comparison with Alternatives

At selection time, Node.js was favored over alternatives like Python, Go, or .NET because:

- It supports a single TypeScript-based stack.
- It integrates directly with Vite, Jest, and other JS tooling.
- It works smoothly with PM2 and simple Windows-hosted deployments.

---

## Learning Resources

- Node.js Docs – https://nodejs.org/en/docs
- Guides – https://nodejs.org/en/docs/guides

Favor resources that use modern JavaScript/TypeScript, async/await, and Express-style APIs.

---

## Maintenance Notes

- **Next Review Due**: 2026-03-31
- **Known Gaps**:
  - Exact production Node.js version should be documented in deployment notes.
- **Enhancement Ideas**:
  - Add PM2 integration notes and references to [knowledge-base/pm2/](../pm2/README.md).
  - Add a quick-reference with common Node commands and version manager tips.
