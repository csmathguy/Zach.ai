# ADR-003: Password Reset Tokens and Lockout Strategy

**Status**: Accepted  
**Date**: 2026-01-10  
**Feature**: User Management & Authentication  
**Work Item**: user-management

---

## Context

The APR requires admin-initiated one-time password reset tokens, plus account lockout after 5 failed attempts within 15 minutes. Reset tokens must be usable without email delivery initially.

## Decision

Implement a one-time reset token model stored as a hash, with short TTL and single-use semantics. Enforce account lockout after 5 failed attempts in 15 minutes, resetting the failure counter on successful login.

## Rationale

- Tokens avoid exposing passwords to admins.
- Hashing prevents token disclosure if the database is accessed.
- Lockout deters brute-force attempts without full rate limiting.

## Alternatives Considered

- **Temporary admin-set passwords**: Requires secure distribution and increases risk.
- **Rate limiting only**: Less deterministic for account-level protection.

## Consequences

- Requires token generation and verification logic.
- Requires cleanup of expired tokens.

## Implementation Notes

- Add `PasswordResetToken` model with `tokenHash`, `userId`, `createdByUserId`, `expiresAt`, `usedAt`.
- Issue a random token, store a hash, deliver token out-of-band.
- Update login flow to increment failures and apply lockout window.
- Reset `failedLoginCount` on successful login.

## Compliance

- SOLID: reset logic in service layer with repository abstractions.
- Patterns: explicit domain events not required for MVP.
- Testing: unit tests for token expiry/usage and lockout thresholds.
- Accessibility: no UI impact.
