# ADR-001: Theme Tokens & Provider Strategy

- **Date**: 2026-01-03
- **Status**: Accepted
- **Owner**: Architecture (O8 App Shell Modernization)
- **Related Requirements**: APR §4.1 (Theme provider & toggle), Test Plan TS-001/TS-003

---

## Context

The modernized shell must:

1. Provide accessible light/dark modes that respond to the user's OS preference but also allow manual override with persistence (APR §4.1, §4.2).
2. Expose semantic color/spacing tokens that downstream features (Home, Codebase Analysis, future Inbox/Knowledge Base) can consume without duplicating SCSS variables.
3. Avoid large runtime bundles or CSS-in-JS performance costs (keep Vite build lean, maintain current CSS Modules story).
4. Support Test Plan TS-001, which asserts preference storage, system overrides, and contrast ratios.

We evaluated multiple options: CSS variables authored per theme, CSS Modules with duplicate files, Tailwind config, and runtime CSS-in-JS libraries (Stitches, Emotion).

---

## Decision

Use **CSS custom properties** declared on the `:root` element (and `html[data-theme="dark"]`) to encode semantic theme tokens. A lightweight React `ThemeProvider` will:

1. Read `window.matchMedia('(prefers-color-scheme: dark)')` on mount to set the initial theme if no stored preference exists.
2. Persist manual overrides via `localStorage` under the key `app-shell-theme-preference`.
3. Write the active theme to a `data-theme` attribute on `<html>` so CSS can switch token sets without re-rendering components.
4. Expose a `ThemeContext` + `useTheme()` hook returning `{ theme: 'light' | 'dark', setTheme, resolvedFromSystem: boolean }`.
5. Provide a `ThemeToggleButton` component that announces current state to assistive tech (ARIA pressed state, `aria-live="polite"`).

Token definitions live in `frontend/src/app-shell/theme/theme-tokens.ts` with the following structure:

```ts
export interface ThemeTokens {
  elevation: {
    surface: string;
    panel: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brand: {
    heart: string;
    brain: string;
    bulb: string;
  };
  feedback: {
    success: string;
    warning: string;
    danger: string;
  };
  borderRadius: string;
  spacingUnit: number;
}
```

`ThemeProvider` injects tokens via CSS variables (e.g., `--color-text-primary`) and optionally via React context for components that need raw values (e.g., charts).

---

## Rationale

- **Performance**: CSS variables toggle instantly without triggering React tree re-rendering or recomputing styles in JS.
- **DX**: Existing CSS Modules can read `var(--color-text-primary)` with no new tooling. Components needing dynamic styling can still import the token map.
- **Accessibility**: Having both system-respecting default and persisted overrides satisfies WCAG 2.1 AA (Contrast + user control) and Test Plan TS-001 requirements.
- **Rollout**: The modern shell (and ThemeProvider) now ship always-on; the former `appShell.refresh` flag was retired after the January 2026 rollout when legacy chrome support was removed.

---

## Alternatives Considered

| Option                    | Outcome                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **CSS Modules per theme** | Required duplicating every stylesheet and complex build-time swapping. Hard to scale as new tokens arrive.                            |
| **Tailwind CSS**          | Would introduce new tooling, purge config, and conflict with existing CSS Modules without clear benefit for just three icons + cards. |
| **Emotion/Stitches**      | Adds runtime cost and reintroduces style recalculations when the theme changes. Not necessary for simple token switching.             |

---

## Consequences

### Positive

- Rapid theme toggle (< 16ms) that satisfies “instant feedback” APR acceptance criteria.
- Single source of truth for colors/spacing ensures cards, nav tray, and future pages stay aligned.
- Theme logic is unit-testable (pure hook) and integration-testable (DOM `data-theme` attribute + CSS variable assertions per TS-001).

### Negative / Risks

- Need to polyfill MatchMedia during Jest tests (already handled via `jest.setup.ts`).
- Any future design tokens (e.g., typography scale) must be added to both CSS variable declarations and TypeScript interface.
- LocalStorage access must be wrapped in try/catch for SSR or restricted environments.

Mitigations: provide `safeStorage` helper that no-ops when `localStorage` unavailable; add test coverage for fallback paths.

---

## Implementation Notes

1. **Files**
   - `frontend/src/app-shell/theme/ThemeProvider.tsx`
   - `frontend/src/app-shell/theme/theme-tokens.ts`
   - `frontend/src/app-shell/theme/useTheme.ts`
   - `frontend/src/app-shell/theme/theme-storage.ts`
2. **CSS**
   - Base token definitions in `frontend/src/app-shell/theme/theme.css` imported once in `main.tsx`.
   - Example variable: `:root { --color-surface: #f8f9fb; }` vs `[data-theme="dark"] { --color-surface: #111320; }`.
3. **Testing**
   - Unit tests for `resolveInitialTheme()` with combinations of stored preferences + media query.
   - React Testing Library tests verifying `data-theme` switching + button ARIA state (TS-001 scenarios).

---

## Compliance Checklist

- **SOLID**: Provider handles orchestration (single responsibility); storage/DOM concerns extracted into helpers.
- **Performance**: No additional render loops; CSS handles most work.
- **Accessibility**: Toggle button text + `aria-pressed`, color tokens meet 4.5:1 contrast target.
- **Rollout**: Feature flag ensures legacy theme unaffected until QA completes.
