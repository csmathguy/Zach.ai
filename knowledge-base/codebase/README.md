# Codebase Knowledge Base

Documentation about this repository's architecture, patterns, and conventions.

## Repository Overview

TypeScript web application monorepo with a React frontend and Node/Express backend.

### Tech Stack (Current)

- **Frontend**: Vite + React + TypeScript (strict), DDD-inspired structure (`app/`, `features/`, `shared/`)
- **Backend**: Express + TypeScript (Node.js) with health and metrics endpoints
- **Testing**: Jest + Testing Library (frontend) + Supertest (backend)
- **Code Quality**: ESLint (strict, typescript-eslint) + Prettier + TypeScript (strict mode)
- **Process Manager**: PM2
- **Deployment**: Snapshot-based local hosting from `deploy/current`
- **Git Hooks**: Husky + lint-staged (pre-commit validation)

## Contents

- **[development-guide.md](development-guide.md)** - **START HERE** - Principles, plus the **Current Codebase Stack** section
- **[structure.md](structure.md)** - Repository structure and file organization
- **[validation.md](validation.md)** - Code quality validation workflow

## Key Directories

```
project-root/
├── frontend/              # Vite frontend app
├── backend/               # Express backend API
├── deploy/current/        # Production snapshot
├── scripts/               # PowerShell automation
├── knowledge-base/        # All documentation
├── .github/               # Copilot config, workflows, templates
├── ecosystem.config.js    # PM2 process definitions
└── package.json           # Root npm scripts
```

## Development Principles

All code must follow:

1. **SOLID Principles** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
2. **DRY** (Don't Repeat Yourself) - Eliminate code duplication
3. **KISS** (Keep It Simple, Stupid) - Prefer simplicity over complexity
4. **TypeScript Strict Mode** - Type-safe code with strict compilation
5. **Enterprise React Patterns** - Component composition, custom hooks, proper state management
6. **Gang of Four Design Patterns** - Factory, Builder, Strategy, Observer, etc.
7. **Test-Driven Quality** - 70%+ test coverage minimum
8. **Automated Validation** - Pre-commit hooks enforce quality standards

## Code Quality Standards

- ✅ **Type-safe**: TypeScript strict mode enabled
- ✅ **Linted**: ESLint strict + stylistic rules
- ✅ **Formatted**: Prettier with consistent style
- ✅ **Tested**: Jest unit tests with 70%+ coverage
- ✅ **Documented**: Clear comments and JSDoc
- ✅ **Validated**: Husky pre-commit hooks

## Workflow

```bash
# 1. Development
npm run dev

# 2. Validation (runs automatically on commit)
npm run validate        # TypeScript + ESLint + Prettier

# 3. Testing
npm test               # Run all tests
npm run test:coverage  # With coverage report

# 4. Deployment
npm run deploy         # Snapshot to deploy/current/
```

## Getting Started

1. **Read**: [Development Guide](development-guide.md) - Comprehensive principles and patterns
2. **Understand**: [Structure](structure.md) - Repository organization
3. **Validate**: [Validation Guide](validation.md) - Quality assurance workflow

## Related Documentation

- [Development Guide](development-guide.md) - **Essential reading for all developers**
- [Deployment](../deployment/README.md) - Deployment process and PM2
- [ESLint](../eslint/README.md) - Linting configuration and rules
- [Prettier](../prettier/README.md) - Code formatting standards
- [Jest](../jest/README.md) - Testing framework and best practices
- [PM2](../pm2/README.md) - Process management
- [PM2 Management](../pm2/README.md)
- [Copilot Setup](../copilot/README.md)
