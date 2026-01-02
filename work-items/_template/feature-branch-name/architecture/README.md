# Architecture Documentation

This folder contains technical architecture decisions and design artifacts for this feature.

## Contents

- **ADRs** (`adr-*.md`) - Architecture Decision Records documenting major technical choices
- **contracts.md** - Interface contracts, domain models, DTOs
- **diagrams.md** - Entity-relationship diagrams, component diagrams, sequence diagrams
- **layers.md** - How feature fits into layered architecture
- **integration.md** - Integration points with existing codebase

## Purpose

Architecture documents are created by the **architect agent** AFTER the APR is approved and BEFORE test strategy begins.

**Why?** Testers need contracts/interfaces to write meaningful tests. Developers need architecture decisions to implement correctly.

## Workflow Position

1. Planning → APR (business requirements)
2. **Architecture → ADR** (YOU ARE HERE - technical design)
3. Research → Knowledge Base (if new tech)
4. Testing → Test Plan (uses contracts from architecture)
5. Development → Implementation (follows architecture)
6. Retrospective → Lessons Learned

## Architecture Decision Records (ADR)

Each major technical decision gets an ADR. Template:

```markdown
# ADR-001: [Decision Title]

**Status**: Proposed | Accepted | Deprecated | Superseded  
**Date**: YYYY-MM-DD  
**Author**: Architect Agent  
**APR Reference**: [Link to APR section]

## Context

What problem are we solving?

## Decision

What are we doing?

## Rationale

Why this over alternatives?

## Consequences

Positive, negative, risks

## Implementation Notes

Key classes, integration points

## Compliance

SOLID, patterns, testing, accessibility, performance
```

## Best Practices

- **Contract-First**: Define interfaces before implementations
- **SOLID Principles**: SRP, OCP, LSP, ISP, DIP
- **Layered Architecture**: Domain → Infrastructure → Application → API
- **Repository Pattern**: For all database access
- **Testability**: Design for 70%+ coverage
- **Integration**: Clean integration with existing codebase

## Reference Materials

- [Development Guide](../../../../knowledge-base/codebase/development-guide.md) - SOLID, patterns
- [Architecture Overview](../../../../knowledge-base/codebase/architecture.md) - Current system
- [Structure Guide](../../../../knowledge-base/codebase/structure.md) - Directory layout
