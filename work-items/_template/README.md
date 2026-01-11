# Work Item Template

This is the canonical template for all work items. Copy the entire `_template/` directory contents to create a new feature workspace at `work-items/<feature-name>/`.

## Directory Structure

```
work-items/<feature-name>/
  plan/
    apr.md                    # APR (Architectural/Product Requirements)
    open_questions.md         # Planning questions to resolve early
  architecture/
    README.md                 # Architecture overview
    adr-001-decision.md       # Architecture Decision Records
    contracts.md              # Interfaces, DTOs, domain models
    diagrams.md               # ERD, component, sequence diagrams
    layers.md                 # Layer architecture documentation
    open_questions.md         # Architecture questions to resolve
  design/
    README.md                 # Design summary and key decisions
    ui-spec.md                # UI spec: layout, states, accessibility
    open_questions.md         # Design questions to resolve
  research/
    ri-001-technology.md      # Individual research items (separate files)
    ri-002-pattern.md
    research-findings.md      # Summary of all research
    open_questions.md         # Research questions to resolve
  tests/
    test-plan.md              # Overall test strategy
    TS-001-test-suite.md      # Individual test suite specs
    open_questions.md         # Testing questions to resolve
  dev/
    README.md                 # Development summary and task breakdown
    task-001-task-name.md     # Individual task files
    task-002-task-name.md     # (Create as needed)
    open_questions.md         # Development questions to resolve
  retro/
    retrospective.md          # Summary linking to all RET entries
    RET-001-planning-phase.md
    RET-002-architecture-phase.md
    RET-003-design-phase.md
    RET-004-research-phase.md # (if research occurred)
    RET-005-testing-phase.md
    RET-006-development-phase.md
    RET-007-overall-feature.md # (by retro agent)
    open_questions.md         # Retrospective follow-ups (if any)
```

## Phase-by-Phase Usage

### Planning Phase (Planner Agent)

- Create `plan/apr.md` from template
- Define goals, success metrics, user stories

### Architecture Phase (Architect Agent)

- Create `architecture/` folder with ADRs, contracts, diagrams
- Document technical decisions and interfaces

### Design Phase (Designer Agent)

- Create `design/README.md` with design summary and key decisions
- Create `design/ui-spec.md` covering layout, states, accessibility, mobile

### Research Phase (Researcher Agent)

- Create individual `research/ri-001-*.md` files (one per technology/pattern)
- Update `research/research-findings.md` summary

### Testing Phase (Tester Agent)

- Create `tests/test-plan.md` from template
- Create individual `tests/TS-001-*.md` test suite specs

### Development Phase (Developer Agent)

- Create `dev/README.md` with task breakdown and quality gates
- Create individual `dev/task-001-*.md` files for each discrete task
- Track dependencies, decisions, issues in README.md
- Follow TDD: RED -> GREEN -> REFACTOR for each task

### Retrospective Phase (Retro Agent)

- Each agent creates individual RET-### retrospective at end of their phase:
  - Planner -> `RET-001-planning-phase.md`
  - Architect -> `RET-002-architecture-phase.md`
  - Designer -> `RET-003-design-phase.md`
  - Researcher -> `RET-004-research-phase.md` (if applicable)
  - Tester -> `RET-005-testing-phase.md`
  - Developer -> `RET-006-development-phase.md`
- Retro agent synthesizes all into:
  - `RET-007-overall-feature.md` (comprehensive synthesis)
  - `retrospective.md` (summary with cross-phase themes and consolidated actions)

## Template Files

- **`plan/apr.md`** - APR template with all required sections
- **`research/ri-001-example-technology.md`** - Individual research item template
- **`tests/test-plan.md`** - Test strategy template
- **`tests/TS-001-example-test-suite.md`** - Test suite specification template
- **`dev/README.md`** - Development summary, task breakdown, quality gates
- **`dev/task-001-example-task.md`** - Individual task template (TDD cycle, implementation details)
- **`design/README.md`** - Design summary template
- **`design/ui-spec.md`** - UI spec template
- **`retro/RET-001-example-phase.md`** - Individual phase retrospective template (copy for each agent)
- **`retro/retrospective.md`** - Retrospective summary linking to all RET-### entries

## How to Use

1. **Copy entire template**:

   ```bash
   cp -r work-items/_template work-items/<feature-name>
   ```

2. **Rename placeholders**:
   - Replace `[Feature Name]` with actual feature name
   - Replace `<feature-name>` with kebab-case name
   - Update dates to current date

3. **Create feature branch**:

   ```bash
   git checkout -b feat/<feature-name>
   ```

4. **Follow phase-by-phase workflow** as documented in agent instructions
