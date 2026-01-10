# ADR-001: GET /api/thoughts Endpoint Strategy

**Status**: Accepted
**Date**: 2026-01-09
**APR Reference**: [O3 APR - Section 4.1](../plan/apr.md#41-thoughts-api-get-apithoughts)

## Context

O3 requires a read endpoint for the Ideas list. The backend already provides POST /api/thoughts, repository interfaces for fetching thoughts, and centralized error handling. The system currently runs with a single MVP user but must remain compatible with future per-user scoping once auth is added.

## Decision

Implement GET /api/thoughts using the existing ThoughtController pattern and IThoughtRepository, returning thoughts ordered by timestamp descending.

For MVP, the controller will call findByUser with the existing MVP user id to preserve the per-user shape. When auth is added, the user id will be derived from the auth token, but the endpoint and response shape remain unchanged.

## Rationale

- Reuses O2 patterns (controllers, repositories, error handling)
- Keeps the response shape consistent with POST /api/thoughts
- Aligns with the future multi-user requirement without changing contract
- Avoids new application services until business logic requires them

## Alternatives Considered

1. **Use findAll for MVP**
   - Pros: Slightly simpler
   - Cons: Bakes in non-user-scoped behavior, harder to transition

2. **Add Application Layer service now**
   - Pros: Future-proof orchestration
   - Cons: Unnecessary complexity for a simple read endpoint

## Consequences

**Positive**:

- Consistent API patterns and error handling
- Clear upgrade path to authenticated user scoping
- Minimal changes to existing layers

**Negative**:

- Controller depends on a hardcoded MVP user id until auth exists

## Implementation Notes

- Add GET handler in `backend/src/api/controllers/thoughtController.ts`
- Add GET route in `backend/src/api/routes/thoughts.ts`
- Use repository method `findByUser(userId)` and return array of thoughts
- Preserve response fields: id, text, source, timestamp, processedState

## Compliance

- SOLID: SRP and DIP honored (controller depends on interface)
- Pattern: Layered architecture, repository pattern
- Testing: Add integration tests for GET /api/thoughts
