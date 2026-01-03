# Research Workflow: Structured Research Planning

## Overview

This document defines the structured research workflow for knowledge base documentation. Research should mirror the architecture ADR workflow: **plan → approve → execute**.

**Purpose**: Ensure research is deliberate, valuable, and user-approved before execution.

**Benefits**:

1. **User Approval** - User controls scope before time investment
2. **Separate Files** - Each research item (RI) is its own file (like ADRs)
3. **Structured Planning** - Checklist format (RI-001, RI-002) like ADRs
4. **Priority-Based** - Critical → High → Medium → Low sequencing
5. **Scope Control** - Reject low-value items, defer future items
6. **Rationale Tracking** - Document why approved/rejected/deferred
7. **Efficiency** - Save hours by planning before executing

---

## Workflow Steps

### Phase 1: Source Document Analysis

**Input**: APR, Architecture README, ADRs, Contracts

**Actions**:

1. Read APR thoroughly - identify all technologies, libraries, frameworks, patterns mentioned
2. Read Architecture README - understand technical decisions and design
3. Read all ADRs - extract technologies chosen, patterns established, integration requirements
4. Read Contracts - identify domain concepts needing documentation
5. Compare against existing knowledge base - identify gaps (missing, outdated, incomplete)

**Output**: List of technologies/patterns that need KB documentation

**Create Research Folder**:

```bash
work-items/<feature>/research/
```

---

### Phase 2: Research Planning (Create Separate RI Files)

**CRITICAL**: **Each research item is a SEPARATE FILE** (like ADRs: adr-001.md, adr-002.md, etc.)

**Input**: List of technologies/patterns from Phase 1

**Actions**:

1. **Create separate RI file for EVERY potential research item** (even ones that might be rejected):
   - `work-items/<feature>/research/ri-001-technology-name.md`
   - `work-items/<feature>/research/ri-002-pattern-name.md`
   - `work-items/<feature>/research/ri-003-another-item.md`
   - `work-items/<feature>/research/ri-004-more-items.md`
   - ... (create files for ALL identified items)
   - **Use template**: `work-items/_template/research/ri-001-example-technology.md`

   **Important**: Create ALL RI files upfront as suggestions. User will approve/reject each one. Don't filter yourself - present all options to user.

2. **In each RI file**, document:
   - **Type**: Technology | Pattern | Framework | Library | Tool
   - **Priority**: Critical | High | Medium | Low
   - **Status**: ⏳ Pending Approval (initially)
   - **Context**: Why needed, where used, APR/ADR references
   - **Current KB State**: Missing | Partial | Outdated | Complete
   - **Proposed Documentation**: Location (`knowledge-base/[tech]/[file].md`), size estimate
   - **Documentation Scope**: 14-section checklist (what to include)
   - **Value Proposition**: Immediate use, future reuse, team benefit, architecture impact
   - **Research Strategy**: Sources to use, approach
   - **Success Criteria**: Quality checklist
   - **Decision Section**: Leave blank for user to fill
3. **Create summary document**: `research-findings.md`
   - Summary table of all RIs
   - Overall research plfor ALL identified items (separate files, not one plan)\*\*:

- `ri-001-zod-validation.md` ⏳ Pending Approval
- `ri-002-express-error-handling.md` ⏳ Pending Approval
- `ri-003-middleware-pipeline.md` ⏳ Pending Approval
- `ri-004-rate-limiting.md` ⏳ Pending Approval
- `ri-005-request-id-pattern.md` ⏳ Pending Approval
- `ri-006-uuid-validation.md` ⏳ Pending Approval
- ... (all items get their own file)
- `research-findings.md` summary document (initially just overview table)
- **All RIs start with ⏳ Pending Approval status** - user decides which to approve
  - `ri-003-middleware-pipeline.md`
  - etc.
- `research-findings.md` summary document
- All RIs with ⏳ Pending Approval status

**Key Principle**: **Each research item is a separate file** (mirrors ADR pattern)

---

### Phase 3: User Approval (Review Individual RI Files)

**Input**: Individual RI files (ri-001-_.md, ri-002-_.md, etc.)

**Actions**:

1. **Present all RI files to user** for review (list them with paths)
2. **User reviews EACH RI file separately** and decides:
   - ✅ **Approved** - Proceed with documentation
     - Rationale: Critical/high value, immediate need, establishes patterns
   - ❌ **Rejected** - Skip documentation
     - Rationale: Low value, out of scope, already covered, not needed
   - ⏳ **Deferred** - Document later (future work item)
     - Rationale: Prove pattern first, wait for implementation, useful but not urgent
3. **User updates Decision section** in each RI file:
   - Decision: ✅ Approved | ❌ Rejected | ⏳ Deferred
   - Rationale: Why this decision was made
   - Conditions/Notes: Any special requirements
