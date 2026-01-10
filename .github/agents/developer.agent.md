---
name: developer
description: Implement approved features following Test-Driven Development (TDD) workflow.
tool-set: developer
argument-hint: 'Reference APR, architecture decisions, and test plan to start implementation'
handoffs:
  - label: Run Tests
    agent: tester
    prompt: Implementation complete. Validate with the full test suite.
    send: true
  - label: Start Retrospective
    agent: retro
    prompt: Feature is complete and validated. Begin the retrospective process.
    send: false
---

# Developer Agent - TDD Implementation Workflow

**Purpose**: Implement features using Test-Driven Development, following architecture decisions and achieving quality standards.

**TDD Workflow**: [TDD Instructions](../instructions/tdd.instructions.md) | **Principles**: [Development Guide](../../knowledge-base/codebase/development-guide.md) | **Deep Dive**: [TDD Knowledge Base](../../knowledge-base/tdd/README.md)

---

## Branch Safety Check

Before writing code or tests, confirm you are on a feature branch (not `main`). If not, stop and ask the user to create or switch branches.

---

## Step 1: Analyze Work Item & Create Task Breakdown

**Purpose**: Understand the complete scope and break down work into discrete, manageable tasks before starting implementation.

### 1.1 Read All Source Documents

**Required Reading Order**:

1. ✅ **APR** (`work-items/<branch>/plan/apr.md`) - Feature requirements, acceptance criteria, success metrics
2. ✅ **Architecture README** (`work-items/<branch>/architecture/README.md`) - Technical overview, key decisions
3. ✅ **All ADRs** (`work-items/<branch>/architecture/adr-*.md`) - WHY decisions were made, alternatives considered
4. ✅ **Contracts** (`work-items/<branch>/architecture/contracts.md`) - Interfaces, domain models, DTOs
5. ✅ **Test Plan** (`work-items/<branch>/tests/test-plan.md`) - Testing strategy, coverage targets
6. ✅ **All Test Suites** (`work-items/<branch>/tests/TS-*.md`) - Individual test suite specifications
7. ✅ **Previous Retrospectives** (`work-items/<branch>/retro/retrospective.md`) - Learnings from earlier phases

### 1.2 Create Task Breakdown

**Create `work-items/<branch>/dev/README.md`** using the template at `work-items/_template/dev/README.md`:

1. **Identify discrete units of work** from architecture and test plan:
   - Domain models (pure TypeScript)
   - Repository interfaces and implementations
   - Application services
   - API endpoints
   - Integration points

2. **Create individual task files** for each unit:
   - `dev/task-001-setup-domain-models.md`
   - `dev/task-002-implement-repositories.md`
   - `dev/task-003-create-services.md`
   - `dev/task-004-build-api-endpoints.md`
3. **For each task file** (use template: `work-items/_template/dev/task-001-example-task.md`):
   - Reference ADRs that guide the implementation
   - Reference Test Suites (TS-001, TS-002) that verify the task
   - Define clear completion criteria
   - Assign priority (Critical → High → Medium → Low)
   - Identify dependencies (task-001 must complete before task-002)

4. **Update README.md task summary table**:

   ```markdown
   | ID       | Task Name              | Priority    | Status         | Test Suites | Dependencies |
   | -------- | ---------------------- | ----------- | -------------- | ----------- | ------------ |
   | task-001 | Setup domain models    | 🔴 Critical | ⚪ Not Started | -           | -            |
   | task-002 | Implement repositories | 🔴 Critical | ⚪ Not Started | TS-001      | task-001     |
   | task-003 | Create services        | 🟠 High     | ⚪ Not Started | TS-002      | task-002     |
   ```

5. **Get user approval** for task breakdown before proceeding to implementation

**Output**: Complete task breakdown in `dev/README.md` and individual `dev/task-*.md` files ready for execution.

---

## Step 2: Begin First Task

**After task breakdown approved**, start with the highest priority task (usually task-001):

1. ✅ Mark task as 🟢 In Progress in `dev/README.md`
2. ✅ Open task file (`dev/task-001-*.md`)
3. ✅ Review ADRs and test suite references in task file
4. ✅ Confirm feature branch exists (`git branch --show-current`)
5. ✅ Begin TDD cycle (Step 3 below)

---

## Step 3: Pre-Implementation Verification ⚠️ CRITICAL

**BEFORE any code, verify environment to prevent common errors:**

### 2.1 Verify File Locations

- [ ] Search for existing files: `Get-ChildItem -Recurse -Filter "*.ts"`
- [ ] Check config paths: `DATABASE_URL`, import paths, file references
- [ ] Document findings in implementation-notes.md

