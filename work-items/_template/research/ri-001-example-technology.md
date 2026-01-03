# RI-001: [Technology/Pattern Name]

**Type**: New Technology | Pattern | Framework | Library | Tool  
**Priority**: Critical | High | Medium | Low  
**Status**: ⏳ Pending Approval | ✅ Approved | ❌ Rejected | ✔️ Complete  
**Feature**: [Feature name]  
**Date**: [YYYY-MM-DD]

---

## Context

**Why This Needs Documentation**:
[Explain why this technology/pattern needs KB documentation. Reference specific APR/ADR sections.]

**Current APR/ADR References**:

- APR Section: [X.X - Title]
- ADR-XXX: [Decision that introduced this]
- Architecture Section: [Where mentioned]

---

## Current Knowledge Base State

**Status**: (Check one)

- [ ] No documentation exists
- [ ] Partial documentation exists at: `knowledge-base/[location]`
- [ ] Documentation exists but needs major updates
- [ ] Documentation exists but needs minor additions

**Gap Analysis**:
[What's missing? What needs updating? What's incomplete?]

---

## Proposed Documentation

**Location**: `knowledge-base/[technology]/[filename].md`

**Type**: (Check one)

- [ ] New comprehensive guide (400+ lines)
- [ ] New sub-guide (200-400 lines)
- [ ] Update to existing guide (specific sections)
- [ ] Enhancement/addition to existing guide

**Estimated Effort**: [X hours] for [scope description]

---

## Documentation Scope

**What to Document** (Check all that apply):

### Core Sections (Required for New Guides)

- [ ] Overview and philosophy
- [ ] Why we chose it (rationale from ADR)
- [ ] Installation and setup (step-by-step)
- [ ] Quick reference (commands/APIs/common usage)
- [ ] Core concepts (fundamental principles)

### Integration (Required)

- [ ] TypeScript integration and configuration
- [ ] Integration with our stack (Express, React, Jest, etc.)
- [ ] Project-specific setup and configuration

### Practical Usage (Required)

- [ ] Common patterns (minimum 7 production examples with code)
- [ ] Best practices for our use cases
- [ ] Anti-patterns and what to avoid

### Quality & Support (Required)

- [ ] Testing strategies (unit, integration, E2E)
- [ ] Performance considerations and optimization
- [ ] Troubleshooting (minimum 5 common issues with solutions)

### Context & Alternatives (Required)

- [ ] Comparison with alternatives (feature matrix)
- [ ] Migration guides (from alternative solutions)
- [ ] When to use vs when not to use

### References (Required)

- [ ] Official documentation links
- [ ] GitHub repository
- [ ] NPM package (if applicable)
- [ ] Community resources
- [ ] Related technologies in our stack

---

## Value Proposition

**Immediate Use** (Current Feature):

- [How this documentation supports O2/O3/etc. implementation]
- [Specific endpoints/components that need this]

**Future Reuse** (Upcoming Features):

- [Which future features will benefit: O3, O4, O5, etc.]
- [How this establishes patterns for the codebase]

**Team Benefit**:

- [Developer onboarding value]
- [Reference documentation for daily work]
- [Consistency across features]

**Architecture Impact**:

- [Prevents architecture drift]
- [Establishes standard patterns]
- [Supports SOLID principles]

---

## Research Strategy

**Primary Sources** (Official Documentation):

- [ ] Official website/docs: [URL]
- [ ] GitHub repository: [URL]
- [ ] NPM package page: [URL]
- [ ] API reference: [URL]

**Secondary Sources** (Best Practices):

- [ ] Official guides and tutorials
- [ ] Framework integration examples
- [ ] Community best practices
- [ ] Performance benchmarks

**Internal Sources** (Our Codebase):

- [ ] ADR rationale and code examples
- [ ] Architecture patterns and diagrams
- [ ] Existing related KB documentation

**Research Approach**:

1. Start with official vendor documentation (most accurate)
2. Extract key concepts, APIs, and patterns
3. Map to 14-section KB template structure
4. Include examples from our ADRs/architecture
5. Add comparison tables with alternatives considered
6. Document testing and troubleshooting from experience

---

## Success Criteria

- [ ] Documentation follows 14-section template structure
- [ ] Minimum 400+ lines for comprehensive guides (or appropriate for scope)
- [ ] Includes 7+ common patterns with complete, runnable code examples
- [ ] TypeScript examples use strict mode and our conventions
- [ ] Comparison table with alternatives (if applicable)
- [ ] Migration guides from alternatives (if applicable)
- [ ] Testing section with Jest examples
- [ ] Troubleshooting with real issues and solutions
- [ ] Cross-referenced with related ADRs
- [ ] KB index updated with new entry
- [ ] All links verified functional

---

## Decision

**Status**: ⏳ Awaiting Approval

**Reviewer**: [Name]  
**Decision Date**: [YYYY-MM-DD]

**Decision**: (To be filled by reviewer)

- [ ] ✅ Approved - Proceed with documentation
- [ ] ❌ Rejected - [Reason]
- [ ] ⏳ Deferred - [To which future work item and why]

**Rationale**:
[Reviewer's reasoning for approval/rejection/deferral]

**Conditions/Notes** (if approved):
[Any specific requirements, scope adjustments, or priorities]

---

## Execution Notes

**Date Started**: [YYYY-MM-DD]  
**Date Completed**: [YYYY-MM-DD]

**Actual Effort**: [X hours]

**Research Sources Used**:

- [List actual sources consulted]

**Key Findings**:

- [Important discoveries during research]
- [Notable patterns or gotchas]
- [Integration insights]

**Challenges Encountered**:

- [Any difficulties during research/documentation]
- [How they were resolved]

**Quality Checklist** (Before marking complete):

- [ ] All sections from scope completed
- [ ] Code examples tested and working
- [ ] Links verified functional
- [ ] Cross-references to ADRs added
- [ ] KB index updated
- [ ] Retrospective notes added to research-findings.md

---

## Related Items

**Depends On**:

- [RI-XXX if this requires another research item first]

**Blocks**:

- [RI-XXX if other items depend on this]

**Related ADRs**:

- [ADR-XXX: Decision that introduced this technology/pattern]

**Related Features**:

- [O3, O4, etc. that will benefit from this documentation]
