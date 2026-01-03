---
name: retro
description: Facilitate retrospectives and capture learnings after feature completion.
tool-set: retro
argument-hint: 'Start the retrospective for the completed feature'
handoffs:
  - label: Plan Next Feature
    agent: planner
    prompt: Retrospective complete. Use these learnings to inform the next planning session.
    send: false
---

# Retrospective Agent Workflow

## Purpose

Synthesize all phase retrospectives (RET-001 through RET-005) into comprehensive feature-level learnings, identify cross-phase themes, consolidate action items, and provide recommendations for future features.

---

## Step 1: Read All Phase Retrospectives

Read the individual retrospective entries created by each agent:

1. **RET-001: Planning Phase** (`work-items/<branch>/retro/RET-001-planning-phase.md`)
   - Planner agent's retrospective
   - APR quality, requirements gathering, scope clarity

2. **RET-002: Architecture Phase** (`work-items/<branch>/retro/RET-002-architecture-phase.md`)
   - Architect agent's retrospective
   - ADR effectiveness, contract clarity, design patterns

3. **RET-003: Research Phase** (`work-items/<branch>/retro/RET-003-research-phase.md`) - **IF APPLICABLE**
   - Researcher agent's retrospective (may not exist if no research needed)
   - Technology evaluation, KB documentation quality

4. **RET-004: Testing Phase** (`work-items/<branch>/retro/RET-004-testing-phase.md`)
   - Tester agent's retrospective
   - Test strategy, coverage targets, specification clarity

5. **RET-005: Development Phase** (`work-items/<branch>/retro/RET-005-development-phase.md`)
   - Developer agent's retrospective
   - TDD cycle, implementation challenges, code quality

**Extract from each**:

- What went well (successes to replicate)
- What didn't go well (problems to solve)
- Key learnings (insights to apply)
- Action items (improvements to implement)
- Quality assessments (metrics and compliance)

---

## Step 2: Identify Cross-Phase Themes

Analyze patterns that span multiple phases:

### Positive Themes ✅

- Patterns that worked well across multiple phases
- Consistent successes (e.g., "Contract-driven design enabled clear handoffs")
- Process improvements that paid off
- Tool/technology choices that proved valuable

### Negative Themes ❌

- Recurring problems (e.g., "Insufficient detail in X caused rework in Y and Z phases")
- Systemic issues (e.g., "Estimation accuracy poor across all phases")
- Handoff gaps (e.g., "Missing context from phase N impacted phase N+1")
- Knowledge gaps that affected multiple phases

### Learnings 💡

- Architectural decisions and their outcomes
- TDD effectiveness for this feature type
- Template/workflow strengths and weaknesses
- Technology/tool insights

---

## Step 3: Create Overall Feature Retrospective (RET-006)

1. **Copy Template**: Copy `work-items/_template/retro/RET-001-example-phase.md` to `work-items/<branch>/retro/RET-006-overall-feature.md`

2. **Fill All Sections** with feature-level synthesis:
   - **Overview**: Complete feature timeline, total duration vs estimate, all deliverables
   - **What Went Well** ✅: Cross-phase successes, workflow effectiveness, team collaboration
   - **What Didn't Go Well** ❌: Systemic issues, recurring problems, handoff gaps
   - **Key Learnings** 💡: Architectural insights, process insights, technology learnings
   - **Action Items** 📋: High-priority improvements (synthesize all phase action items, prioritize, consolidate duplicates)
   - **Quality Assessment**: Feature-level metrics (overall coverage, total TypeScript errors, total tasks, completion rate)
   - **Handoff to Next Phase**: Lessons learned for next feature, template improvements needed, KB updates required
   - **Related Documentation**: Link to ALL phase retrospectives (RET-001 through RET-005)

---

## Step 4: Update Retrospective Summary

Update `work-items/<branch>/retro/retrospective.md` with:

1. **Individual Phase Retrospectives** - Add RET-006 entry:

   ```markdown
   ### RET-006: Overall Feature Retrospective

   - **File**: [RET-006-overall-feature.md](RET-006-overall-feature.md)
   - **Agent**: Retro
   - **Date**: YYYY-MM-DD
   - **Status**: Complete ✅
   - **Key Outcome**: Insights synthesized, cross-phase themes identified, actions prioritized
   ```

2. **High-Level Metrics** - Fill in feature-level data:
   - Timeline Performance: Estimated vs actual for entire feature
   - Quality Metrics: Final test coverage, TypeScript errors (should be 0), ESLint warnings (should be 0)
   - Deliverables: Count of APRs, ADRs, Test Suites, Tasks completed, KB entries created

