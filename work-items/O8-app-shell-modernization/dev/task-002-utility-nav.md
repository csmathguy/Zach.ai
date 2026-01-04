# Task-002: Implement config-driven utility nav + feature flag + analytics hook

**Priority**: Critical  
**Status**: In Progress  
**Started**: 2026-01-03  
**Completed**: TBD  
**Developer**: TBD

---

## Task Overview

**What**: Build the UtilityNav component driven by config, including feature-flag gating and analytics hooks for Heart/Brain/Light Bulb items.

**Why**: The utility tray is the primary navigation affordance for the new shell and must satisfy accessibility, routing, and telemetry requirements.

**Success Criteria**:

- [ ] UtilityNav renders items from config with stable IDs.
- [ ] Each button has `data-nav-id` and correct `aria-pressed`.
- [ ] Feature-flagged items are hidden when disabled.
- [ ] Analytics hook fires on selection without affecting navigation.
- [ ] Keyboard navigation matches TS-002/TS-003 requirements.

---

## Architecture References

**ADRs**:

- [ADR-002: Utility Navigation Architecture](../architecture/adr-002-utility-navigation.md)

**Contracts**:

- [contracts.md](../architecture/contracts.md) - Utility Navigation contract and guarantees
- [contracts.md](../architecture/contracts.md) - Feature Flag helper contract

**Guides**:

- [architecture/README.md](../architecture/README.md)
- [architecture/integration.md](../architecture/integration.md)

---

## Test Suites

**Associated Test Suites**:

- TS-002 Icon Navigation & Routing
- TS-003 Shell Experience E2E
- TS-004 Accessibility & Contrast Audits

**Expected Test Files** (to be created/updated):

- `frontend/src/app-shell/__tests__/utility-nav.test.tsx`
- `frontend/src/app-shell/__tests__/utility-nav-a11y.test.tsx`
- `e2e/app-shell-utility-nav.spec.ts`

---

## Task Breakdown

1. Create `utilityNavConfig` with Heart/Brain/Light Bulb items and routes.
2. Implement `UtilityNav` component with config-driven rendering.
3. Add `data-nav-id`, `aria-pressed`, focus styles, and roving tabindex behavior.
4. Implement feature flag checks per item.
5. Add analytics hook (`onSelect`) without side effects.
6. Ensure routing uses React Router navigation and avoids double pushes.
7. Add/adjust TS-002 tests for keyboard and routing behavior.
8. Add/adjust TS-003/TS-004 coverage for focus order and aria.

---

## Environment Notes

- TBD

---

## TDD Cycle

### RED (Write failing tests)

- [ ] Buttons render with stable `data-nav-id` and correct labels.
- [ ] Feature-flagged items are omitted when disabled.
- [ ] Keyboard navigation and activation follow contract.

### GREEN (Make tests pass)

- [ ] Implement `UtilityNav` + config + analytics hook.

### REFACTOR (Clean up)

- [ ] Extract shared nav helpers (focus, aria, route guard).

---

## Decisions & Rationale

| Decision | Rationale | Alternatives Considered |
| --- | --- | --- |
| TBD | TBD | TBD |

---

## Dependencies / Blockers

- Depends on `task-001-theme-platform.md` for theme tokens and focus styling.
