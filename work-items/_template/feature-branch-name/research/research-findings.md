# Research Findings: [Feature Name]

## Executive Summary

- **Feature**: [Brief description of what we're building]
- **Research Date**: [Start Date] - [End Date]
- **Researcher**: [Name/Agent]
- **Status**: In Progress / Complete

## Technologies Identified

Check each item as research is completed:

- [ ] **[Technology Name]** - [Brief description]
  - Knowledge base status: Not documented / Partial / Complete
  - Priority: High / Medium / Low
  - Research needed: Setup, best practices, integration patterns

## Knowledge Base Updates

Track all documentation work:

### Created

- [ ] `knowledge-base/[technology]/README.md` ([target: 400+ lines])
- [ ] Additional files if needed (setup.md, best-practices.md, etc.)

### Updated

- [ ] `knowledge-base/README.md` - Added index entries
- [ ] Related documentation - Cross-references and integration notes

### Verified

- [ ] Documentation follows standard structure
- [ ] Includes TypeScript integration
- [ ] Has troubleshooting section
- [ ] Links to official documentation
- [ ] Covers CI/CD integration

## Key Findings

### [Technology 1 Name]

**Overview**

- What it is and why we're using it
- Current stable version
- License and maintenance status

**Best Practices Discovered**

- Configuration approach for enterprise use
- TypeScript integration patterns
- Common pitfalls and how to avoid them
- Performance considerations

**Integration Notes**

- How it works with our existing stack (React, TypeScript, Jest, etc.)
- Dependencies and peer dependencies
- Build/bundler configuration needed

**Security & Compliance**

- Known vulnerabilities or security considerations
- Compliance requirements (if applicable)

**References**

- [Official Documentation](url)
- [Best Practices Guide](url)
- [Community Resources](url)

---

### [Technology 2 Name]

[Repeat structure above for each technology]

---

## Architecture Decisions

Document key decisions that affect the APR or implementation:

### Decision: [Brief Title]

**Context**

- What problem are we solving?
- What options did we consider?

**Decision**

- What did we choose and why?

**Rationale**

- Technical reasons
- Business/product reasons
- Team/maintenance reasons

**Trade-offs**

- Pros: What we gain
- Cons: What we sacrifice or risk
- Mitigations: How we address the cons

**Impact on APR**

- Does this change scope or requirements?
- New risks or dependencies?
- Performance or security implications?

---

## Gaps & Open Questions

Track items that need follow-up:

### Knowledge Base Gaps

- [ ] [Topic] - needs documentation
- [ ] [Integration pattern] - needs example

### Technical Uncertainties

- [ ] [Question] - need to validate approach
- [ ] [Concern] - need performance testing

### Clarifications Needed

- [ ] [Item] - need stakeholder input
- [ ] [Requirement] - need APR update

## Research Methodology

Document how research was conducted:

### Sources Consulted

- Official documentation: [list URLs]
- Community resources: [Stack Overflow, GitHub issues, etc.]
- Blog posts/tutorials: [relevant guides]
- Existing codebases: [open source examples]

### Search Queries Used

- "[technology] typescript best practices"
- "[technology] enterprise setup"
- "[technology] vs [alternative]"
- [other queries]

### Validation Approach

- Code examples tested: Yes / No
- Version compatibility checked: Yes / No
- Performance benchmarks reviewed: Yes / No

## Recommendations

Based on research, recommendations for the team:

### For APR

- Update scope to include [X]
- Add risk mitigation for [Y]
- Clarify requirement around [Z]

### For Implementation

- Use [pattern/library] for [use case]
- Avoid [anti-pattern] because [reason]
- Consider [alternative approach] if [condition]

### For Knowledge Base

- Priority: Document [X] before development starts
- Nice-to-have: Add guide for [Y] during retro phase
- Future: Consider research on [Z] for next feature

## Timeline

- Research started: [Date]
- APR reviewed: [Date]
- Web research completed: [Date]
- Knowledge base updates: [Date]
- Research findings finalized: [Date]

## Next Steps

- [ ] Hand off to tester agent for test strategy design
- [ ] Update APR with architecture decisions (if needed)
- [ ] Schedule knowledge sharing session (if complex)
- [ ] Review research findings with team

## Notes

Any additional context, lessons learned, or observations:

- [Note about research process]
- [Insight gained]
- [Suggestion for future research phases]

---

## Template Usage Notes

**For Researcher Agent:**

1. Copy this template to `work-items/<feature-branch>/research/research-findings.md`
2. Replace `[Feature Name]` with actual feature name
3. Fill in sections as research progresses
4. Check off items in real-time
5. Hand off to next agent when complete

**For Team Members:**

- This document is a snapshot of research at planning time
- Refer back during development if questions arise
- Update if new findings emerge during implementation
- Archive with feature documentation for future reference
