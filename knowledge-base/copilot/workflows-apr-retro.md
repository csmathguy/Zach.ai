# Feature Workflow Guidance: APR, Architecture, Testing & Retrospectives

This page consolidates external research into actionable guidance for our complete feature workflow. Use it when drafting APRs/PRDs, designing architecture, planning tests, or running retrospectives.

## Feature Development Workflow

The complete workflow follows these phases:

1. **Planning (APR)** - Business requirements, user stories, success metrics
2. **Architecture (ADR)** - Technical design, contracts, interfaces, patterns
3. **Design (UX/UI)** - Frontend UX specs, accessibility, mobile behavior
4. **Research** - Knowledge base documentation for new technologies
5. **Testing** - Test strategy, Gherkin specifications using contracts
6. **Development** - Implementation following architecture + tests
7. **Retrospective** - Lessons learned, improvements

**Critical Insight**: Architecture must come BEFORE testing. Testers need contracts/interfaces to write meaningful tests.

**Branch Requirement**: Create the feature branch immediately after APR approval and before any artifacts or code changes. All later phases must verify they are not working on `main`.

## Product Requirements (APR/PRD) Essentials

**Source:** [ProductPlan – Product Requirements Document](https://www.productplan.com/glossary/product-requirements-document/)

Key sections to include in every APR:

1. **Overview & Objective** – Why we are building this feature and what success looks like.
2. **Goals & Success Metrics** – Business/user outcomes, non-goals, quantitative success criteria.
3. **Scope** – In/out of scope functionality, dependencies, timeline assumptions.
4. **Feature Breakdown** – For each capability: description, user story/use case, acceptance criteria, test considerations.
5. **UX / Flow Notes** – User workflow, design references, **accessibility notes (WCAG 2.1 AA minimum)**.
6. **System Requirements & Constraints** – Target environments, performance budgets, compliance needs.
7. **Assumptions / Constraints / Dependencies** – Preconditions, technical or budgetary limits, external services relied upon.
8. **Risks & Mitigations** – Known risks plus mitigation/rollback plans.
9. **Validation & Rollout Plan** – Test strategy (unit/integration/E2E/manual), telemetry/observability, release strategy.

**Critical APR Requirements**:

- **Accessibility from Day 1**: Define WCAG requirements, keyboard navigation patterns, ARIA labels, screen reader support in UX/Flow Notes section
- **Performance Baselines**: Specify acceptable load times, bundle size limits, and measurement approach
- **Architecture Decisions**: Document why specific patterns/libraries chosen (for ADR)
- **Testability**: Note which components are testable via unit tests vs require integration/E2E

Implementation notes:

- Capture links to the per-feature workspace (e.g., `work-items/<branch>/plan/apr.md`).
- End APR planning by creating/switching to the dedicated Git branch before any code edits.
- Reference this document from Copilot prompts/agents so the APR checklist stays consistent.

## Continuous Retrospectives (Phase-by-Phase)

**Philosophy**: Rather than waiting until the end, each agent documents their retrospective immediately after completing their phase. This creates a continuous feedback loop and helps subsequent agents learn from earlier work.

### Why Continuous Retrospectives?

1. **Fresh Context**: Insights are captured while details are still fresh
2. **Early Problem Detection**: Issues identified early can be addressed before compounding
3. **Knowledge Transfer**: Each agent learns from previous agents' findings
4. **Workflow Improvement**: Patterns emerge that can improve the process immediately
5. **Historical Record**: Complete timeline of decisions and learnings

### Retrospective Timing

| Agent           | When to Document                                         | Purpose                                                           |
| --------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| **Planner**     | After APR approval, before architect handoff             | Were requirements clear? Did stakeholders provide enough context? |
| **Architect**   | After ADRs/contracts created, before designer handoff    | Did design decisions work? Were contracts clear?                  |
| **Designer**    | After UX specs documented, before tester handoff         | Are flows usable? Accessibility/mobile covered?                   |
| **Tester**      | After test strategy documented, before developer handoff | Were contracts sufficient? Are tests realistic and valuable?      |
| **Developer**   | After implementation complete, before final retro        | Did architecture guide implementation? Were tests helpful?        |
| **Retro Agent** | After feature complete                                   | Synthesize all phase retrospectives into overall learnings        |

### Retrospective Template Location

All phase retrospectives are documented in: `work-items/<branch>/retro/retrospective.md`

Each agent adds to their designated section:

- Planning Phase (Planner Agent)
- Architecture Phase (Architect Agent)
- Design Phase (Designer Agent)
- Testing Phase (Tester Agent)
- Development Phase (Developer Agent)
- Overall Feature Retrospective (Retro Agent synthesizes)

### Key Questions for Each Phase

**Planning (Planner)**:

- Were user stories clear and testable?
- Did we identify all accessibility and performance requirements?
- What information was missing that delayed architecture?

**Architecture (Architect)**:

- Did chosen patterns align with requirements?
- Were contracts complete enough for testing?
- What trade-offs proved correct/incorrect?

**Design (Designer)**:

- Are user flows clear and minimal?
- Did we document mobile and accessibility expectations?
- What UI states need explicit tests?

**Testing (Tester)**:

- Could we test everything specified in contracts?
- Were coverage targets realistic?
- What edge cases were discovered?

**Development (Developer)**:

- Did ADRs prevent rework?
- Were tests valuable for TDD?
- What SOLID violations emerged and why?

### Retrospective Handoff Pattern

```
Phase Complete → Document Retrospective → Hand Off to Next Agent
```

**Example**: Architect completes ADRs → Documents architecture retrospective → Hands off contracts to tester

This ensures the tester can read the architect's concerns about contract clarity or missing requirements BEFORE designing tests.

## Retrospective Best Practices

**Source:** [Atlassian – Sprint Retrospectives](https://www.atlassian.com/team-playbook/plays/retrospective)

Core principles:

- Retros happen at the end of each feature/sprint and last long enough (45–90 min) for meaningful insight.
- Encourage transparency: focus on continuous improvement instead of blame.
- Use structured prompts (e.g., _What went well? What didn’t? What did we learn? What will we change?_, or 4Ls: Loved, Loathed, Learned, Longed for).
- Emphasize team **reflexivity**—collective reflection on goals, strategy, and process to adapt faster.
- Produce concrete action items with owners and due dates; follow up in the next retro.

Recommended retrospective template sections (mirrors `work-items/_template/.../retro/retrospective.md`):

1. Quick summary (outcome, dates, participants).
2. Wins (what went well).
3. Frictions / missing info (what slowed us down, architectural misalignments, tool gaps).
4. Learnings / experiments (insights and ideas to try next).
5. Improvement actions (KB updates, agent tweaks, tooling work), each with owner + date.
6. Follow-ups (items that must become tickets or future features).

## Architecture Decision Records (ADR) Essentials

**Purpose**: Document major technical decisions so future developers understand WHY choices were made.

**Source**: [Michael Nygard - ADR Documentation](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

### ADR Structure

Each ADR should include:

1. **Context** - What problem are we solving? What factors influence the decision?
2. **Decision** - What are we doing? Be specific and concrete.
3. **Rationale** - Why this decision over alternatives? What are the benefits?
4. **Alternatives Considered** - What other options were evaluated and why rejected?
5. **Consequences** - Positive impacts, negative trade-offs, risks + mitigations
6. **Implementation Notes** - Key classes/interfaces, integration points, migration path
7. **Compliance** - SOLID principles, patterns, testing, accessibility, performance

### When to Create ADRs

- Database choice (SQLite vs PostgreSQL vs MongoDB)
- ORM selection (Prisma vs TypeORM vs Knex)
- Design patterns (Repository, Factory, Strategy)
- Architectural patterns (Layered, Hexagonal, Clean)
- Technology choices (React vs Vue, Express vs Fastify)
- Major refactoring decisions

### ADR Best Practices

- **One Decision Per ADR**: Keep focused
- **Immutable**: ADRs are historical records, don't edit them
- **Status**: Mark as Proposed → Accepted → Deprecated → Superseded
- **Reference APR**: Link to business requirements
- **Document Trade-offs**: Be honest about negative consequences

## Architecture Phase Essentials

**When**: After APR approval, BEFORE testing begins

**Why**: Testers need contracts/interfaces to write tests. Developers need design decisions to implement correctly.

### Architecture Artifacts

1. **ADRs** (`adr-*.md`) - Major technical decisions
2. **Contracts** (`contracts.md`) - All interfaces, domain models, DTOs
3. **Diagrams** (`diagrams.md`) - ERD, component, sequence diagrams
4. **Layers** (`layers.md`) - How feature fits into layered architecture
5. **Integration** (`integration.md`) - How feature integrates with existing codebase

### Architecture Deliverables for Testers

Testers receive:

- **Repository interfaces** with method signatures
- **Domain models** with properties and invariants
- **DTOs** with field definitions
- **Error contracts** defining when exceptions are thrown
- **Contract guarantees** specifying behavior (e.g., "returns null if not found, never throws")

Example:

```typescript
interface IUserRepository {
  create(data: CreateUserDto): Promise<User>; // Throws on duplicate email
  findById(id: string): Promise<User | null>; // Returns null if not found, never throws
}
```

Testers write scenarios against these contracts:

```gherkin
Scenario: Create user with duplicate email
  Given a user exists with email "test@example.com"
  When I attempt to create another user with email "test@example.com"
  Then a UniqueConstraintError should be thrown
```

### Architecture Deliverables for Developers

Developers receive:

- **ADRs** explaining WHY decisions were made
- **Folder structure** showing where files go
- **Implementation checklist** referencing ADRs
- **SOLID compliance** requirements
- **Integration points** with existing code

## How Copilot Agents Should Use This Guidance

### Planning Agent (planner)

- Enforce APR structure
- Include accessibility requirements (WCAG 2.1 AA)
- Include performance baselines
- **Hand off to architect agent** (not researcher) after APR approval
- Create feature branch immediately after APR approval
- **Document planning retrospective** in `work-items/<branch>/retro/retrospective.md` before handoff

### Architecture Agent (architect)

- Analyze APR to extract technical requirements
- Create ADRs for major decisions (database, ORM, patterns, layers)
- Define all contracts (interfaces, domain models, DTOs)
- Create diagrams (ERD, component, sequence)
- Document layer architecture and integration points
- Ensure SOLID compliance
- Confirm you are on a feature branch before writing architecture artifacts
- **Provide contracts to tester agent**
- **Provide ADRs to developer agent**
- Hand off to researcher if new technologies identified
- **Document architecture retrospective** in `work-items/<branch>/retro/retrospective.md` before handoff

### Design Agent (designer)

- Translate APR requirements into UI/UX specs
- Reference `knowledge-base/design/README.md` for styling guidance
- Document layout, component states, accessibility, and mobile behavior
- Provide design artifacts to tester and developer agents
- Confirm you are on a feature branch before writing design artifacts
- **Document design retrospective** in `work-items/<branch>/retro/retrospective.md` before handoff

### Research Agent (researcher)

- Identify new technologies from architecture decisions
- Research best practices via web search
- Create comprehensive knowledge base documentation (400+ lines per technology)
- Document findings in `work-items/<branch>/research/research-findings.md`
- Hand back to architect or proceed to tester

### Testing Agent (tester)

- **Receive contracts from architect agent**
- Design test strategy (Gherkin specifications, test plan)
- Document what to test (contract guarantees, edge cases, scenarios)
- Specify coverage targets (70%+ minimum per layer)
- Reference APR acceptance criteria
- Define success criteria for tests
- **Does NOT write actual Jest test code** (developer does this)
- **Hands off test plan to developer** for test implementation
- **Document testing retrospective** in `work-items/<branch>/retro/retrospective.md` before handoff

### Development Agent (developer)

- **Receive ADRs from architect agent**
- **Receive test plan from tester agent**
- Review retrospective insights from previous phases
- Confirm you are on a feature branch before writing research artifacts
- Confirm you are on a feature branch before writing test artifacts
- Confirm you are on a feature branch before writing code or tests

**Step 1: Verify/Create Contracts**

- Check if contracts exist (domain models, repository interfaces)
- Create contracts if needed OR update existing contracts
- Ensure interfaces match test plan requirements

**Step 2: Implement Tests (TDD RED phase)**

- Read test plan specifications
- Write Jest tests based on test plan
- Domain layer tests (pure, no mocks) → ✅ PASS immediately
- Application layer tests (with `jest.fn()` mocks) → ✅ PASS immediately
- Infrastructure layer tests (integration) → 🔴 FAIL (expected)
- Run tests → verify 🔴 RED on infrastructure layer

**Step 3: Implement Features (TDD GREEN phase)**

- Implement repositories/services to make tests pass
- Run tests continuously → 🟢 PASS
- Follow SOLID principles
- Run `npm run validate` frequently
- **Zero red files policy** - no TypeScript errors allowed

**Step 4: Refactor (maintain GREEN)**

- Remove dead code aggressively
- Code review checkpoints:
  - **Mid-implementation**: Check SRP and OCP
  - **Pre-commit**: Full SOLID assessment
- Verify coverage targets met
- **Document development retrospective** in `work-items/<branch>/retro/retrospective.md` before handoff

### Retrospective Agent (retro)

- Review all phase-specific retrospectives from planning, architecture, testing, and development
- Follow 4Ls framework (Loved, Loathed, Learned, Longed for) for overall feature retrospective
- Review architectural decisions - did they work out?
- Synthesize learnings from all phases
- Recommend concrete updates (KB change, new skill, ADR improvements)
- Complete overall retrospective in `work-items/<branch>/retro/retrospective.md`
- Create follow-up tickets for improvements

## Key Learnings from Feature Development

### Testing Patterns

- **jest-dom with @jest/globals**: Use `import '@testing-library/jest-dom/jest-globals'` (not standard import)
- **Zero TypeScript errors**: Run `npm run typecheck` before committing, fix matcher type errors
- **Test behavior, not implementation**: Focus on user-facing behavior and critical paths
- **Testability categories**: Different code types have different coverage expectations

### Code Quality Practices

- **Remove dead code aggressively**: Don't let unused components linger until Phase 8
- **SOLID reviews at multiple phases**: Early reviews catch issues before they compound
- **TypeScript strict mode**: Catches bugs before runtime, maintain zero errors throughout
- **Accessibility continuous**: Not just Phase 8 - test keyboard nav, screen readers early

### Workflow Improvements

- **Architecture before testing**: Testers need contracts to write meaningful tests
- **Branch immediately after APR**: Before any code edits, create feature branch
- **Document architecture decisions**: Create ADRs for all major decisions
- **Define contracts early**: Interfaces stabilize before implementation begins
- **Performance baselines early**: Don't wait until testing phase to measure
- **act() warnings immediate**: Never defer React Testing Library warnings
- **ADRs are immutable**: Don't edit approved ADRs, create new ones (supersede pattern)
