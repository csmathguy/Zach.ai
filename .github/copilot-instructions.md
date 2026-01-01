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

## Feature Workflow

**New features follow a structured lifecycle**: Plan → Tests → Dev → Retro

- **Planning**: Use `planner` agent or `/apr` prompt to draft APR in `work-items/<branch>/plan/apr.md`
- **Branch First**: Create feature branch (`git checkout -b feat/<name>`) immediately after APR approval, before any code edits
- **Test Strategy**: Use `tester` agent to design tests in `work-items/<branch>/tests/test-plan.md`
- **Implementation**: Use `developer` agent; track decisions in `work-items/<branch>/dev/implementation-notes.md`
- **Retrospective**: Use `retro` agent or `/retro` prompt to complete `work-items/<branch>/retro/retrospective.md`

**Quality Gates** (Enforce at Each Phase):

### Phase 2-3: Design & Structure

- ✅ Accessibility requirements defined (WCAG 2.1 AA minimum)
- ✅ Component structure follows SOLID principles
- ✅ API contracts documented with TypeScript interfaces

### Phase 4-5: Implementation

- ✅ **Mid-Implementation SOLID Review**: Check SRP, OCP compliance
- ✅ Remove dead code aggressively (don't let unused code linger)
- ✅ Unit tests written alongside implementation (not after)
- ✅ TypeScript strict mode: Zero errors at all times
- ✅ Performance baseline established for key operations

### Phase 6-7: Testing & Validation

- ✅ **Full SOLID Review**: SRP, OCP, LSP, ISP, DIP assessment
- ✅ Coverage ≥70% with focus on behavior, not just lines
- ✅ Accessibility tested (keyboard nav, screen readers, ARIA)
- ✅ act() warnings addressed immediately (never defer)
- ✅ All TypeScript errors resolved (`npm run typecheck` passes)

### Phase 8: Documentation & Cleanup

- ✅ Unused code removed (check imports, dead branches)
- ✅ README updated with new feature documentation
- ✅ Knowledge base updated for new technologies
- ✅ Architecture decisions recorded in implementation notes

**Agents**: `planner`, `tester`, `developer`, `retro` (hand off between phases)
**Skills**: `feature-workflow`, `apr-planning`, `retrospective`, `webapp-testing`
**Reference**: [knowledge-base/copilot/workflows-apr-retro.md](../knowledge-base/copilot/workflows-apr-retro.md)

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

**Zero Red Files Policy**: No TypeScript compilation errors allowed at any time during development. Run `npm run typecheck` frequently.

**SOLID Review Checkpoints**:

- **Mid-Implementation** (Phase 4-5): Review SRP and OCP compliance
- **Pre-Testing** (Phase 6): Full SOLID assessment before writing tests
- **Pre-Commit** (Phase 8): Final check for ISP and DIP violations

**Dead Code Removal**: Aggressively remove unused code immediately:

- Unused imports (ESLint will flag these)
- Unreferenced components or functions
- Commented-out code blocks
- Unused CSS/style definitions

**Testing Best Practices**:

- Test behavior, not implementation details
- Use `@jest/globals` → Import `@testing-library/jest-dom/jest-globals` (not standard)
- Address `act()` warnings immediately - never defer
- Document untestable code paths with comments explaining why
