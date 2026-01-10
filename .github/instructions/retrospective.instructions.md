# Retrospective Instructions

**Apply to**: At the end of each phase (Planning, Architecture, Design, Research, Testing, Development)  
**Reference**: [knowledge-base/copilot/workflows-apr-retro.md](../../knowledge-base/copilot/workflows-apr-retro.md)

---

## Purpose

Each agent creates a numbered retrospective entry (RET-###) at the end of their phase to capture learnings, challenges, and action items. This creates a continuous feedback loop that improves both the current feature and future work.

---

## Retrospective Pattern

Similar to ADRs (adr-###), Research Items (ri-###), and Test Suites (TS-###), retrospectives use a numbered pattern:

- **RET-001**: Planning Phase retrospective
- **RET-002**: Architecture Phase retrospective
- **RET-003**: Design Phase retrospective
- **RET-004**: Research Phase retrospective (if applicable)
- **RET-005**: Testing Phase retrospective
- **RET-006**: Development Phase retrospective
- **RET-007**: Overall Feature retrospective (by Retro agent)

---

## When to Create Retrospective

**At the END of your phase**, before handing off to the next agent:

1. Complete your phase deliverables
2. Verify handoff checklist items
3. Create RET-### retrospective entry
4. Add entry to `retrospective.md` summary file
5. Hand off to next agent

**Do NOT create retrospectives after every commit** - only at phase completion.

---

## File Locations

```
work-items/<branch>/retro/
  retrospective.md           # Summary with links to all RET entries
  RET-001-planning-phase.md
  RET-002-architecture-phase.md
  RET-003-design-phase.md
  RET-004-research-phase.md  # (if research phase occurred)
  RET-005-testing-phase.md
  RET-006-development-phase.md
  RET-007-overall-feature.md # (by retro agent)
```

---

## Creating Your Retrospective

### Step 1: Copy the Template

**Template**: `work-items/_template/retro/RET-001-example-phase.md`

**Copy and rename** for your phase:

- Planner -> `RET-001-planning-phase.md`
- Architect -> `RET-002-architecture-phase.md`
- Designer -> `RET-003-design-phase.md`
- Researcher -> `RET-004-research-phase.md`
- Tester -> `RET-005-testing-phase.md`
- Developer -> `RET-006-development-phase.md`
- Retro Agent -> `RET-007-overall-feature.md`

### Step 2: Fill Out All Sections

**Required Sections** (no placeholders - provide actual content):

#### Overview

- Phase summary (what was accomplished)
- Duration (estimated vs actual)
- Key deliverables (specific files created)

#### What Went Well ✅

- 3+ specific successes with evidence
- Why each item worked well
- Quantifiable metrics (where applicable)

#### What Didn't Go Well ❌

- 3+ specific challenges with impact
- Root cause (if known)
- Time lost (estimated)
- Blockers encountered and how resolved

#### Key Learnings 💡

- Technical insights (what we discovered)
- Process insights (what worked/didn't in workflow)
- Tool/technology insights

#### Action Items 📋

- Immediate actions for this feature
- Template/documentation updates needed
- Knowledge base updates needed
- Agent/workflow improvements

#### Quality Assessment

- SOLID compliance (if applicable)
- Code quality metrics (if development phase)
- Deliverable quality scores

#### Handoff to Next Phase

- What you're delivering
- Outstanding items
- Notes for next agent

### Step 3: Update retrospective.md

Add an entry in `work-items/<branch>/retro/retrospective.md`:

```markdown
### RET-00X: [Phase Name]

- **File**: [RET-00X-phase-name.md](RET-00X-phase-name.md)
- **Agent**: [Your Agent Name]
- **Date**: YYYY-MM-DD
- **Status**: Complete ✅
- **Key Outcome**: [One-line summary]
```

---

## Agent-Specific Guidelines

**Reference**: [Retrospective Template](../../work-items/_template/retro/RET-001-example-phase.md)

**Focus Areas by Agent**:

- **Planner**: APR quality, requirements completeness, accessibility captured
- **Architect**: ADR quality, contract clarity, design patterns effectiveness
- **Designer**: UX clarity, accessibility, mobile usability, design consistency
- **Researcher**: Research efficiency, KB documentation quality, time vs value
- **Tester**: Test strategy completeness, contract utilization, edge cases
- **Developer**: TDD effectiveness, SOLID compliance, code quality, technical debt
- **Retro**: Cross-phase themes, consolidated actions, future recommendations

---

## Quality Standards

### DO ✅

- **Be specific**: "Test coverage improved from 65% to 85%" not "coverage was good"
- **Provide evidence**: Link to commits, files, metrics
- **Be honest**: Document failures and challenges candidly
- **Quantify impact**: "Lost 2 hours debugging X" not "X was hard"
- **Include action items**: Every problem should have an improvement action
- **Fill all sections**: No placeholders or "TODO" items

### DON'T ❌

- **Generic statements**: "Everything went well" or "Some issues"
- **Blame individuals**: Focus on process and outcomes, not people
- **Leave sections empty**: If a section doesn't apply, explain why
- **Skip action items**: Always propose improvements
- **Use placeholders**: Complete all content before handoff

---

## Action Items Format

**Categories**: Template updates, KB updates, workflow improvements (see template for examples)

**Pattern**: `- [ ] [Specific action] ([Owner if applicable])`

---

## Retrospective Flow

```
Planner completes APR
    -> Planner creates RET-001
    -> Planner adds entry to retrospective.md
    -> Planner hands off to Architect
Architect reads RET-001 for context
    -> Architect completes ADRs
    -> Architect creates RET-002
Designer completes UI specs
    -> Designer creates RET-003
... (continues for each phase)
    -> Retro Agent reads ALL RET entries
    -> Retro Agent creates RET-007 (synthesis)
    -> Retro Agent updates retrospective.md with cross-phase themes
```

---

## Benefits of RET-### Pattern

1. **Structured**: Each retrospective follows the same comprehensive template
2. **Traceable**: Numbered entries show chronological progression
3. **Referenceable**: Easy to link to specific phase retrospectives
4. **Comparable**: Same structure enables comparison across features
5. **Actionable**: Clear action items with owners and due dates
6. **Continuous**: Each agent contributes to collective learning

---

## Related Documentation

- **Template**: [work-items/\_template/retro/RET-001-example-phase.md](../../work-items/_template/retro/RET-001-example-phase.md)
- **Summary Template**: [work-items/\_template/retro/retrospective.md](../../work-items/_template/retro/retrospective.md)
- **Workflow Guide**: [knowledge-base/copilot/workflows-apr-retro.md](../../knowledge-base/copilot/workflows-apr-retro.md)
- **Agent Instructions**: [.github/agents/\*.agent.md](../agents/)

---

**Remember**: Retrospectives drive continuous improvement. Take time to document learnings thoroughly - future you will thank present you!

#### Action Items for Future Development 🔧

- [x] [Completed actions from this phase]
- [ ] [Pending actions for next phases]
- [ ] [Process improvements needed]

#### Technical Debt / Follow-up 📝

- [Technical debt introduced (with justification)]
- [Follow-up work needed]
- [Refactoring opportunities]

````

---

## Example: Day 0 Retrospective Entry

```markdown
### Entry 1: Day 0 - Prerequisites & Automation Setup

**Date**: January 2, 2026
**Commit**: `3a811a5` - "chore(db): add Prisma dependencies and automation prerequisites"
**Status**: ✅ Complete

#### What We Did

- Verified system prerequisites (Node.js v22.12.0, npm v10.3.0, PowerShell 5.1)
- Installed Prisma 6.0+ and @prisma/client
- Created scripts/database/ directory
- Created db-init.ps1 automation script
- Created backend/.gitignore
- Created feature branch feat/O1-database-foundation

#### What Went Well ✅

- System prerequisites already met
- Prisma installation smooth with zero vulnerabilities
- User caught encoding problem before proceeding
- Proper feature branch workflow established

#### What Didn't Go Well / Issues Found ❌

- **Critical**: Used emoji characters in PowerShell causing encoding errors
- **Workflow**: Almost committed to main instead of feature branch

#### What We Learned / Improvements 📚

1. **Enterprise-Ready Code**:
   - Emojis cause encoding issues - use plain text tags instead
   - Must test scripts before marking complete
2. **Workflow**:
   - ALWAYS create feature branch BEFORE commits
   - Never assume success - verify output

#### Action Items for Future Development 🔧

- [x] Fix emoji encoding in db-init.ps1
- [ ] Update developer agent instructions
- [ ] Create retrospective instruction file

#### Technical Debt / Follow-up 📝

- None yet
````

---

## Key Questions to Answer

### What We Did

- What code/files were created or modified?
- What problem did this solve?
- What features were added?

### What Went Well

- What decisions proved correct?
- What processes worked smoothly?
- What tools/patterns were effective?
- Where did planning pay off?

### What Didn't Go Well

- What bugs were encountered?
- What assumptions were wrong?
- What processes broke down?
- What took longer than expected?
- **What quality issues did user catch?**

### What We Learned

- **Enterprise Standards**: What makes code "enterprise ready" vs just "working"?
- **Workflow**: What process improvements are needed?
- **Technical**: What patterns/approaches work best?
- **Quality**: What should we check before marking complete?

---

## Critical: Don't Proceed Without Clean Output

**User feedback from Day 0**:

> "we want to make sure that we aren't proceeding until everything is clean and enterprise ready"

If output looks wrong:

1. ❌ **STOP** - Don't mark task complete
2. ❌ **STOP** - Don't proceed to next task
3. ❌ **STOP** - Don't commit code
4. ✅ Fix the issue first
5. ✅ Test again until output is clean
6. ✅ Document what went wrong in retrospective

---

## Integration with Task List

After adding retrospective entry:

1. Update `dev/task-list.md` to check off completed items
2. Mark sections as complete with ✅
3. Add commit hash and status notes
4. Update overall status at top of file

---

## Continuous Improvement Process

```
Code → Commit → Update Task List → Add Retrospective → Apply Learnings → Commit Improvements → Next Task
```

**The Self-Improvement Loop** (MANDATORY after retrospective with action items):

### Step 1: Document Retrospective

- Add retrospective entry with learnings
- Identify action items for improvement
- Note specific files/sections needing updates

### Step 2: Implement Improvements Immediately

- Update developer agent instructions based on learnings
- Update knowledge base documentation
- Add new patterns/examples discovered
- Fix process gaps identified

### Step 3: Commit Improvements

- Create separate commit for documentation improvements
- Reference the retrospective entry that triggered improvements
- Describe what was learned and how it's now documented

### Step 4: Mark Action Items Complete

- Check off completed action items in retrospective
- Add ✅ confirmation that improvements are committed
- This closes the loop

**Example from Day 2.6**:

```markdown
Retrospective Entry 8 identified:

- [ ] Update TDD guide with immutability testing
- [ ] Update developer agent with file location checkpoint
- [ ] Update structure guide with test location convention

Immediately implemented:
→ Commit 2a2b238: "docs: implement Day 2.6 retrospective improvements"

Then marked complete in retrospective:

- [x] Update TDD guide ✅
- [x] Update developer agent ✅
- [x] Update structure guide ✅
```

**Why This Matters**:

- Learnings become permanent (not just notes)
- Next iteration benefits immediately
- Knowledge compounds over time
- Process continuously improves

**When to Skip**: Only skip if action items are for "after feature complete" (handled by retro agent)

Retrospectives feed into:

- **Immediate**: Action items for current feature
- **Short-term**: Developer agent instruction updates
- **Long-term**: Knowledge base improvements, new best practices

---

## Final Feature Retrospective

After feature complete (handled by retro agent):

- Synthesize all continuous retrospectives
- Extract overall learnings
- Create knowledge base updates
- Document process improvements
- Create follow-up tickets

---

## Resources

- [Workflows APR & Retro Guide](../../knowledge-base/copilot/workflows-apr-retro.md)
- [Continuous Retrospectives Pattern](../../knowledge-base/copilot/workflows-apr-retro.md#continuous-retrospectives-phase-by-phase)