4. **Researcher updates each RI file**:
   - Status: ✅ Approved | ❌ Rejected | ⏳ Deferred
   - Decision Date: When decision was made

**Output**: Each RI file updated with approval decision and rationale

**Example**:

- `ri-001-zod-validation.md` → Status: ✅ Approved (Critical for O2 validation)
- `ri-002-express-error-handling.md` → Status: ✅ Approved or ⏳ Deferred (High value)
- `ri-003-middleware-pipeline.md` → Status: ❌ Rejected (Already in Express KB)
- `ri-004-rate-limiting.md` → Status: ❌ Rejected (Deferred to post-MVP per ADR)

---

### Phase 4: Research Execution (Only Approved Items)

**Input**: Individual RI files with ✅ Approved status

**Actions**:

1. **Execute ONLY approved RIs**, in priority order:
   - Critical priority first (blocking implementation)
   - High priority second (high reuse, establishes patterns)
   - Medium priority if time allows
2. **For each approved RI file**:
   - Research from official docs, best practices, community resources
   - Create/update KB documentation following 14-section template
   - Ensure minimum 400+ lines for comprehensive guides
   - Include 7+ common patterns with code examples
   - Cross-reference with ADRs
   - Update KB index
   - **Update the RI file**:
     - **Status**: ✔️ Complete
     - **Execution Notes section**:
       - Date Started / Date Completed
       - Actual Effort (hours)
       - Research Sources Used (actual URLs/docs)
       - Key Findings (discoveries, patterns, gotchas)
       - Challenges Encountered (issues and resolutions)
     - **Quality Checklist**: Mark all items complete
3. **Skip rejected RIs entirely** (leave status as ❌ Rejected - no execution)

4. **Leave deferred RIs** with ⏳ Deferred status (for future work)

**Output**:

- KB documentation created for all approved RIs
- Each RI file updated with execution notes and ✔️ Complete status
- Rejected/deferred RI files remain unchanged (except status)

---

### Phase 5: Documentation & Handoff

**Input**:

- Individual RI files (some ✔️ Complete, some ❌ Rejected, some ⏳ Deferred)
- Completed KB documentation

**Actions**:

1. **Update research findings document**: `research-findings.md`
   - **Summary table**: All RIs with types, priorities, statuses, decisions
   - **Completed items**: Detailed findings for each ✔️ Complete RI
     - Key findings, value delivered, effort, cross-references
   - **Rejected items**: Why rejected (brief rationale)
   - **Deferred items**: Why deferred, when to revisit
   - **KB updates**: New entries created, existing entries updated, index changes
   - **Time analysis**: Estimated vs actual, breakdown by priority
   - **Impact assessment**: Immediate (current feature), future (O3-O7), team
   - **Research insights**: What worked, challenges, key learnings
   - **Recommendations**: Process improvements, future research topics
   - **Handoff notes**: What's ready for tester/developer, outstanding items
2. **Verify all RI files** have final status and decision rationale
   - ✔️ Complete: Has execution notes
   - ❌ Rejected: Has rejection rationale in Decision section
   - ⏳ Deferred: Has deferral reason and future work item reference
3. **Update feature retrospective** with research phase learnings
   - What worked well, challenges, process improvements
4. **Hand off to next agent** (Tester or Developer) with:
   - Links to KB documentation created
   - List of RI files for reference
   - Outstanding items (deferred RIs for future features)

**Output**:

- Complete `research-findings.md` summary
- All individual RI files with final statuses
- Clear handoff documentation for next phase

---

## Research Item (RI) File Structure

**CRITICAL**: Each RI is a **separate file**: `ri-001-technology-name.md`

### File Naming Convention

```
ri-001-zod-validation.md           # Technology (library)
ri-002-express-error-handling.md   # Pattern (error handling)
ri-003-prisma-repository.md        # Pattern (repository implementation)
ri-004-react-router.md             # Technology (library)
```

**Rules**:

- Use lowercase with hyphens
- Include technology/pattern name in filename
- Number sequentially (001, 002, 003)
- Keep filename concise but descriptive

### RI File Sections

**Complete template**: `work-items/_template/research/ri-001-example-technology.md`

**Key sections** (all in separate RI file):

1. **Header**: Type, Priority, Status, Feature, Dates
2. **Context**: Why needed, APR/ADR references
3. **Current KB State**: What exists, what's missing
4. **Proposed Documentation**: Location, type, effort estimate
5. **Documentation Scope**: 14-section checklist
6. **Value Proposition**: Immediate, future, team, architecture
7. **Research Strategy**: Sources and approach
8. **Success Criteria**: Quality checklist
9. **Decision**: User fills this (Approved/Rejected/Deferred + rationale)
10. **Execution Notes**: Researcher fills during execution (dates, effort, findings, challenges)
11. **Related Items**: Dependencies, blocking relationships

