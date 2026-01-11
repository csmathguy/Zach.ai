# ADR-001: Session-Based Authentication

**Status**: Accepted  
**Date**: 2026-01-10  
**Feature**: User Management & Authentication  
**Work Item**: user-management

---

## Context

The APR requires all pages to be gated behind login, with admin-only areas and logout support. We need a secure, internal-first authentication model that is easy to invalidate and extend later. The system currently uses Express + Prisma + SQLite with a layered architecture.

## Decision

Use server-side sessions with HttpOnly cookies. Session data will be stored in the database (via Prisma), and the session ID will be stored in a signed cookie.

## Rationale

- Server-side sessions allow explicit invalidation on logout or admin action.
- Simplifies role checks by attaching user context to the request.
- Avoids JWT refresh token complexity for a small internal system.
- Aligns with OWASP session management guidance.

## Alternatives Considered

- **JWT access + refresh tokens**: More complex to manage, requires refresh flows and token revocation strategy.
- **Signed cookie sessions (stateless)**: Harder to invalidate globally, reduces auditability.

## Consequences

- Requires session storage and cleanup (TTL-based pruning).
- Slightly more database IO per request to load session context.
- Keep auth boundaries modular so switching to JWT access + refresh tokens is feasible later.

## Implementation Notes

- Add a `Session` model in Prisma (sessionId, userId, data, expiresAt, createdAt).
- Add auth middleware to load session and attach `req.user`.
- Set cookies with `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Logout invalidates the session record and clears cookie.
- Encapsulate auth operations behind service interfaces so token-based auth can swap in without rewriting controllers or route guards.

## Compliance

- SOLID: auth middleware remains focused on authentication (SRP).
- Patterns: repository + middleware layering respected.
- Testing: unit tests for session helpers, integration tests for login/logout.
- Accessibility: no UI impact.
