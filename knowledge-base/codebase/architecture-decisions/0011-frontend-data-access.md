# ADR-002: Frontend Ideas Data Access Pattern

**Status**: Accepted
**Date**: 2026-01-09
**APR Reference**: [O3 APR - Section 10](../plan/apr.md#10-architecture-decisions)

## Context

The Ideas UI needs to load thoughts and submit new ones. The frontend already uses a feature-scoped hook with fetch in the codebase (useCoverageData) and does not currently depend on a data fetching library (React Query or SWR).

## Decision

Use a feature-scoped data layer composed of:

- `ideas/api/thoughtsApi.ts` for fetch helpers
- `ideas/hooks/useThoughts.ts` for loading, error, and refresh state

This pattern mirrors `useCoverageData` and avoids adding new dependencies.

## Rationale

- Aligns with existing codebase patterns
- Keeps dependencies minimal
- Keeps state handling explicit and testable
- Enables easy refactor to a library later if needed

## Alternatives Considered

1. **React Query or SWR**
   - Pros: Caching, retries, automatic refetch
   - Cons: New dependency and learning surface for a single feature

2. **Inline fetch in components**
   - Pros: Minimal files
   - Cons: Harder to test, mixes UI and data concerns

## Consequences

**Positive**:

- Clear separation of concerns
- Consistent loading and error handling
- Easy to mock in tests

**Negative**:

- Manual cache and retry logic if needed later

## Implementation Notes

- `useThoughts` should expose { data, loading, error, refresh }
- API helpers handle JSON parsing and error shaping
- Maintain typed Thought interface shared by components

## Compliance

- SOLID: SRP (hooks handle data state, components handle UI)
- Pattern: Feature slice, hook-based data access
- Testing: Unit test hook behavior and component rendering
