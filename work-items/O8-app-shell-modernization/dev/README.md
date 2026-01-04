pm run typecheck | Zero TypeScript errors across the monorepo |
pm test -- --runInBand frontend | Targeted Jest suites behave as expected |
pm run lint & 
pm run format:check | Clean lint + formatting, no warnings |
pm run validate | Combined typecheck + lint + format + tests  |
px playwright test e2e/app-shell*.spec.ts | New Playwright specs pass with flag on/off |
pm run validate + Playwright suites succeed with feature flag both enabled and disabled.
# Development Phase Task Plan

**Feature**: App Shell Modernization (O8)  
**Developer**: Developer Agent (GitHub Copilot)  
**Start Date**: 2026-01-03  
**Status**: In Progress

---

## 1. Purpose & Inputs

Translate the approved APR, ADRs, and test suites into concrete development tasks. All work follows strict TDD and remains feature-flagged behind `appShell.refresh` as defined in:

- [plan/apr.md](../plan/apr.md)
- [architecture/README.md](../architecture/README.md) plus ADR-001/002/003
- [architecture/contracts.md](../architecture/contracts.md)
- [tests/test-plan.md](../tests/test-plan.md) and TS-001–TS-004 suites
- [retro/RET-001-planning-phase.md](../retro/RET-001-planning-phase.md) & [retro/RET-004-testing-phase.md](../retro/RET-004-testing-phase.md)

---

## 2. Task Summary

| ID | Task Name | Priority | Status | Test Suites | Dependencies |
| --- | --- | --- | --- | --- | --- |
| [task-001](task-001-theme-platform.md) | Build theme platform (provider, tokens, toggle, storage helpers) | Critical | Complete | TS-001, TS-003, TS-004 | �?" |
| [task-002](task-002-utility-nav.md) | Implement config-driven utility nav + feature flag + analytics hook | Critical | dYY? In Progress | TS-002, TS-003, TS-004 | task-001 |
| [task-003](task-003-knowledge-placeholder.md) | Deliver `/knowledge` placeholder route + content contract | High | ⬜ Not Started | TS-002, TS-003, TS-004 | task-002 |
| [task-004](task-004-shell-integration.md) | Integrate AppShell wrapper, routing, and rollout plumbing | High | ⬜ Not Started | TS-001–TS-004 | task-001 & task-003 |

Legend: ⬜ Not Started · 🟡 In Progress · ✅ Complete

---

## 3. Execution Guidelines

1. **Work sequentially** – pick a task, mark it 🟡, and document every decision directly within its `task-NNN` file.
2. **TDD discipline** – write failing tests (RED), implement the smallest passing change (GREEN), then refactor while staying GREEN. Each task file references the TS suites that must drive RED scenarios.
3. **Environment verification before coding** – confirm actual file paths (`frontend/src/app-shell/**`, router entry points, feature flag helpers) and note findings under *Environment Notes* inside the active task file.
4. **Multi-file sequencing** – update contracts/interfaces first, then implementation, then tests. Run `npm run typecheck` between each group to prevent cascading errors.
5. **Feature flag safety** – new shell must render only when `appShell.refresh` is true. Provide overrides for Jest/Playwright (`?ff-appShell.refresh=false`) per ADR-002 and TS-003.
6. **Accessibility hooks** – expose `data-nav-id`, `aria-pressed`, roving `tabindex`, focus styles, and `aria-live` copy exactly as the contracts specify so TS-002/TS-004 pass without adjustments.

---

## 4. Validation & Quality Gates

Run commands from the repo root:

| Stage | Command | Expectation |
| --- | --- | --- |
| After each contract/impl edit | `npm run typecheck` | Zero TypeScript errors across the monorepo |
| After each RED/GREEN cycle | `npm test -- --runInBand frontend` | Targeted Jest suites fail/pass as expected |
| Before completing refactor | `npm run lint` · `npm run format:check` | Clean lint + formatting, no warnings |
| Pre-commit / pre-handoff | `npm run validate` | Combined typecheck + lint + format + tests |
| E2E rehearsal | `npx playwright test e2e/app-shell*.spec.ts` | Playwright passes with flag on/off |

Additional gates:

- Remove unused code immediately (imports, components, CSS, styles).
- Resolve all `act()` warnings from RTL before proceeding.
- Maintain ≥70% coverage overall and satisfy suite-level assertions in TS-001–TS-004.

---

## 5. Manual Verification Checklist

Complete after tasks 001–004 are ✅:

- [ ] Toggle between light/dark themes; confirm persistence across reloads with zero flicker.
- [ ] Keyboard traversal forwards/backwards: Heart → Brain → Light Bulb → Theme toggle → CTA links (and reverse).
- [ ] Brain icon deep link to `/knowledge` shows placeholder copy, CTA links, and passes axe scans (light + dark).
- [ ] Light Bulb route opens the existing Inbox/Thoughts flow without console errors.
- [ ] Feature flag OFF (`?ff-appShell.refresh=false`) renders the legacy shell; new components remain unmounted.

Attach screenshots and axe reports to the development retrospective.

---

## 6. Handoff Criteria

Handoff to the retro agent only when:

1. Every task file shows ✅ status, completed success criteria, and documented follow-ups.
2. `npm run validate` **and** the Playwright suite succeed with the feature flag both enabled and disabled.
3. Section 5 checklist is signed off with notes.
4. `dev/README.md` reflects actual progress and RET-005 (development phase) is filed per instructions.

---

## 7. References

- [architecture/diagrams.md](../architecture/diagrams.md) – component & routing topology
- [architecture/integration.md](../architecture/integration.md) – rollout & feature-flag plan
- Knowledge base: [development-guide](../../knowledge-base/codebase/development-guide.md), [tdd/README](../../knowledge-base/tdd/README.md), [jest/README](../../knowledge-base/jest/README.md)
