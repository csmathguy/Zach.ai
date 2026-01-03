# Development Phase: Task Breakdown & Execution

**Feature**: [Feature Name]  
**Developer**: [Developer Name/Agent]  
**Started**: [YYYY-MM-DD]  
**Status**: 🟡 In Progress

---

## Overview

This document tracks the development phase where the approved architecture and test plan are implemented. The developer agent breaks down the work into discrete tasks, implements them following TDD (RED-GREEN-REFACTOR), and tracks progress.

**Development Approach**: Test-Driven Development (TDD)

- Write test FIRST (RED - failing)
- Implement minimum code (GREEN - passing)
- Refactor while maintaining GREEN
- Extract interfaces after patterns emerge

---

## Task Summary

| ID                                   | Task Name                       | Priority    | Status         | Test Suites | Completion |
| ------------------------------------ | ------------------------------- | ----------- | -------------- | ----------- | ---------- |
| [task-001](task-001-example-task.md) | Setup domain models             | 🔴 Critical | ✅ Complete    | -           | 2026-01-03 |
| [task-002](task-002-example-task.md) | Implement repository interfaces | 🔴 Critical | 🟢 In Progress | TS-001      | -          |
| [task-003](task-003-example-task.md) | Create application services     | 🟠 High     | ⚪ Not Started | TS-002      | -          |
| [task-004](task-004-example-task.md) | Build API endpoints             | 🟠 High     | ⚪ Not Started | TS-003      | -          |

**Legend**:

- ⚪ Not Started
- 🟢 In Progress
- ✅ Complete
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🔵 Low

---

## Task Breakdown Process

**Step 1: Analyze Inputs**

- Read APR for feature requirements and acceptance criteria
- Read Architecture README and ADRs for technical decisions
- Read Test Plan for test requirements and coverage targets
- Identify all interfaces/contracts that need implementation

**Step 2: Create Task Files**
For each discrete unit of work:

1. Create `dev/task-NNN-description.md` file
2. Reference ADRs that guide implementation
3. Reference test suites (TS-001, TS-002) that verify the task
4. Define completion criteria
5. Assign priority based on dependencies

**Step 3: Execute Tasks**

- Work on one task at a time (mark 🟢 In Progress)
- Follow TDD cycle: RED → GREEN → REFACTOR
- Run `npm run validate` frequently (typecheck, lint, format, test)
- Update task file with progress, decisions, issues
- Mark ✅ Complete when all criteria met

---

## Development Workflow

### Phase 1: Domain Layer (Pure TypeScript)

- Create domain models (User, Thought, Project, Action)
- Test-driven: Write tests first, implement models
- No framework dependencies
- High test coverage (90%+)

### Phase 2: Infrastructure Layer (Database/External)

- Implement repository interfaces with Prisma/database
- Integration tests with in-memory database
- Mapper functions (toDomain/toPersistence)
- Error handling and validation

### Phase 3: Application Layer (Services)

- Business logic orchestration
- Uses repository interfaces (dependency injection)
- Unit tests with mocked repositories
- Service composition

### Phase 4: API Layer (HTTP Endpoints)

- Express route handlers
- Request validation
- Response serialization
- E2E tests with Supertest

---

## Quality Gates

### Mid-Implementation Checkpoints

- ✅ TypeScript strict mode: Zero errors (`npm run typecheck`)
- ✅ SOLID review: SRP and OCP compliance
- ✅ Remove dead code: Unused imports, unreferenced functions
- ✅ Test coverage: 70%+ overall, 90%+ domain

### Pre-Commit Validation

- ✅ All tests pass: `npm test`
- ✅ Full SOLID assessment: SRP, OCP, LSP, ISP, DIP
- ✅ ESLint clean: `npm run lint`
- ✅ Prettier formatted: `npm run format`
- ✅ No act() warnings: React Testing Library warnings resolved
- ✅ Coverage thresholds met: Per-layer targets

---

## Dependencies Tracking

