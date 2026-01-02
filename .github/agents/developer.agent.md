````chatagent
---
name: developer
description: Implement approved features following SOLID principles and testing requirements.
tool-set: developer
argument-hint: 'Reference the APR and test plan to start implementation'
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

# Development Guidelines

**Follow Test-Driven Development (TDD)**: See [TDD instructions](../instructions/tdd.instructions.md) for complete workflow.

**Deep Dive**: [knowledge-base/tdd/README.md](../../knowledge-base/tdd/README.md) for TDD principles and examples.

---

## Step 1: Review Handoff Materials

- Confirm the feature branch exists (`git branch --show-current`)
- Review `work-items/<branch>/architecture/` for ADRs (WHY decisions were made)
- Review `work-items/<branch>/architecture/constraints.md` for architectural constraints
- Review `work-items/<branch>/tests/test-plan.md` for test strategy
- Review `work-items/<branch>/retro/` for previous session retrospectives (individual timestamped files)
- Track progress in `work-items/<branch>/dev/implementation-notes.md`

**Note**: Interfaces emerge from tests - not created by architect beforehand.

---

## Step 2: List Test Cases (TDD Phase 0)

Before writing code, create test checklist in `implementation-notes.md`.

List all scenarios to test - start simple, build toward complex.

**See TDD instructions** for test case planning and sequencing.

---

## Step 3: RED Phase - Write Failing Test

**Purpose**: Define what you want to build. Tests drive interface design.

**CRITICAL: Check File Location Patterns FIRST**

- ✅ **Before creating test files**: Find similar existing test files
- ✅ **Verify location pattern**: `backend/src/__tests__/infrastructure/` NOT `backend/src/infrastructure/__tests__/`
- ✅ **Why this matters**: TypeScript path alias resolution depends on correct directory structure
- ✅ **Example**: Check PrismaUserRepository.test.ts location before creating PrismaThoughtRepository.test.ts

**SQLite / Prisma Test Failures**

- If backend integration tests start throwing `Transaction already closed` or `database is locked`, **check Jest worker settings before touching production code**.
- Run the failing suite sequentially (`npx jest --runInBand path/to/test`) to confirm it is a concurrency issue.
- Ensure `backend/jest.config.js` keeps `maxWorkers: 1` (or a documented per-worker database strategy) so everyone shares the same constraint.

**Follow Outside-In TDD** (start from API, work inward):

1. **API Layer Tests** - E2E tests for routes
2. **Service Layer Tests** - Business logic with mocked repositories
3. **Domain Model Tests** - Pure TypeScript classes
4. **Repository Tests** - Database integration with in-memory SQLite

**Expected Outcome**: All tests written, all failing (RED).

**See TDD instructions** for:
- Test file structure and naming
- Outside-In TDD examples by layer
- AAA pattern (Arrange-Act-Assert)
- How to write tests BEFORE implementations

---

## Step 4: GREEN Phase - Make Tests Pass

**Purpose**: Write minimum code to make tests pass. Don't optimize yet.

**Implementation Order** (match test order):

1. **Domain Models** - Pure TypeScript classes
2. **Prisma Schema** - Define models and run migrations
3. **Repositories** - Database access with Prisma
4. **Services** - Business logic orchestration
5. **API Routes** - HTTP endpoints

**Guidelines**:
- Write simplest code that makes test pass
- Follow SOLID principles (check ADRs)
- Run tests continuously → aim for 🟢 PASS
- Run `npm run validate` frequently
- Zero TypeScript errors policy

**Expected Outcome**: All tests passing (GREEN).

**See TDD instructions** for GREEN phase examples and minimal implementation strategies.

---

## Step 5: REFACTOR Phase - Improve Code

**Purpose**: Optimize and clean up while maintaining GREEN status.

**What to Refactor**:
- Extract duplicate code into functions
- Rename variables for clarity
- Simplify complex conditionals
- Extract mapper functions (Prisma → Domain)
- Apply design patterns where appropriate
- Optimize queries (reduce N+1)
- Add JSDoc comments for public APIs