---

(ALL items, not just approved):

1. **`ri-001-zod-validation.md`**
   - Type: Technology (Library), Priority: Critical
   - Initial Status: ⏳ Pending Approval
   - User Decision: ✅ Approved (required for O2 validation)
   - Final Status: ✔️ Complete
   - Output: `knowledge-base/zod/README.md` (7500+ lines, 90 minutes)

2. **`ri-002-express-error-handling.md`**
   - Type: Pattern (Error Handling), Priority: High
   - Initial Status: ⏳ Pending Approval
   - User Decision: ⏳ Awaiting approval
   - Final Status: ⏳ Pending Approval
   - Proposed: `knowledge-base/express/error-handling.md` (30-45 min)

3. **`ri-003-middleware-pipeline.md`**
   - Type: Pattern, Priority: Medium
   - Initial Status: ⏳ Pending Approval
   - User Decision: ❌ Rejected (already in Express KB)
   - Final Status: ❌ Rejected

4. **`ri-004-rate-limiting.md`**
   - Type: Technology (Library), Priority: Low
   - Initial Status: ⏳ Pending Approval
   - User Decision: ❌ Deferred (post-MVP per ADR-002)
   - Final Status: ❌ Rejected (Deferred)

5. **`ri-005-request-id-pattern.md`**
   - Type: Pattern, Priority: Medium
   - Initial Status: ⏳ Pending Approval
   - User Decision: ❌ Rejected (covered in RI-002)
   - Final Status: ❌ Rejected

6. **`ri-006-uuid-validation.md`**
   - Type: Pattern, Priority: Low
   - Initial Status: ⏳ Pending Approval
   - User Decision: ❌ Rejected (already in Zod KB)
   - Final Status: ❌ Rejected-500 lines)
   - Estimated Effort: 30-45 minutes

**Rejected Items** (separate files with rejection rationale):

- `ri-003-middleware-pipeline.md` - ❌ Rejected (already in Express KB)
- `ri-004-rate-limiting.md` - ❌ Rejected (deferred to post-MVP)
- `ri-005-request-id-pattern.md` - ❌ Rejected (covered in RI-002)
- `ri-006-uuid-validation.md` - ❌ Rejected (already in Zod KB)

**Summary Document**:

- **`research-findings.md`**
  - Overview of all 6 items
  - Detailed findings for RI-001 (complete)
  - Rationale for rejections
  - Time analysis (90 min actual, 155 min saved)
  - Impact assessment

### Folder Structure

```
work-items/O2-thought-capture/research/
├── ri-001-zod-validation.md (✔️ Complete - 7500+ lines created)
├── ri-002-express-error-handling.md (⏳ Pending Approval)
├── research-findings.md (Summary of all items)
└── (RI-003 through RI-006 were identified but rejected)
```

### Process Insight

**What Should Have Happened** (O3+ will follow):

1. ✅ Create all 6 RI files FIRST (separate files)
2. ✅ Present to user for approval/rejection/deferral
3. ✅ Execute only approved items (RI-001, maybe RI-002)
4. ✅ Save 155 minutes by rejecting RI-003 through RI-006 early
5. ✅ Each RI file tracks its own status and rationale

**Benefit of Separate Files**:

- Each RI can be reviewed independently
- User can approve/reject individual items easily
- Clear tracking of status per item
- Mirrors familiar ADR pattern
- Easier to reference specific research items

---

## Templates

### RI Template (Each Item is Separate File)

**Location**: `work-items/_template/research/ri-001-example-technology.md`

**Usage**: Copy for each research item, rename with specific technology/pattern

### Research Findings Template (Summary Document)

**Location**: `work-items/_template/research/research-findings.md`

**Usage**: Create once per feature, update during execution

---

## Related Documentation

- **KB Instructions**: [knowledge-base.instructions.md](../../.github/instructions/knowledge-base.instructions.md) - Where to place KB docs
- **Feature Workflow**: [workflows-apr-retro.md](workflows-apr-retro.md) - Complete feature workflow
- **RI Template**: [work-items/\_template/research/ri-001-example-technology.md](../../work-items/_template/research/ri-001-example-technology.md) - Template for each RI file
- **Research Findings Template**: [work-items/\_template/research/research-findings.md](../../work-items/_template/research/research-findings.md) - Summary template

---

## Key Takeaways

1. **Each RI is a Separate File** - Not one research-plan.md with all items
2. **File Naming**: `ri-001-technology-name.md`, `ri-002-pattern-name.md`, etc.
3. **Template-Driven**: Copy `ri-001-example-technology.md` for each item
4. **User Reviews Each File**: Approve/reject/defer individual items
5. **Status Tracked Per File**: Each RI file has its own status
6. **Summary in research-findings.md**: Overview of all items and outcomes