| Package          | Version | Purpose       | Task     | Status     | KB Docs                                                      |
| ---------------- | ------- | ------------- | -------- | ---------- | ------------------------------------------------------------ |
| `@prisma/client` | 7.2.0   | Database ORM  | task-002 | ✅ Active  | [prisma/README.md](../../../knowledge-base/prisma/README.md) |
| `uuid`           | 10.0.0  | ID generation | task-001 | ❌ Removed | Replaced with nanoid                                         |
| `nanoid`         | 5.0.9   | ID generation | task-001 | ✅ Active  | -                                                            |

**Status Legend**:

- ✅ Active - Currently in use
- ⏳ Pending - To be added
- ❌ Removed - No longer used

---

## Key Decisions & Rationale

| Decision            | Rationale                              | ADR Reference                                            | Task     |
| ------------------- | -------------------------------------- | -------------------------------------------------------- | -------- |
| Use Prisma for ORM  | TypeScript-first, excellent migrations | [ADR-001](../architecture/adr-001-prisma.md)             | task-002 |
| Repository Pattern  | Abstracts database, supports testing   | [ADR-002](../architecture/adr-002-repository-pattern.md) | task-002 |
| WAL mode for SQLite | Better concurrency                     | [ADR-003](../architecture/adr-003-database-setup.md)     | task-002 |

---

## Risks & Issues

| Risk/Issue                | Impact | Status      | Mitigation                                | Task     |
| ------------------------- | ------ | ----------- | ----------------------------------------- | -------- |
| SQLite concurrency limits | Medium | ⚠️ Active   | Use maxWorkers=1 in Jest, document in ADR | task-002 |
| Prisma 7 adapter required | Low    | ✅ Resolved | Installed @prisma/adapter-libsql          | task-002 |

**Status Legend**:

- ⚠️ Active - Currently monitoring
- ✅ Resolved - Issue fixed
- ❌ Blocked - Waiting on external factor

---

## Manual Verification Checklist

After all tasks complete, before marking feature done:

### Functional Testing

- [ ] Health check endpoint returns 200 OK: `curl http://localhost:3000/health`
- [ ] Database migrations applied: `npx prisma migrate status`
- [ ] Seed data loads: `npm run db:seed --prefix backend`
- [ ] Frontend connects to backend: Manual browser test
- [ ] All user workflows from APR tested manually

### Code Quality

- [ ] All TypeScript errors resolved: `npm run typecheck` (both frontend + backend)
- [ ] ESLint clean: `npm run lint`
- [ ] Prettier formatted: `npm run format:check`
- [ ] All tests pass: `npm test` (both frontend + backend)
- [ ] Coverage meets targets: Check `coverage/` reports

### Regression Testing

- [ ] Existing features still work (dashboard, health check)
- [ ] No breaking changes to contracts/interfaces
- [ ] Database schema changes backward compatible (or migration documented)

---

## Handoff to Retrospective Phase

**When to Hand Off**: All tasks complete, all quality gates passed, manual verification checklist complete

**What Retro Agent Receives**:

- This README.md with all tasks marked ✅ Complete
- All individual task-NNN-\*.md files with implementation details
- Updated dependencies-added.md (if dependencies changed)
- Code ready for final review and retrospective

**Outstanding Items**:

- [List any known issues, tech debt, or follow-up items]
- [Document any deviations from architecture or test plan]

---

## Related Documentation

- **APR**: [../plan/apr.md](../plan/apr.md) - Feature requirements
- **Architecture**: [../architecture/README.md](../architecture/README.md) - Technical design
- **Test Plan**: [../tests/test-plan.md](../tests/test-plan.md) - Testing strategy
- **Retrospective**: [../retro/retrospective.md](../retro/retrospective.md) - Post-feature review

---

## Task Files

All individual task files are at root level:

- [task-001-example-task.md](task-001-example-task.md)
- [task-002-example-task.md](task-002-example-task.md)
- [task-003-example-task.md](task-003-example-task.md)
- (Add more as needed)
