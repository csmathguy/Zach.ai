# Task-001: Build theme platform (provider, tokens, toggle, storage helpers)

**Priority**: Critical  
**Status**: Complete  
**Started**: 2026-01-03  
**Completed**: 2026-01-03  
**Developer**: Developer Agent (Codex)

---

## Task Overview

**What**: Implement the theme platform: tokens, ThemeProvider, useTheme hook, and a toggle button that persists preference and respects system settings.

**Why**: The new App Shell relies on a consistent, accessible theme layer that can be toggled, persisted, and exercised by TS-001/TS-003/TS-004.

**Success Criteria**:

- [x] ThemeProvider exposes `useTheme()` returning `ThemeContextValue`.
- [x] `<html>` is updated with `data-theme="light" | "dark"`.
- [x] Theme preference persists to `localStorage['app-shell-theme-preference']`.
- [x] System preference is honored when `preference === 'system'`.
- [x] Theme toggle button is accessible and testable (`data-testid="theme-toggle"`).
- [x] TS-001 + TS-003 + TS-004 scenarios pass for theme behavior (unit coverage completed; integration/E2E pending in later tasks).

---

## Architecture References

**ADRs**:

- [ADR-001: Theme Tokens & Provider Strategy](../architecture/adr-001-theme-system.md)

**Contracts**:

- [contracts.md](../architecture/contracts.md) - Theme System contracts and guarantees

**Guides**:

- [architecture/README.md](../architecture/README.md)
- [architecture/integration.md](../architecture/integration.md)

---

## Test Suites

**Associated Test Suites**:

- TS-001 Theme Provider & Tokens
- TS-003 Shell Experience E2E
- TS-004 Accessibility & Contrast Audits

**Expected Test Files** (to be created/updated):

- `frontend/src/app-shell/__tests__/theme-provider.test.tsx`
- `frontend/src/app-shell/__tests__/theme-toggle.test.tsx`
- `e2e/app-shell-theme.spec.ts`

---

## Task Breakdown

1. Verify existing theme and CSS variable usage under `frontend/src`.
2. Create token definitions and a token-to-CSS-vars mapping.
3. Implement `ThemeProvider` + `useTheme()` hook with system preference detection.
4. Persist preference to `localStorage` with SSR-safe guards.
5. Implement `ThemeToggleButton` with required data attributes.
6. Wire tokens into app-shell styles (no global regressions).
7. Add/adjust TS-001 tests for hook behavior and persistence.
8. Add/adjust TS-003/TS-004 coverage for toggle and contrast checks.

---

## Environment Notes

- Theme scaffolding exists at `frontend/src/app-shell/theme/ThemeProvider.tsx` and `frontend/src/app-shell/theme/types.ts`.
- Token + helper modules added: `frontend/src/app-shell/theme/theme-tokens.ts`, `frontend/src/app-shell/theme/theme-storage.ts`, `frontend/src/app-shell/theme/theme-utils.ts`.
- Tests added under `frontend/src/app-shell/theme/__tests__/`.
- `frontend/jest.setup.ts` does not currently mock `matchMedia`.
- Tooling: Node `v22.12.0`, PowerShell `5.1.26100.7462`.

---

## TDD Cycle

### RED (Write failing tests)

- [x] Theme hook returns correct defaults when no preference is stored.
- [x] Toggling updates `data-theme` and persisted preference.
- [x] `system` preference tracks `prefers-color-scheme`.

### GREEN (Make tests pass)

- [x] Implement ThemeProvider + hook + tokens.
- [x] Implement ThemeToggleButton.

### REFACTOR (Clean up)

- [x] Extract shared helpers for storage and media query handling.
- [x] Consolidate token usage to avoid duplication.

---

## Decisions & Rationale

| Decision | Rationale | Alternatives Considered |
| --- | --- | --- |
| Split storage/media helpers into separate modules | Keeps ThemeProvider focused and makes helpers testable | Inline helpers inside ThemeProvider |

---

## Dependencies / Blockers

- None (foundational task).

---

## Implementation Details

**Files Added**

- `frontend/src/app-shell/theme/theme-tokens.ts`
- `frontend/src/app-shell/theme/theme-storage.ts`
- `frontend/src/app-shell/theme/theme-utils.ts`
- `frontend/src/app-shell/theme/ThemeToggleButton.tsx`
- `frontend/src/app-shell/theme/__tests__/ThemeProvider.test.tsx`
- `frontend/src/app-shell/theme/__tests__/ThemeToggleButton.test.tsx`

**Files Updated**

- `frontend/src/app-shell/theme/ThemeProvider.tsx`

---

## Test Results

```
npm test --prefix frontend -- --runInBand ThemeProvider.test.tsx ThemeToggleButton.test.tsx
PASS (2 suites, 7 tests)
```

---

## Retrospective Notes

**What Went Well**

- Tests drove the provider contracts and uncovered missing persistence/ARIA details early.
- Refactoring helpers into modules reduced ThemeProvider complexity without breaking tests.

**What Could Improve**

- Initial provider stub was too minimal; a small upfront checklist for storage + media query behavior would speed RED.
