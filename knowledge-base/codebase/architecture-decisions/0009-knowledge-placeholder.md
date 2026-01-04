# ADR-003: Knowledge Hub Placeholder Delivery

- **Date**: 2026-01-03
- **Status**: Accepted
- **Owner**: Architecture (O8 App Shell Modernization)
- **Related Requirements**: APR §4.3, Risks §10, Test Plan TS-004

---

## Context

The APR mandates that the Brain icon routes to a surface that:

- Communicates that a richer Knowledge Base UI is coming soon.
- Links users directly to the canonical documentation (knowledge-base/README, architecture docs) so they are not blocked.
- Encourages feedback / roadmap awareness while we build the dedicated experience (O? work item).

Constraints:

1. The placeholder must live inside the SPA so the new shell layout remains consistent (header/footer, theme, icon tray).
2. It should be easily replaced by the real Knowledge feature without touching the navigation or shell wiring.
3. Accessibility + analytics requirements still apply (deep linkable, testable by TS-004).

---

## Decision

Create a dedicated React route at `/knowledge` that renders a **`KnowledgeComingSoon`** component. The component:

- Lives under `frontend/src/app-shell/placeholders/`.
- Receives a typed `KnowledgePlaceholderContent` object (title, body copy, CTA links, roadmap bullets) so content updates do not require component edits.
- Uses the theme tokens for high-contrast cards and leverages the global layout grid.
- Displays actionable links: “Open Knowledge Base Docs” (links to `/knowledge-base/README` in repo) and “View Architecture Guide”.
- Includes a `FeedbackCard` prompting users to file GitHub issues or contact the team, aligning with APR §8 rollout plan.

Navigation is handled via ADR-002 (Brain icon → `/knowledge`). When the real KB UI is ready, we simply replace the component with the new experience but keep the route stable to avoid breaking bookmarks/analytics.

---

## Rationale

- **Consistency**: Keeping the placeholder inside the SPA avoids context switching (no blank page or modal). Users still benefit from the revamped shell and theming.
- **Maintainability**: Decoupling content from layout allows copy updates driven by Product/Docs without developer intervention.
- **Analytics & Testing**: Dedicated route ensures we can track visits and testers can assert accessibility + contrast (TS-004) just like other pages.

---

## Alternatives Considered

| Option                              | Outcome                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| External link to GitHub README      | Breaks shell layout, cannot test theme/a11y interactions, no place for future CTA blocks.             |
| Modal overlay inside existing pages | Not friendly for long copy, and conflicts with APR requirement for direct navigation from Brain icon. |
| Embedding docs via iframe           | Adds CSP hurdles, poor accessibility, harder to style with theme tokens.                              |

---

## Consequences

### Positive

- Users immediately know where to find current docs; no dead-end navigation.
- Placeholder can be reused for other future surfaces (Ideas) by swapping content.
- Provides a safe sandbox to test card gradients, icon glow, etc., without touching mission-critical pages.

### Negative / Risks

- Adds another route to the router table; we must ensure load bundle impact is minimal (component lazy loaded?).
- Content updates still require PRs unless we integrate markdown parsing later.

Mitigations: Component is small; lazy-load via `React.lazy` if necessary. Provide `placeholderContent.ts` constants for easy copy tweaks.

---

## Implementation Notes

1. **Files**
   - `frontend/src/app-shell/placeholders/KnowledgeComingSoon.tsx`
   - `frontend/src/app-shell/placeholders/knowledge-placeholder-content.ts`
2. **Routing**
   - Add `<Route path="/knowledge" element={<KnowledgeComingSoon />}>` under the new shell.
   - Ensure legacy router either redirects or hides Brain icon when feature flag disabled.
3. **Content Props**

```ts
export interface KnowledgePlaceholderContent {
  heroTitle: string;
  heroBody: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  roadmapHighlights: Array<{ title: string; description: string }>;
}
```

4. **Analytics**
   - Fire `utilityNav.select` event (from ADR-002) + `knowledgePlaceholder.view` event when component mounts.

---

## Compliance Checklist

- **Accessibility**: Cards leverage theme tokens to achieve 4.5:1 contrast; CTAs are keyboard reachable; copy references future roadmap (APR §10).
- **Testing**: TS-004 covers axe scan + keyboard navigation; snapshot tests ensure placeholder copy stays intact.
- **Rollout**: When Knowledge feature ready, replace component but keep contracts (route + navigation ID) untouched.