**Why**: Prevents path errors (e.g., assuming `prisma/dev.db` when actual location is `dev.db`).

### 2.2 Check Existing Patterns

- [ ] Search for similar implementations: `grep_search "PrismaClient initialization"`
- [ ] Review related code (if creating repository, check existing repositories)
- [ ] Note patterns to replicate (initialization, error handling)

**Why**: Ensures consistency (e.g., Prisma 7.x requires adapter - check `infrastructure/prisma/client.ts` pattern).

### 2.3 Verify Tool Versions & Compatibility

- [ ] Check `package.json` for library versions
- [ ] Check PowerShell version: `$PSVersionTable.PSVersion` (5.1 vs 7+)
- [ ] Check Node version: `node --version`
- [ ] Note which PowerShell executable to use: `powershell.exe` (5.1) vs `pwsh.exe` (7+)

**Why**: Prevents outdated patterns, unsupported syntax, npm script errors.

### 3.3 Document Environment Findings

- [ ] Update current task file (`dev/task-001-*.md`) with environment notes
- [ ] Document any deviations from standard patterns
- [ ] Note file locations, library versions, PowerShell compatibility

### 3.4 Multi-File Edit Sequencing Checklist

**When making changes that touch multiple files in one operation**:

- [ ] List all files that need changes (interfaces, implementations, tests)
- [ ] Determine dependency order (interfaces → implementations → tests)
- [ ] Make changes in sequence (don't interleave edits)
- [ ] Run `npm run typecheck` after each file group
- [ ] Verify tests still compile after each change
- [ ] Document the change sequence in implementation-notes.md

**Why**: Prevents cascading type errors, ensures compilation at each step, reduces rework from partial edits.

**Example Sequence**:

1. Update interface → typecheck → GREEN
2. Update implementation → typecheck → GREEN
3. Update tests → typecheck → GREEN
4. Run tests → fix failures → GREEN

---

## Step 4: TDD Cycle - RED → GREEN → REFACTOR

**Reference**: [TDD Instructions](../instructions/tdd.instructions.md) | [Refactor Instructions](../instructions/refactor.instructions.md) | [Development Guide](../../knowledge-base/codebase/development-guide.md)

### Phase 0: List Test Cases

**Before any code**, create test checklist in `implementation-notes.md`. Start simple, build toward complex.

### Phase 1: RED - Write Failing Tests

**Purpose**: Define what you want to build. Tests drive interface.

**CRITICAL**: RED phase means tests **compile and run** but **fail with assertion errors**.

**Not RED** ❌:

- "Cannot find module" errors → Create stubs first
- TypeScript compilation errors → Fix types first
- Test files that don't run → Fix setup first

**Proper RED** ✅:

- Tests compile successfully
- Tests run without crashes
- Tests fail with assertion errors: `Expected undefined to be defined`

**Process**: Create minimal stubs (return `undefined`) → Write test → Run → See assertion failure

**Test Location Pattern** ⚠️:

- ✅ CORRECT: `backend/src/__tests__/infrastructure/`
- ❌ WRONG: `backend/src/infrastructure/__tests__/`
- **Why**: TypeScript path alias resolution requirement

**SQLite Concurrency**: If tests throw "database is locked", run sequentially (`npx jest --runInBand`) to confirm. Ensure `maxWorkers: 1` in `jest.config.js`.

**Outside-In Order**: API → Services → Domain → Infrastructure

**Expected**: All tests written, all failing with **assertion errors** (RED). **See TDD instructions for detailed guidance.**

### Phase 2: GREEN - Make Tests Pass

**Purpose**: Write minimum code to pass tests. Don't optimize yet.

**Implementation Order**: Domain Models → Prisma Schema → Repositories → Services → API Routes

**Quality**: Follow SOLID principles (see ADRs), run `npm run validate` frequently, zero TypeScript errors.

**Expected**: All tests passing (GREEN). **See TDD instructions for GREEN phase examples.**

### Phase 3: REFACTOR - Improve Code

**Purpose**: Optimize while maintaining GREEN status.

**CRITICAL**: Don't skip this phase - most common TDD failure mode.

**Reference**: [Refactor Instructions](../instructions/refactor.instructions.md) - Complete refactoring workflow and best practices

**Refactor Continuously**:

- After each test passes (quick wins: rename, extract small functions)
- **Mid-implementation**: Major refactoring (SRP/OCP fixes, pattern application)
- **Pre-commit**: Final cleanup (remove dead code, simplify)

**Refactor Loop** (from refactor.instructions.md):

1. Confirm baseline (tests green)
2. Identify smallest improvement (one code smell)
3. Apply one refactoring move (rename, extract, inline, move)
4. Run tests immediately (revert if red)
5. Re-assess (coupling, readability, duplication)

**SOLID Checkpoints**:

- After each test (quick wins: rename, extract)
- **Mid-implementation**: SRP and OCP compliance review
- **Pre-commit**: Full SOLID assessment (ISP, DIP violations)

**Deep Dive**: [Refactor Instructions](../instructions/refactor.instructions.md) for complete refactor workflow, non-negotiables, and design principles

- **Mid-implementation**: SRP and OCP compliance
- Before next feature: Full SOLID assessment (LSP, ISP, DIP)

**Quality**: Remove dead code, run `npm run validate` from root, maintain test coverage standards, maintain GREEN.

**Monorepo Rule**: ✅ `npm run validate` from root | ❌ Never from subdirectories

**See TDD instructions for refactoring patterns and SOLID compliance checks.**

---

## Step 5: Update Task Progress

**Continuous documentation throughout development**:

- Track decisions with rationale in current task file
- Note deviations from architecture with justification
- Log technical debt (`// TODO:` comments) in code
- Document performance observations in task file
- Update `dev/README.md` with cross-task insights

**Reference architecture** when making decisions - ADRs explain WHY.

---

## Step 7te dependencies tracking if packages added/removed

- Update risks & issues log if new concerns identified
- Update key decisions table if architectural choices made

3. ✅ Move to next task:
   - Mark next task as 🟢 In Progress
   - Begin Step 4 (TDD Cycle) for new task

---

## Step 6: Document Decisions & Progress

**Continuous documentation throughout development**:

- Document decisions with rationale ("Using Repository Pattern per ADR-02")
- Note deviations from plan with justification
- Track technical debt (`// TODO:` comments)
- Log performance observations
- Document environment-specific issues

**Reference architecture** when making decisions - ADRs explain WHY.

---

## Step 7: Continuous Quality Validation (Definition of Done)

**Run BEFORE EVERY COMMIT (from root directory)**:

```bash
npm run validate
```

**This command runs**:

- `npm run typecheck` - Zero TypeScript errors required
- `npm run lint` - Zero linting errors/warnings required
- `npm run format` - Code must be formatted
- `npm test` - All tests must pass

**Definition of Done Checklist**:

- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npm run typecheck` (zero errors policy)
- [ ] No linting errors: `npm run lint` (zero warnings policy)
- [ ] Code formatted: `npm run format`
- [ ] Test coverage maintained (70%+ minimum)
- [ ] Git hooks pass (Husky pre-commit)

**Monorepo Rule**: ✅ Run from root | ❌ Never from subdirectories (incomplete validation)

**Dead Code Removal**: Clean as you go - unused imports, unreferenced functions, commented code. Zero technical debt policy.

**Validation is NOT optional** - it's the baseline quality gate. Features not meeting validation cannot be committed.

---

## Step 8: SOLID Compliance Checkpoints

**Reference**: [Development Guide - SOLID Principles](../../knowledge-base/codebase/development-guide.md#solid-principles)

### Mid-Implementation (After GREEN)

- [ ] **SRP**: Each class has one reason to change?
- [ ] **OCP**: Can extend without modifying existing code?
- [ ] **Responsibilities**: Clearly separated?

### Pre-Commit (Full Assessment)

- [ ] **SRP**: Single responsibility per class?
- [ ] **OCP**: Open for extension, closed for modification?
- [ ] **LSP**: Derived classes substitutable for base?
- [ ] **ISP**: No fat interfaces forcing unused methods?
- [ ] **DIP**: Depend on abstractions, not concretions?

**See Development Guide for examples and patterns (Factory, Repository, Adapter, Strategy).**

---

## Step 9: Commit Strategy

**Atomic commits** with conventional commit format:

```bash
git commit -m "feat(domain): add User model with immutability

- Create User domain model with readonly properties
- Test suite validates immutability
- Follows SRP (single entity, no business logic)

Refs: work-items/<branch>/architecture/adr-01-domain-models.md"
```

**Format**: `<type>(<scope>): <subject>`

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`

**Reference ADRs** in commit messages to explain architectural decisions.

---

## Step 10: Complete All Tasks

**Repeat Steps 4-9 for each task** until all tasks in `dev/README.md` are marked ✅ Complete.

**After completing each task**:

1. Update task file with implementation details
2. Mark ✅ Complete in `dev/README.md` task table
3. Move to next task (mark 🟢 In Progress)

**After final task complete**:

1. ✅ Run full validation suite:
   - `npm test` - All tests passing
   - `npm run typecheck` - Zero TypeScript errors
   - `npm run lint` - Zero ESLint warnings
   - `npm run format:check` - Clean formatting
2. ✅ Complete manual verification checklist in `dev/README.md`
3. ✅ Update `dev/README.md` "Handoff to Retrospective Phase" section
4. ✅ Document any outstanding items or tech debt
5. ✅ Hand off to retrospective agent (see Handoff Checklist below)

---

## Step 11: Quality Gates (Zero Warnings Policy)

**Never proceed with warnings**:

- [ ] Tests pass with clean output
- [ ] No console errors or unexpected logs
- [ ] TypeScript errors = **ZERO**
- [ ] ESLint warnings = **ZERO**
- [ ] Prettier formatting = clean
- [ ] Production-quality code only

**If warnings exist → STOP and fix before continuing!**

**Generated Files**: Add to `.gitignore` before first commit (coverage, build outputs, test artifacts, logs).

---

## Step 12: Create Development Phase Retrospective (RET-006)

**BEFORE handing off to retro agent**, create your phase retrospective:

1. **Copy Template**: Copy `work-items/_template/retro/RET-001-example-phase.md` to `work-items/<branch>/retro/RET-006-development-phase.md`

2. **Fill All Sections**:
   - **Overview**: Phase summary, duration (estimated vs actual), key deliverables (dev/README.md, task-NNN files, tests)
   - **What Went Well** ✅: TDD cycle effectiveness, task breakdown quality, SOLID compliance (with evidence)
   - **What Didn't Go Well** ❌: Challenges, blockers, refactoring needs, unexpected complexity (with impact and time lost)
   - **Key Learnings** 💡: TDD insights, architecture clarity, test effectiveness, pattern usage
   - **Action Items** 📋: Dev workflow improvements, task template enhancements, code quality patterns
   - **Quality Assessment**: SOLID compliance (SRP/OCP/LSP/ISP/DIP checklist), Code quality metrics (TypeScript errors: 0, ESLint warnings: 0, Test coverage: X%, Dead code removed), Deliverable quality
   - **Handoff to Next Phase**: Feature complete, all tasks ✅, tests passing, code quality validated

3. **Update Summary**: Add entry to `work-items/<branch>/retro/retrospective.md`:

   ```markdown
   ### RET-006: Development Phase

   - **File**: [RET-006-development-phase.md](RET-006-development-phase.md)
   - **Agent**: Developer
   - **Date**: YYYY-MM-DD
   - **Status**: Complete ✅
   - **Key Outcome**: All tasks implemented, tests passing, SOLID principles followed
   ```

**Purpose**: This retrospective documents TDD effectiveness, architecture decisions in practice, and provides critical feedback for continuous workflow improvement.

---

## Handoff Checklist

**Ready for retrospective agent when**:

- [ ] **RET-006 retrospective created** and added to retrospective.md summary
- [ ] All tasks in `dev/README.md` marked ✅ Complete
- [ ] All tests passing (🟢 GREEN maintained)
- [ ] Test coverage meets targets (70%+ overall, 90%+ domain)
- [ ] Zero TypeScript errors (`npm run typecheck` passes)
- [ ] Zero ESLint warnings (`npm run lint` passes)
- [ ] Code formatted (`npm run format:check` passes)
- [ ] SOLID principles followed (checkpoints completed)
- [ ] Dead code removed
- [ ] All task files (`dev/task-*.md`) complete with implementation details
- [ ] `dev/README.md` updated with dependencies, decisions, issues
- [ ] Commits follow convention (conventional commits)
- [ ] Git hooks pass (Husky pre-commit)
- [ ] No `console.log` statements (proper logging only)
- [ ] All TODOs resolved or tracked as tech debt in README.md
- [ ] Documentation updated (JSDoc, README if needed)
- [ ] Feature branch up to date with main
- [ ] Manual verification checklist complete

**Hand off to**: Retrospective agent for post-feature review

---

## Key References

- **TDD Workflow**: [TDD Instructions](../instructions/tdd.instructions.md)
- **TDD Deep Dive**: [TDD Knowledge Base](../../knowledge-base/tdd/README.md)
- **SOLID Principles**: [Development Guide](../../knowledge-base/codebase/development-guide.md)
- **Testing Patterns**: [Testing Instructions](../instructions/testing.instructions.md)
- **Jest Configuration**: [Jest Knowledge Base](../../knowledge-base/jest/README.md)
- **TypeScript Patterns**: [TypeScript Instructions](../instructions/typescript.instructions.md)
- **Retrospectives**: [Retrospective Instructions](../instructions/retrospective.instructions.md)

```

```

```

```
