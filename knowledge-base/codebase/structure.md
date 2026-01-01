# Repository Structure

Complete breakdown of the Zach.ai repository organization.

## Root Level

```
Zach.ai/
├── .github/               # GitHub and Copilot configuration
├── .husky/                # Git hooks (pre-commit validation)
├── backend/               # Express backend (TypeScript)
├── frontend/              # Vite frontend (React + TypeScript)
├── deploy/                # Production snapshot directory
├── knowledge-base/        # Consolidated documentation
├── scripts/               # PowerShell automation scripts
├── .gitignore             # Git ignore patterns (comprehensive)
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore patterns
├── ecosystem.config.js    # PM2 process configuration
├── eslint.config.mjs      # ESLint flat config (strict + stylistic)
├── mcp.json               # Model Context Protocol config
└── package.json           # Root npm scripts and dev dependencies
```

**Root Dependencies:**

- ESLint 9.39+ with typescript-eslint (strict + stylistic)
- Prettier 3.7+ (exact version)
- Husky 9.1+ (pre-commit hooks)
- lint-staged 16.2+ (staged file validation)
- Concurrently (run frontend + backend simultaneously)

## .github/

Configuration for GitHub features and Copilot customization.

```
.github/
├── agents/                    # Custom Copilot agents
│   └── planner.agent.md
├── instructions/              # Technology-specific Copilot instructions
│   ├── typescript.instructions.md  # TypeScript guidelines
│   ├── react.instructions.md       # React component patterns
│   └── testing.instructions.md     # Jest + Testing Library patterns
├── prompts/                   # Reusable Copilot prompts
│   └── explain.prompt.md
├── workflows/                 # GitHub Actions CI
│   └── ci.yml
├── ISSUE_TEMPLATE/            # Issue templates
│   ├── bug_report.yml
│   └── feature_request.yml
├── copilot-instructions.md    # Workspace Copilot instructions
├── CODEOWNERS                 # Code ownership
├── SECURITY.md                # Security policy
├── FUNDING.yml                # Funding info
├── dependabot.yml             # Dependency updates
├── pull_request_template.md   # PR template
└── tool-sets.jsonc            # Copilot tool sets

```

## Frontend

Vite + React + TypeScript single-page application.

```
frontend/
├── src/
│   ├── main.tsx                # React entry point, mounts App and imports global styles
│   ├── styles.css              # Global base styles and utility classes
│   ├── app/
│   │   ├── App.tsx             # Application shell (layout, header, footer)
│   │   └── App.module.css      # CSS Module for app-level styling
│   ├── features/
│   │   └── dashboard/
│   │       ├── Dashboard.tsx       # Dashboard feature (three cards layout)
│   │       ├── Dashboard.module.css# CSS Module for dashboard layout
│   │       └── dashboard-api.ts    # Backend integration (health + metrics via fetch)
│   ├── shared/
│   │   └── debugger.ts         # DEBUGGER helper exposed on window.APP_DEBUGGER
│   ├── utils/
│   │   └── formatters.ts       # Utility functions
│   └── __tests__/              # Jest tests (unit + React components)
│       ├── App.test.tsx
│       └── formatters.test.ts
├── __mocks__/                  # Jest mocks
│   └── fileMock.js             # Asset mock for tests
├── index.html                  # HTML template with React root div
├── jest.config.js              # Jest configuration
├── jest.setup.ts               # Testing Library setup
├── package.json                # Frontend dependencies
├── tsconfig.json               # TypeScript config (strict mode)
└── vite.config.ts              # Vite configuration (React plugin enabled)
```

**Dependencies:**

- Vite 5.0+ (dev server, build tool)
- TypeScript 5.6+ (strict mode)
- Jest + Testing Library (unit tests)
- ESLint + Prettier (code quality)

**Testing:**

- Jest with jsdom environment
- @testing-library/react (ready for React components)
- Coverage threshold: 70%+

**Ports:**

- Dev: 5173 (Vite dev server with HMR)
- Production: Served by backend on 8080

## Backend

Express + TypeScript API server.

```
backend/
├── src/
│   ├── server.ts               # Express app with API routes
│   ├── utils/
│   │   └── metrics.ts          # Metrics utilities
│   └── __tests__/              # Jest tests
│       ├── server.test.ts
│       └── metrics.test.ts
├── dist/                       # Compiled JavaScript (gitignored)
├── jest.config.js             # Jest configuration
├── package.json               # Backend dependencies
└── tsconfig.json              # TypeScript config (strict mode)
```

**API Endpoints:**

- `GET /health` - Health check (JSON response)
- `GET /api/metrics` - Server metrics (uptime, response time, memory)
- Production: Serves built frontend static files

**Dependencies:**

- Express 4.19+ (web framework)
- TypeScript 5.6+ (strict mode)
- Jest + Supertest (unit tests)
- ts-node-dev (development)

**Testing:**

- Jest with Node environment
- Supertest for API testing
- Coverage threshold: 70%+