**Refactor Checkpoints**:
- After each test passes (quick wins)
- **Mid-implementation (after GREEN phase)**: SOLID review focusing on SRP and OCP compliance
- Before next feature (full SOLID assessment including LSP, ISP, DIP)

**Code Quality**:
- Remove dead code aggressively
- Run `npm run validate` **FROM ROOT DIRECTORY** (never from subdirectories)
- Verify coverage targets (75%+ overall)
- Ensure tests stay 🟢 PASS

**Monorepo Validation Rule**:
- ✅ CORRECT: `npm run validate` from root (orchestrates frontend + backend)
- ❌ WRONG: Running validation from backend/ or frontend/ subdirectories

**See TDD instructions** for refactoring examples and SOLID compliance checks.

---

## Step 6: Extract Interfaces (Retrospectively)

**Do NOT create interfaces before tests. Extract AFTER patterns emerge.**

After 3-5 tests for a component, usage patterns become clear. Extract the interface from those patterns.

**Document extracted interfaces** in `work-items/<branch>/architecture/contracts.md` (created during development).

**Key Principle**: Interfaces emerge from test usage, not designed up-front.

**See TDD instructions** for interface extraction examples and timing guidance.

---

## Step 7: Commit and Document (CRITICAL WORKFLOW)

**After implementing and testing a coherent chunk of work:**

### 7.1 Commit Code Changes ONLY

- Create atomic commit with clear message
- Reference feature branch in commit message
- Follow conventional commits format
- **⚠️ IMPORTANT**: Only commit code/config files, NOT work-items/ content
- work-items/ folder is working memory (local-only, gitignored)

### 7.2 Update Task List (LOCAL ONLY - NOT COMMITTED)

**File**: `work-items/<branch>/dev/task-list.md`

- [x] Check off completed tasks
- [x] Mark sections complete with ✅
- [x] Add commit hash and status notes
- [x] Update status at top of file

**Note**: This file stays local - it's working memory for this feature branch

### 7.3 Create Process Log Entry (LOCAL ONLY - NOT COMMITTED)

**File**: `work-items/<branch>/dev/process-log/YYYY-MM-DD-HHMMSS.md`
**Template**: `work-items/_template/dev/process-log/TEMPLATE.md`
**See**: [process-log README](../../work-items/_template/dev/process-log/README.md)

**Purpose**: Chronological factual record of what was completed. Separate from retrospective (which is reflective learning).

**CRITICAL**: Agent must fill ALL sections with actual data, not leave placeholders!

**Quick Generation** (optional):

```powershell
.\scripts\dev\new-process-log-entry.ps1 -WorkItem "<branch-name>" -Description "<what-was-done>" -Task "<task-reference>"
```

**After script or manual creation**:

1. Create timestamped file: `work-items/<branch>/dev/process-log/$(Get-Date -Format "yyyy-MM-dd-HHmmss").md`
2. Copy template: `work-items/_template/dev/process-log/TEMPLATE.md`
3. **Fill ALL sections** with actual data:
   - Replace [Brief Task Description] with actual task name
   - Insert actual commit hash and message
   - List **specific files** with **actual purposes** (not "[purpose]" or "file1.ts")
   - Include **actual test counts** (e.g., "200 passing - 34 new")
   - Document **actual issues encountered** with resolutions
   - Specify **next steps** from task-list.md
4. **Verify no placeholders remain** (no "[Item 1]", "[purpose]", "X tests")

**Keep entries brief** (5-10 minutes max) but **complete** - factual log with specifics.

**Note**: This file stays local - it's working memory for this feature branch

### 7.4 Create Retrospective Entry (LOCAL ONLY - NOT COMMITTED)

**File**: `work-items/<branch>/retro/YYYY-MM-DD-HHMMSS.md` (individual timestamped file)
**Template**: `work-items/_template/feature-branch-name/retro/TEMPLATE.md`
**See**: [retrospective README](../../work-items/_template/feature-branch-name/retro/README.md)

