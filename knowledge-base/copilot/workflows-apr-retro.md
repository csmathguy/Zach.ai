# Feature Workflow Guidance: APR & Retrospectives

This page consolidates external research into actionable guidance for our feature workflow. Use it when drafting APRs/PRDs, running retrospectives, or customizing Copilot agents/skills.

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

## How Copilot Agents Should Use This Guidance

- **Planning agents**: enforce the APR structure, ensure branch creation happens immediately after APR approval, and link to checklist items stored in per-feature folders. Include accessibility requirements and performance baselines in initial plan.
- **Test/Dev agents**: reference APR sections for acceptance criteria; remind users to run `npm run validate` (typecheck + lint + format) + manual exploratory testing before requesting commits. **Zero red files policy** - no TypeScript errors allowed.
- **Code review checkpoints**:
  - **Mid-implementation** (Phase 4-5): Check SRP and OCP, remove unused code
  - **Pre-testing** (Phase 6): Full SOLID assessment (all 5 principles)
  - **Pre-commit** (Phase 8): Final ISP and DIP check, verify all dead code removed
- **Testing agents**: Document testability categories (pure functions 100%, components 80%+, browser APIs 60%+). Use `@jest/globals` → require `/jest-globals` import for jest-dom. Address `act()` warnings immediately.
- **Retro agents**: follow the question set above, then recommend concrete updates (KB change, new skill, refined prompt) and store them under the feature's `retro/` folder.
- **Skills/prompts setup**: load this document's highlights to keep Copilot-generated artifacts aligned with best practices even if contributors aren't familiar with the original sources.

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

- **Branch immediately after APR**: Before any code edits, create feature branch
- **Document architecture decisions**: In implementation notes, create ADR sections
- **Performance baselines early**: Don't wait until testing phase to measure
- **act() warnings immediate**: Never defer React Testing Library warnings
