# Retrospective Instructions

**Apply to**: After every commit during feature development  
**Reference**: [knowledge-base/copilot/workflows-apr-retro.md](../../knowledge-base/copilot/workflows-apr-retro.md)

---

## Purpose

Continuous retrospectives capture learnings and improvements throughout development. This creates a feedback loop that improves both the current feature and future work.

---

## When to Create Retrospective Entry

**After EVERY commit**, before moving to next task:

1. Commit your code changes
2. Update task list (check off completed items)
3. **Add retrospective entry** documenting what happened
4. Only then proceed to next task

---

## Retrospective File Location

```
work-items/<branch>/retro/retrospective.md
```

If file doesn't exist, create it using the template below.

---

## Retrospective Entry Template

```markdown
### Entry N: [Phase/Task Name]

**Date**: [YYYY-MM-DD]  
**Commit**: `[hash]` - "[commit message]"  
**Status**: ✅ Complete | 🔄 In Progress | ❌ Blocked

#### What We Did

- [Bullet list of what was implemented/changed]
- [Be specific and concrete]

#### What Went Well ✅

- [Successes, smooth processes, good decisions]
- [What worked as expected]
- [Positive outcomes]

#### What Didn't Go Well / Issues Found ❌

- [Problems encountered]
- [Bugs found and fixed]
- [Unexpected complications]
- [Process failures]

#### What We Learned / Improvements 📚

1. **[Category]**:
   - [Specific learning or insight]
   - [Why it matters]
   - [How to apply going forward]

#### Action Items for Future Development 🔧

- [x] [Completed actions from this phase]
- [ ] [Pending actions for next phases]
- [ ] [Process improvements needed]

#### Technical Debt / Follow-up 📝

- [Technical debt introduced (with justification)]
- [Follow-up work needed]
- [Refactoring opportunities]
```

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
```

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
Code → Commit → Update Task List → Add Retrospective → Apply Learnings → Next Task
```

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