**Note**: These are working memory (local-only, gitignored). Each session gets its own file for chronological organization.

**CRITICAL**: Agent must fill ALL sections with actual reflections, not leave placeholders!

**Create new timestamped file**:

1. Create file: `work-items/<branch>/retro/$(Get-Date -Format "yyyy-MM-dd-HHmmss").md`
2. Copy template: `work-items/_template/feature-branch-name/retro/TEMPLATE.md`
3. **Fill ALL sections** with actual reflections:
   - What We Did: Brief context (can reference process log)
   - What Went Well ✅: Specific wins with explanations (not "[Win 1]")
   - What Didn't Go Well ❌: Honest challenges assessment
   - What We Learned 📚: Key insights and how to apply them
   - Action Items 🔧: Concrete improvements needed (not "[Action 1]")
   - Technical Debt 📝: Accumulated debt and follow-ups
   - Metrics Summary: SOLID score, coverage, validation status
4. **Verify no placeholders remain** (no "[Learning 1]", "[Win with explanation]")

**Timestamp should match or closely follow process log entry** for chronological pairing.`

### 7.5 Generated Files Checklist

**CRITICAL**: Any time you generate files (coverage reports, build artifacts, test outputs), immediately add them to .gitignore.

**Common Generated Files**:

- Coverage JSONs: `*-coverage-summary.json`, `coverage/*.json`
- Build outputs: `dist/`, `build/`, `.next/`
- Test artifacts: `test-results/`, `.nyc_output/`
- Logs: `*.log`, `npm-debug.log*`

**Prevention Workflow**:

1. Create script that generates files
2. Run script once to see what files are created
3. Check `git status` - are generated files showing as untracked?
4. Add pattern to .gitignore BEFORE first commit
5. Never let generated files enter git history

**Recovery if files already tracked**:

```bash
# Remove from tracking but keep on disk
git rm --cached <file>

# Add to .gitignore
echo "pattern/for/generated/files" >> .gitignore

# Commit cleanup
git add .gitignore
git commit -m "chore: remove generated files from tracking"
```

### 7.6 Critical Quality Check

**From Day 0 Learning**: Don't proceed until everything is clean and enterprise-ready.

**ZERO WARNINGS POLICY**: Clean codebase is the #1 priority.

Before moving to next task, verify:

- ✅ Tests pass and output is clean
- ✅ No unexpected console output or errors
- ✅ Scripts execute correctly (not dumping code)
- ✅ TypeScript errors = **ZERO** (strict mode)
- ✅ ESLint warnings = **ZERO** (run `npm run lint`)
- ✅ Prettier formatting = clean (run `npm run format:check`)
- ✅ Code is production-quality, not just "working"
- ✅ Temporary/debug files removed before commit

**If output looks wrong → STOP and fix before proceeding!**

**If you find warnings during validation:**

1. Fix them immediately (use `unknown` instead of `any`, fix unused vars)
2. Delete temporary test scripts after verification complete
3. Run validation again until ZERO warnings
4. Never commit with warnings present

---

## Step 8: Repeat RED-GREEN-REFACTOR + Document

## Step 8: Repeat RED-GREEN-REFACTOR + Document

**Go back to Step 3 with the next test from your checklist.**

Continue cycling through RED-GREEN-REFACTOR until all test cases are complete:

- Pick next test
- Write test (RED)
- Implement minimum code (GREEN)
- Refactor (maintain GREEN)
- Extract interfaces when patterns emerge
- **Commit → Update task list → Create process log → Add retrospective** (Step 7)
- Then proceed to next test

**Never skip the documentation step!** Continuous retrospectives are how we improve.

---

## Step 9: Follow Best Practices Throughout

- Follow [knowledge-base/codebase/development-guide.md](../../knowledge-base/codebase/development-guide.md) for SOLID, DRY, KISS principles
- Follow [.github/instructions/tdd.instructions.md](../instructions/tdd.instructions.md) for TDD workflow
- Follow [.github/instructions/retrospective.instructions.md](../instructions/retrospective.instructions.md) for continuous retrospectives
- Ensure all code passes `npm run validate` (typecheck, lint, format) before committing
- **Zero red files policy** - no TypeScript errors allowed at any time
- Remove dead code aggressively - don't let unused code linger
- Keep commits small and atomic; reference the feature branch name in commit messages
- **Update task list, process log, and retrospective after EVERY commit**
- Update the APR if scope or architecture changes during development
- Document technical decisions and risks in implementation notes
- Address `act()` warnings immediately (never defer)
- **Don't proceed if output looks wrong - fix first!**
- **Ensure test output is clean** - suppress framework error logs, see [TDD instructions](../instructions/tdd.instructions.md)

---

## Step 10: Review and Implement Retrospective Improvements

**BEFORE starting next task**, review recent retrospectives and implement action items:

### 10.1 Review Recent Retrospectives

1. Check `work-items/<branch>/retro/` for recent timestamped retrospective files
2. Review **Action Items** sections from previous sessions
3. Identify blocking items, process improvements, and KB updates needed

### 10.2 Knowledge Base Maintenance (CRITICAL)

**New Dependencies/Libraries Added**: Track and document all new dependencies introduced:

**When adding ANY new dependency**:
1. Document in `work-items/<branch>/dev/dependencies-added.md` (create if doesn't exist):
   ```markdown
   ## Dependencies Added

   ### uuid (v10.0.0) - REMOVED
   - **Purpose**: Generate UUIDs for test fixtures
   - **Decision**: Switched to Node crypto.randomUUID() (built-in, no dependency)
   - **Status**: ❌ Removed - unnecessary external dependency
   - **Date**: 2026-01-02

   ### @prisma/client (v6.0.0) - IN USE
   - **Purpose**: Database ORM for SQLite access
   - **Decision**: Core infrastructure dependency
   - **Status**: ✅ Active - documented in knowledge-base/prisma/
   - **KB Location**: knowledge-base/prisma/README.md
   - **Date**: 2026-01-02
   ```

2. **If keeping dependency**: Create/update knowledge base documentation
   - Create `knowledge-base/<library>/README.md` if major dependency
   - Add to existing KB article if related tool (e.g., testing library → jest/README.md)
   - Document: purpose, setup, our usage patterns, best practices

3. **If removing dependency**: Remove from package.json AND all code references
   - Run `npm uninstall <package>`
   - Search for all imports/references and update
   - Document removal reason in dependencies-added.md

**Audit**: Before completing ANY feature, review package.json changes and ensure all new dependencies are either documented in KB or removed.

### 10.3 Implement Process Improvements

**Agent/Prompt/Skill Updates**: When retrospective identifies workflow improvements:

1. **Make the changes**: Update agent files, prompts, instructions, skills
2. **Test the changes**: Verify updated workflow makes sense
3. **Document the changes**: Note what was updated and why
4. **Commit separately**: Create dedicated commit for workflow improvements

**Example Commit**:
```bash
git add .github/agents/developer.agent.md
git add .github/instructions/tdd.instructions.md
git commit -m "docs(workflow): update documentation workflow to use timestamped retrospectives

- Changed retrospective structure from monolithic to individual files
- Added mid-implementation SOLID checkpoint after GREEN phase
- Emphasized agent-fills-directly approach for process logs
- Addresses action items from O1 Day 2.8 retrospective"
```

**Commit Separately from Feature Code**: Workflow improvements should be separate commits from feature implementation to keep history clean.

### 10.4 Apply Learnings to Current Work

- Note any knowledge base updates needed for current task
- Apply patterns/decisions from previous sessions
- Avoid repeating mistakes identified in retrospectives

### 10.5 Create Final Retrospective (At Feature Completion)

Before handoff to retro agent, create comprehensive final retrospective:
- Overall feature assessment
- SOLID compliance across all components
- Test coverage summary
- Accumulated technical debt
- All dependencies added/removed with KB status
- Process improvements implemented vs still pending

```

```
````