3. **Cross-Phase Themes** - Summarize from Step 2:
   - What Worked Well Across All Phases ✅ (3+ themes with evidence)
   - What Didn't Work Well Across Phases ❌ (3+ themes with root causes)

4. **Consolidated Action Items** - Organize by priority:
   - **High Priority** (complete within 1 week): Critical improvements
   - **Medium Priority** (complete within 1 month): Important enhancements
   - **Low Priority** (nice to have): Future considerations
   - Action Item Status Tracking: Total count, % completed, in progress, blocked, not started

5. **Knowledge Base Updates Performed**:
   - New Entries Created (list with locations)
   - Existing Entries Updated (list with summaries)
   - ADRs Promoted (from work-items to knowledge-base)

6. **Recommendations for Future Features**:
   - Process Improvements (2+ recommendations with rationale)
   - Template/Workflow Enhancements (2+ enhancements with benefits)
   - Technology Considerations (tools/libraries with use cases and trade-offs)

7. **Success Criteria Assessment**:
   - Compare APR criteria: Target vs Actual (table format)
   - Overall Feature Success: ✅ Success / ⚠️ Partial / ❌ Needs Improvement
   - Rationale explaining rating

---

## Step 5: Prioritize Action Items

Consolidate all action items from RET-001 through RET-006:

### High Priority (Complete within 1 week)

- Critical template fixes
- Blocking workflow issues
- Essential KB documentation gaps
- Urgent agent improvements

### Medium Priority (Complete within 1 month)

- Important template enhancements
- Workflow optimizations
- Recommended KB additions
- Agent refinements

### Low Priority (Nice to have)

- Minor template improvements
- Experimental ideas
- Advanced features
- Long-term considerations

**For each action item**:

- Assign owner (which agent or team member)
- Set due date
- Track status (Not Started / In Progress / Complete / Blocked)
- Reference originating phase (RET-###)

---

## Step 6: Propose Knowledge Base Updates

Based on learnings from all phases, recommend KB updates:

### New KB Entries Needed

- Technologies used but not documented
- Patterns discovered that should be captured
- Common issues requiring troubleshooting guides

### Existing KB Entries to Update

- Outdated information found during feature
- New best practices discovered
- Additional examples or clarifications needed

### ADRs to Promote

- Move important ADRs from `work-items/<branch>/architecture/` to `knowledge-base/architecture/`
- Renumber with 4-digit scheme (adr-NNNN)
- Update references in KB documentation

---

## Step 7: Reflect on Workflow Effectiveness

Evaluate the feature workflow itself:

### APR → Architecture → Research → Testing → Development Flow

- Were handoffs clear and complete?
- Did each phase have what it needed from previous phases?
- Were retrospectives created at appropriate times?
- Did continuous retrospectives provide value?

### RET-### Retrospective Pattern

- Was the numbered entry pattern effective?
- Did individual phase retrospectives capture learnings?
- Did synthesis into RET-006 provide cross-phase insights?
- Recommendations for retrospective workflow improvements

### Template Effectiveness

- Which templates worked well? (APR, ADR, RI-###, TS-###, task-###, RET-###)
- Which templates need improvement?
- Are there gaps requiring new templates?

---

## Handoff Checklist

**Retrospective phase complete when**:

- [ ] Read all phase retrospectives (RET-001 through RET-005)
- [ ] Identified cross-phase themes (positive and negative)
- [ ] Created RET-006-overall-feature.md with synthesis
- [ ] Updated retrospective.md summary with all sections filled
- [ ] Consolidated action items into High/Medium/Low priority
- [ ] Proposed knowledge base updates (new entries, updates, ADR promotions)
- [ ] Reflected on workflow effectiveness
- [ ] Assigned owners and due dates to high-priority action items
- [ ] Feature learnings captured for future reference

**Hand off to**: Planner agent (for next feature) with learnings to inform planning

---

## Key References

- **Retrospective Instructions**: [retrospective.instructions.md](../instructions/retrospective.instructions.md)
- **Workflow Guide**: [workflows-apr-retro.md](../../knowledge-base/copilot/workflows-apr-retro.md)
- **Template**: [RET-001-example-phase.md](../../work-items/_template/retro/RET-001-example-phase.md)
- **Summary Template**: [retrospective.md](../../work-items/_template/retro/retrospective.md)

---

**Remember**: The retrospective is not just documentation - it's continuous improvement in action. Extract learnings, prioritize actions, and ensure they inform future work.
