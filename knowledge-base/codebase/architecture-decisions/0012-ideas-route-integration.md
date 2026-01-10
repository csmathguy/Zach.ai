# ADR-003: Ideas Route Integration

**Status**: Accepted
**Date**: 2026-01-09
**APR Reference**: [O3 APR - Section 4.2](../plan/apr.md#42-routing--navigation-integration)

## Context

The current app shell exposes a placeholder Ideas route. O3 delivers the first user-facing workflow and should be discoverable from both the navigation and the homepage.

## Decision

Replace the Ideas placeholder with the Ideas UI on the existing /ideas route and keep the UtilityNav label as "Ideas". Add a "Go to Ideas" CTA on the Home page.

## Rationale

- Keeps routes stable and avoids breaking links
- Retains the conceptual labeling users expect
- Adds a direct entry point from the homepage

## Alternatives Considered

1. **Move Ideas to /inbox**
   - Pros: Aligns with internal terminology
   - Cons: User-facing label prefers "Ideas"

2. **Make Ideas the homepage**
   - Pros: Immediate access
   - Cons: Removes landing context and other navigation

## Consequences

**Positive**:

- Minimal routing changes
- Clear discovery path from Home

**Negative**:

- Home page becomes secondary for the primary workflow

## Implementation Notes

- Replace route element for /ideas in `frontend/src/app/App.tsx`
- Update utility nav config only if feature flag removal is needed
- Add CTA link/button in `frontend/src/features/home/Home.tsx`

## Compliance

- Accessibility: CTA is a standard link/button
- UI: Consistent with existing app shell
