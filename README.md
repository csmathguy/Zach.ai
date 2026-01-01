# TypeScript Web Monorepo Template

TypeScript monorepo with a Vite + React frontend, an Express + TypeScript backend, strong testing (Jest + Playwright), and a consolidated knowledge base. Features a built-in **Codebase Analysis Dashboard** for monitoring test coverage and system health.

## Features

### 🎯 Codebase Analysis Dashboard

Built-in web dashboard for monitoring code quality and system health:

- **Coverage Tab**: View Jest test coverage for frontend and backend with interactive charts
- **Health Tab**: Real-time API health checks, uptime, and system metrics
- **Visual Analytics**: Interactive charts powered by Recharts
- **Color-Coded Indicators**: Instant visibility of risk levels (green >80%, yellow 60-80%, red <60%)

Access at: http://localhost:5173/codebase-analysis (dev) or http://localhost:8080/codebase-analysis (production)

### 🧪 Comprehensive Testing

- **92%+ Test Coverage**: 243 tests across frontend and backend
- **Unit Tests**: Jest + Testing Library (frontend), Jest + Supertest (backend)
- **E2E Tests**: Playwright for critical user workflows
- **CI Integration**: Automated coverage enforcement (70% threshold)

### 🛠️ Developer Experience

- **TypeScript Strict Mode**: Zero compilation errors policy
- **Code Quality**: ESLint (strict + stylistic) + Prettier
- **Git Hooks**: Pre-commit validation via Husky + lint-staged
- **Knowledge Base**: Comprehensive documentation for all technologies

## Tech Stack

- **Frontend**: Vite 5, React 18, TypeScript (strict), Recharts
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

### Running Tests

```bash
# Run all unit tests (frontend + backend)
npm test

# Run tests with coverage reports
npm run test:coverage

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

### Coverage Dashboard

After running tests with coverage, view the interactive dashboard:

1. **Generate Coverage Data**:

   ```bash
   npm run coverage:frontend  # Generate frontend coverage JSON
   npm run coverage:backend   # Generate backend coverage JSON
   npm run coverage:generate  # Generate both + copy to public folder
   ```

2. **View Dashboard**: Navigate to http://localhost:5173/codebase-analysis

The dashboard displays:

- **Coverage Tab**: Frontend/Backend test coverage with file-by-file breakdown
- **Health Tab**: API status, uptime, memory usage, and response times
- **Interactive Charts**: Bottom 5 files by coverage, gauge visualizations
- **Search & Sort**: Find specific files and sort by any metric

### Coverage Thresholds

All code must meet these minimum coverage requirements:

- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

CI builds will fail if coverage drops below these thresholds. Current coverage: **92.45%** (243 tests passing)

## Project Structure

````
Zach.ai/
├── frontend/               # Vite + React application
│   ├── src/
│   │   ├── app/           # Application shell
│   │   ├── features/      # Feature modules
│   │   │   ├── home/                    # Landing page
│   │   │   └── codebase-analysis/       # Dashboard feature
│   │   │       ├── coverage/            # Coverage module
│   │   │       ├── health/              # Health module
│   │   │       └── shared/              # Shared components
### Codebase Documentation
- [Development Guide](knowledge-base/codebase/development-guide.md) – SOLID, DRY, KISS principles
- [Structure](knowledge-base/codebase/structure.md) – Repository organization
- [Validation](knowledge-base/codebase/validation.md) – Code quality workflow

### Technology Documentation
- [Jest](knowledge-base/jest/README.md) – Testing framework (470+ lines)
- [ESLint](knowledge-base/eslint/README.md) – Linting configuration (400+ lines)
- [Prettier](knowledge-base/prettier/README.md) – Code formatting (400+ lines)
- [React](knowledge-base/react/README.md) – Component patterns
- [TypeScript](knowledge-base/typescript/) – Type system best practices
- [Playwright](knowledge-base/playwright/README.md) – E2E testing
- [PM2](knowledge-base/pm2/README.md) – Process management

### GitHub Copilot
- [Workflows](knowledge-base/copilot/workflows-apr-retro.md) – Feature workflow (APR + Retrospectives)
- [Skills](knowledge-base/copilot/skills.md) – Custom agent skills
- [Setup](knowledge-base/copilot/setup.md) – Configuration guide

Start at [knowledge-base/README.md](knowledge-base/README.md) for a complete index.

## Development Workflow

### Adding New Features

1. **Plan**: Create APR (Architecture & Planning Review) in `work-items/<feature>/plan/apr.md`
2. **Branch**: Create feature branch: `git checkout -b feat/<name>`
3. **Test**: Design test strategy in `work-items/<feature>/tests/test-plan.md`
4. **Develop**: Implement with TDD approach, track in `work-items/<feature>/dev/implementation-notes.md`
5. **Validate**: Run `npm run validate` and `npm run test:coverage`
6. **Retrospective**: Complete `work-items/<feature>/retro/retrospective.md`

SeeDeployment

### Development
```bash
npm run dev  # Frontend (5173) + Backend (3000)
````

### Production Build

```bash
npm run build            # Build both projects
npm run deploy          # Build + snapshot to deploy/current
npm run start:main      # Start production via PM2
```

### PM2 Process Management

```bash
pm2 list                # View running processes
pm2 logs main          # View production logs
pm2 reload main        # Zero-downtime reload
pm2 stop main          # Stop process
```

See [knowledge-base/deployment/](knowledge-base/deployment/) for detailed deployment guides.

## Reusing This Template

To reuse this setup for a new project:

1. **Update Metadata**: Edit `package.json` files (name, description, version)
2. **Update Branding**: Change frontend header, dashboard copy, and page titles
3. **Customize Routes**: Modify backend API endpoints starting from `/health` and `/api/metrics`
4. **Extend Features**: Add new feature modules under `frontend/src/features/`
5. **Update Documentation**: Keep knowledge base current with your domain

### Key Features to Leverage

- ✅ **Dashboard Framework**: Reuse tab structure for other modules
- ✅ **Testing Setup**: Jest + Testing Library + Playwright configured
- ✅ **Coverage Infrastructure**: JSON generation + dashboard visualization
- ✅ **CI Pipeline**: GitHub Actions with coverage enforcement
- ✅ **Code Quality**: ESLint + Prettier + Husky pre-configured

This repository is a production-ready starting point for TypeScript monorepos with a React SPA and Node/Express API, featuring built-in monitoring, comprehensive testing, and extensive documentation.

## Contributing

See [work-items/](work-items/) for feature development tracking and [knowledge-base/copilot/workflows-apr-retro.md](knowledge-base/copilot/workflows-apr-retro.md) for the APR + Retrospective workflow.

## License

[Add your license here]
│ │ └── utils/ # Utilities
│ └── coverage/ # Generated coverage reports
├── e2e/ # Playwright E2E tests
├── knowledge-base/ # Documentation
├── scripts/ # Deployment & automation
├── deploy/ # Production snapshots
└── work-items/ # Feature development tracking

```

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
```
