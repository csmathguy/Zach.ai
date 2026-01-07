# ADR-002: Utility Navigation Architecture

- **Date**: 2026-01-03
- **Status**: Accepted
- **Owner**: Architecture (O8 App Shell Modernization)
- **Related Requirements**: APR §4.2, Test Plan TS-002/TS-003

---

## Context

The modernized shell requires a visually rich “utility bar” that renders the Heart (health), Brain (Knowledge), and Light Bulb (Ideas) icons from the APR. Constraints:

1. Icons must navigate to different surfaces today (Health = Codebase Analysis, Brain = placeholder Knowledge route, Light Bulb = Inbox/Ideas placeholder) while remaining extensible for future implementations.
2. The navigation should be screen-reader friendly with clear `aria-label`s, tooltips, and keyboard focus styling.
3. We need to experiment with feature flags (ability to disable icons per environment) and analytics (emit events on click) without scattering logic throughout the layout.
4. The icon tray should not depend on Redux/global stores; React Router is already the navigation mechanism.

---

## Decision

Introduce a **config-driven navigation module** under `frontend/src/app-shell/navigation/` with the following pieces:

1. **`utilityNavConfig.ts`** exports an ordered array of `UtilityNavItem` objects:

```ts
export interface UtilityNavItem {
  id: 'health' | 'knowledge' | 'ideas';
  label: string;
  description: string;
  icon: IconComponent; // React component receiving { active: boolean }
  route: string;
  featureFlag?: string; // e.g., 'knowledge.placeholder' or future flags
  onSelect?: () => void; // optional analytics hook
  target?: '_blank';
}
```

2. **`UtilityNav.tsx`** renders the tray. It:
   - Filters placeholder-level feature flags so unfinished surfaces hide cleanly.
   - Filters items with `featureFlag` set when the flag is disabled.
   - Uses `useLocation()` from React Router to highlight the active icon.
   - Emits analytics events via optional `onSelect` callbacks.
   - Supports keyboard navigation (buttons with `role="tab"`, arrow-key roving focus, `aria-controls` referencing section IDs).

3. **Route Wiring**
   - Heart → `/codebase-analysis?panel=health`
   - Brain → `/knowledge`
   - Light Bulb → `/ideas` (placeholder referencing Inbox/O3 work item)
   - Each target route owns its own placeholder or existing view, enabling deep links and future replacement without shell changes.

4. **Feature Flag Compatibility**
   - Placeholder entries (`knowledge.placeholder`, `ideas.placeholder`, etc.) remain flaggable so product can hide unfinished surfaces without re-cutting the nav.

---

## Rationale

- **Extensibility**: Adding a new icon is a one-line config change + route component, no modifications to layout or analytics wiring.
- **Accessibility**: Centralizing metadata ensures every icon has label/description/tooltips defined once and reused for ARIA.
- **Testing**: Config can be mocked in Jest (TS-002) to assert correct routing + feature flag gating without mounting the whole app.
- **Rollout Safety**: We can turn off specific icons (e.g., Brain) per environment while still shipping others by toggling `featureFlag` on each item.

---

## Alternatives Considered

| Option                                             | Outcome                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Hard-coded JSX buttons inside `App.tsx`            | Violates DRY, difficult to add analytics/flags per icon later.                     |
| Reusing top navigation (text links)                | Does not satisfy APR requirement for quick-access icon tray and would repeat copy. |
| Creating a global Redux slice for navigation state | Overkill for three icons; React Router already tracks location.                    |

---

## Consequences

### Positive

- Icon metadata lives in a single location, enabling design + copy iteration without touching layout.
- Config can drive documentation (auto-generate tooltips, analytics events) and ensures testers know the canonical routes.
- Future features (Inbox, Knowledge) simply replace placeholder component while keeping route stable.

### Negative / Risks

- Requires a canonical icon component set (SVG or Lucide). We must standardize icon props (`size`, `strokeWidth`) to avoid inconsistent visuals.
- Need to maintain mapping between nav `id` and actual route component; misalignment leads to 404s. Integration tests (TS-002) mitigate this.

---

## Implementation Notes

1. **Directory Structure**
   - `frontend/src/app-shell/navigation/utilityNavConfig.ts`
   - `frontend/src/app-shell/navigation/UtilityNav.tsx`
   - `frontend/src/app-shell/navigation/NavIconButton.tsx` (handles hover/focus, tooltip, ARIA)
2. **Styling**
   - CSS Module `UtilityNav.module.css` uses theme tokens for glow/hover states.
3. **Analytics**
   - Provide a `fireUtilityNavEvent(id: string)` helper (no-op today) so future telemetry is centralized.
4. **Feature Flag**
   - Read placeholder flags from `window.__APP_FEATURES__` with fallback to `import.meta.env` (`VITE_FEATURE_KNOWLEDGE_PLACEHOLDER`, etc.) via `isFeatureEnabled`.

---

## Compliance Checklist

- **SOLID**: Config + render components separate (SRP). UtilityNav consumes navigation service instead of embedding logic.
- **Accessibility**: Buttons advertise label/description, support keyboard roving, and meet focus contrast guidelines by leveraging theme tokens.
- **Testing**: TS-002/TS-003 cover navigation + feature flag gating. Unit tests cover config filtering + analytics hook.
- **Rollback**: Toggle individual placeholder flags to hide unfinished icons; the utility tray itself no longer ships behind a kill switch.
