# Copilot Instructions (Workspace)

## Knowledge Base

**IMPORTANT**: Reference our comprehensive knowledge base before implementing:

- **[Development Guide](../knowledge-base/codebase/development-guide.md)** - SOLID, DRY, KISS principles, TypeScript/React patterns, design patterns
- **[Codebase Structure](../knowledge-base/codebase/structure.md)** - Repository organization and architecture
- **[Validation Workflow](../knowledge-base/codebase/validation.md)** - Pre-commit checks, testing requirements

### Technology Documentation

- **[Jest Testing](../knowledge-base/jest/README.md)** - Testing framework, patterns, mocking
- **[ESLint](../knowledge-base/eslint/README.md)** - Linting configuration and rules
- **[Prettier](../knowledge-base/prettier/README.md)** - Code formatting standards
- **[PM2](../knowledge-base/pm2/README.md)** - Process management

**Status of Docs**: Check [ideas/knowledge-base-updates.md](../ideas/knowledge-base-updates.md) for complete list and documentation status.

## General Principles

- Prefer explicit plans before large edits
- Use `#tool:<name>` calls for deterministic actions
- Respect security: never auto-approve terminal commands unless whitelisted
- Keep changes minimal, align with existing style, and update docs when needed
- For multi-layer app (frontend/backend), propose isolated changes per layer and avoid cross-layer edits unless requested

## Code Quality

- Follow TypeScript strict mode
- All code must pass `npm run validate` (typecheck, lint, format, test)
- Write tests for new functionality (70%+ coverage target)
- Reference development guide for SOLID principles and design patterns
- Use language-specific instructions (`.github/instructions/`) for detailed guidelines