**Ports:**

- Dev: 3000 (ts-node-dev with auto-restart)
- Production: 8080 (Node.js from dist/)

## Deploy

Production snapshot directory (gitignored).

```
deploy/
└── current/               # Latest deployed version
    ├── frontend/
    │   └── dist/          # Built frontend assets
    └── backend/
        ├── dist/          # Compiled backend
        ├── package.json   # Production dependencies
        └── node_modules/  # Installed dependencies
```

## Scripts

PowerShell automation for deployment and PM2 management.

```
scripts/
├── main-deploy.ps1        # Build, snapshot, and deploy
├── main-start.ps1         # Start main process
├── main-reload.ps1        # Reload main process
├── main-update.ps1        # Git pull and redeploy
├── staging-start.ps1      # Start staging via PM2
├── setup-auto-start.ps1   # Configure Task Scheduler
└── README.md              # Scripts documentation
```

## Knowledge Base

Consolidated documentation for tools, frameworks, and this codebase.

```
knowledge-base/
├── codebase/                    # This repository's documentation
│   ├── README.md                # Overview and quick links
│   ├── development-guide.md     # **ESSENTIAL** - SOLID, DRY, KISS, patterns
│   ├── structure.md             # This file - repository structure
│   └── validation.md            # Code quality workflow
├── deployment/                  # Deployment guides
│   ├── README.md
│   ├── deployment.md
│   ├── quick-reference.md
│   └── testing-checklist.md
├── eslint/                      # ESLint configuration and best practices
│   └── README.md                # 400+ line comprehensive guide
├── prettier/                    # Prettier formatting standards
│   └── README.md                # 400+ line comprehensive guide
├── jest/                        # Jest testing framework
│   └── README.md                # 470+ line comprehensive guide
├── pm2/                         # PM2 process manager
│   ├── README.md
│   ├── setup.md
│   ├── windows.md
│   ├── best-practices.md
│   ├── references.md
│   ├── terms.md
│   └── examples/
│       └── ecosystem.config.js
├── copilot/                     # GitHub Copilot documentation
│   ├── README.md
│   ├── agent-skills.md
│   ├── best-practices.md
│   ├── setup.md
│   ├── skills.md
│   ├── structure.md
│   ├── summary.md
│   ├── references.md
│   ├── tool-sets.jsonc
│   ├── agents/
│   ├── extension-dev/
│   ├── mcp-servers/
│   ├── prompts/
│   └── tools/
├── anthropic/                   # Claude/Anthropic documentation
│   ├── README.md
│   ├── best-practices.md
│   ├── references.md
│   ├── skills.md
│   └── summary.md
└── README.md                    # Knowledge base index
```

**Key Documentation:**

- **[development-guide.md](development-guide.md)** - Start here! SOLID, DRY, KISS, TypeScript, React, Design Patterns
- **[validation.md](validation.md)** - Code quality validation workflow
- **[eslint/README.md](../eslint/README.md)** - Linting configuration
- **[prettier/README.md](../prettier/README.md)** - Formatting standards
- **[jest/README.md](../jest/README.md)** - Testing best practices

## Configuration Files

### ecosystem.config.js

PM2 process definitions for staging and production.

**Processes:**

- `staging-frontend` - Vite dev server (5173)
- `staging-backend` - ts-node-dev backend (3000)
- `main` - Production from deploy/current (8080)

### package.json (root)

Orchestrates frontend and backend builds.

**Key Scripts:**

- `dev` - Run both dev servers with hot reload
- `deploy` - Build and deploy to production
- `start:main` - Start production process
- `build` - Build both projects
- `setup` - Install all dependencies

### mcp.json

Template for Model Context Protocol server configuration.

## Ignored Files

See `.gitignore` for complete list:

- `node_modules/`
- `dist/`
- `deploy/`
- `*.log`
- `.env*`
- IDE configs

## Port Allocation

| Service      | Port | Environment |
| ------------ | ---- | ----------- |
| Frontend Dev | 5173 | Development |
| Backend Dev  | 3000 | Development |
| Backend Prod | 8080 | Production  |

## Build Artifacts

**Frontend:**

- Source: `frontend/src/`
- Build: `frontend/dist/`
- Deployed: `deploy/current/frontend/dist/`

**Backend:**

- Source: `backend/src/`
- Build: `backend/dist/`
- Deployed: `deploy/current/backend/dist/`

## Environment Variables

Used in backend (`backend/src/server.ts`):

- `NODE_ENV` - development | production
- `PORT` - Server port (3000 dev, 8080 prod)
- `FRONTEND_DIR` - Override frontend static directory

## Related Documentation

- [Architecture](architecture.md) - System design and runtime architecture
- [Development](development.md) - Practical dev workflow and commands
- [Development Guide](development-guide.md) - Principles, patterns, and Current Codebase Stack
- [Deployment](../deployment/README.md) - Deployment and hosting guide
