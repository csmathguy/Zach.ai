# Retrospective Documentation

This directory contains development retrospectives for learning and process improvement.

## Purpose

Retrospectives provide **reflective analysis** of development sessions. Unlike process logs (which document facts), retrospectives focus on **learning**, **insights**, and **how to improve** going forward.

## When to Create

Create a retrospective entry **after every commit** alongside the process log:

- After completing a task/feature
- After resolving a blocker
- After each development session
- **Every time you create a process log**

## File Naming

Use timestamped filenames matching process log chronology:

```
YYYY-MM-DD-HHMMSS.md
```

**Examples**:

- `2026-01-02-143022.md` - Retrospective for PrismaUserRepository
- `2026-01-02-163045.md` - Retrospective for PrismaThoughtRepository
- `2026-01-02-183000.md` - Retrospective for Day 2 validation

**Note**: Timestamp should match or closely follow the corresponding process log entry.

## Template

See [TEMPLATE.md](TEMPLATE.md) for the standard retrospective template.

**IMPORTANT**: Agent must fill in ALL template sections with actual reflections, not leave placeholders!

## Key Principles

1. **Reflective, not factual**: Focus on WHY and HOW, not just WHAT
2. **Learning-focused**: What did we learn? How can we improve?
3. **Honest**: Include both successes and failures
4. **Actionable**: Generate concrete action items with owners
5. **Forward-looking**: How does this inform future work?
6. **No placeholders**: Fill in actual insights, not "[Learning 1]"

## Process vs Retrospective

| Process Log        | Retrospective                  |
| ------------------ | ------------------------------ |
| **What** happened  | **Why** and **how** to improve |
| Factual record     | Learning and insights          |
| Every commit       | Every commit (paired)          |
| 5-10 minutes       | 10-15 minutes                  |
| Continuity/handoff | Process improvement            |

## Agent Workflow (Direct Fill-In)

After creating process log:

1. **Create file**: `work-items/<work-item>/retro/$(Get-Date -Format "yyyy-MM-dd-HHmmss").md`
2. **Copy template**: From TEMPLATE.md
3. **Fill ALL sections** with actual reflections:
   - What We Did: Brief context (can reference process log)
   - What Went Well: Specific wins with explanations
   - What Didn't Go Well: Honest assessment of challenges
   - What We Learned: Key insights and how to apply them
   - Action Items: Concrete improvements needed
   - Technical Debt: Accumulated debt and follow-ups
   - Metrics: SOLID score, test coverage, validation status
4. **Save**: Retrospective complete when no placeholders remain
5. **Continue**: Proceed to next task

## 4Ls Framework (Optional Structure)

Alternative structure for comprehensive retrospectives:

- **Loved** - What worked really well?
- **Loathed** - What was frustrating or problematic?
- **Learned** - What new insights did we gain?
- **Longed for** - What tools/patterns/knowledge do we need?

## ❌ Bad Example (Placeholders Left In)

```markdown
## What Went Well ✅

**Wins**:

- [Win 1 with explanation]
- [Win 2 with explanation]

## Action Items 🔧

- [ ] [Action 1 - process change needed]
```

## ✅ Good Example (Actual Reflections)

```markdown
## What Went Well ✅

**Wins**:

- **TDD RED phase discipline**: Created 34 test cases before any implementation, which caught 4 compilation errors immediately during GREEN phase
- **Mapper pattern consistency**: Reusing toDomain/toPrisma patterns from previous repositories reduced implementation time by 50%
- **Idempotent operations**: Using upsert for assignUser/linkThought eliminated race conditions and simplified logic

## Action Items 🔧

- [ ] **KB Update**: Document mapper limitations with UpdateDto types (encountered in update() method)
- [ ] **Developer workflow**: Add mid-implementation SOLID checkpoint (would have caught SRP violation earlier)
```

## Continuous Retrospectives

**Philosophy**: Rather than waiting until feature end, document learnings **immediately after each session** while context is fresh.

**Benefits**:

- Insights captured while details are fresh
- Early problem detection before they compound
- Knowledge transfer between sessions
- Complete timeline of decisions and learnings

## Metrics to Include

Every retrospective should document:

- **SOLID Compliance**: 1-10 score with brief assessment
- **Dead Code Removed**: Yes/No with specifics
- **TypeScript Errors**: Zero throughout? Any issues?
- **Test Output Clean**: Yes/No with details
- **Test Coverage**: Tests added, total passing, percentage achieved
- **Validation**: npm run validate status

## Action Item Follow-Through

When action items are created:

1. **Tag appropriately**: Process improvement vs KB update vs code quality
2. **Reference in next session**: Check action items from previous retrospective
3. **Close completed items**: Document completion in future retrospective
4. **Promote to tickets**: Major improvements become work items

## Example Entry

```markdown
# Retrospective - PrismaActionRepository Implementation

**Date**: 2026-01-02 17:44
**Commit**: `cc4015e` - "feat: implement PrismaActionRepository with many-to-many relations"
**Task**: Section 2.8: PrismaActionRepository
**Status**: ✅ Complete

---

## What We Did

Implemented PrismaActionRepository with full CRUD operations including many-to-many relationships (assignees, thoughts). Created 34 comprehensive test cases covering all repository methods, filtering (by project/type/status), and idempotent many-to-many operations.

---

## What Went Well ✅

**Wins**:

- **Idempotent patterns**: Using `upsert` for assign/link and `deleteMany` for unassign/unlink eliminated complex "check-then-act" logic
- **TypeScript strict mode**: Caught 4 type mismatches during compilation that would have been runtime errors
- **Test coverage**: 34 new tests brought total to 200 passing, maintaining 85%+ infrastructure coverage

---

## What Didn't Go Well / Issues Found ❌

**Challenges**:

- **Mapper limitations**: UpdateActionDto incompatible with CreateActionDto mapper - had to build Prisma input object directly in update() method
- **FK constraint tests**: Forgot to create prerequisite project before testing projectId validation

**What did user catch that agent missed?**:

- Process log script only fills basic metadata, leaves content sections as placeholders
- Retrospective monolithic file getting unwieldy, needs individual timestamped files

---

## What We Learned / Improvements 📚

**Learnings**:

- **Update DTOs need separate handling**: Can't reuse creation mappers for updates due to partial fields
- **Idempotency simplifies testing**: upsert/deleteMany patterns reduce test complexity and edge cases
- **Documentation workflow needs refinement**: Both process logs and retrospectives need better structure

**Questions for Next Session**:

- Should all repositories use direct Prisma input building for updates instead of mappers?
- Can we extract idempotent pattern into shared repository utilities?

---

## Action Items for Future Development 🔧

**Process Improvements**:

- [x] **Restructure retrospectives**: Create individual timestamped files instead of monolithic file
- [ ] **Process log enhancement**: Agent fills content directly instead of relying on script

**Knowledge Base Updates**:

- [ ] **Mapper patterns**: Document when to use mappers vs direct Prisma input objects
- [ ] **Idempotent operations**: Add best practices guide for many-to-many relationships

---

## Metrics Summary

**Code Quality**:

- SOLID compliance: 9/10 - Excellent separation, minor update() method complexity
- Dead code removed: Yes - no unused imports or functions
- TypeScript errors: Zero throughout (caught 4 during GREEN phase)
- Test output clean: Yes - all framework errors suppressed

**Test Coverage**:

- Tests added: 34 tests
- Total tests: 200 passing / 200 total
- Coverage achieved: 85% infrastructure, 78% overall

**Validation**:

- npm run validate: ✅ PASS
- Pre-commit checks: ✅ PASS
```

## Migration for Existing Work Items

For features with existing monolithic `retrospective.md`:

1. Create `retro/` directory if needed
2. Keep existing `retrospective.md` as historical archive
3. Start new timestamped entries going forward
4. Optional: Split existing entries into individual files with approximate timestamps
