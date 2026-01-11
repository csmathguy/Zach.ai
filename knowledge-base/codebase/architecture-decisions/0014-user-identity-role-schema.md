# ADR-002: User Identity and Role Schema

**Status**: Accepted  
**Date**: 2026-01-10  
**Feature**: User Management & Authentication  
**Work Item**: user-management

---

## Context

The APR requires login with username or optional email, two roles (User/Admin), and association of authenticated users with domain entities like Thought. The current Prisma `User` model uses required email and name.

## Decision

Extend the User model to support a unique username and optional email, plus role and status fields required for authorization and account management.

## Rationale

- Username login avoids forcing email collection.
- Optional email supports future reset email delivery.
- Explicit role field simplifies authorization checks.
- Status and lockout metadata enable account management and security controls.

## Alternatives Considered

- **Email-only login**: Rejects user preference not to share email.
- **Roles via join table**: Adds complexity for a two-role system.

## Consequences

- Requires migration to update User schema and existing data.
- Additional validation for unique username and optional email.
- Future expansion to role join tables and permissions will require a migration, but current authorization checks should be centralized to ease that transition.

## Implementation Notes

- Add fields: `username` (unique), `email` (optional), `passwordHash`, `role`, `status`.
- Add security metadata: `failedLoginCount`, `lockoutUntil`, `lastLoginAt`.
- Update domain model and repository contracts to include new fields.
- Implement role checks via a policy layer (e.g., `hasRole`, `hasPermission`) to keep future role/permission expansion localized.

## Compliance

- SOLID: domain model changes isolated to User entity.
- Patterns: repository pattern preserves DB abstraction.
- Testing: unit tests for validation, integration tests for repository updates.
- Accessibility: no direct impact.
