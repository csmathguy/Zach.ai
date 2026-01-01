```markdown
name: retrospective
description: Facilitate structured retrospectives using Atlassian best practices and capture actionable learnings.

---

# Retrospective Skill

Use this skill when:

- A feature or sprint is complete and the team needs to reflect on the work.
- The user invokes the `retro` agent or `/retro` prompt.
- Someone asks how to run a retrospective or what questions to ask.

## Purpose

This skill helps teams systematically reflect on completed work to:

- Celebrate what worked well
- Identify pain points and gaps
- Capture learnings and experiments
- Define concrete improvement actions

## Procedure

### 1. Gather Context

- Read the feature's APR from `features/<branch>/plan/apr.md`
- Review the test plan from `features/<branch>/tests/test-plan.md`
- Check implementation notes from `features/<branch>/dev/implementation-notes.md`
- Look at commit history and PR discussions if available

### 2. Facilitate Discussion

Ask open-ended questions following [Atlassian retrospective guidance](../../../knowledge-base/copilot/workflows-apr-retro.md):

**What Went Well?**

- What are you proud of from this feature?
- What practices should we continue?
- What made this work successful?

**What Was Painful or Missing?**

- What slowed us down?
- What documentation or tools were missing?
- What caused confusion or rework?

**Learnings & Experiments**

- What surprised you during this work?
- What assumptions proved incorrect?
- What would you do differently next time?

**Improvements & Actions**

- What specific actions will we take?
- Who owns each action?
- When will we revisit these?

### 3. Document Outcomes

Update `features/<branch>/retro/retrospective.md` with:

- Quick summary (outcome, dates, participants)
- Responses to each question category
- Action items table (category, action, owner, target date)
- Follow-up links (issues, PRs, KB updates)

### 4. Capture Broader Patterns

If learnings apply beyond this feature:

- Update `ideas/session-reflection.md` with session insights
- Propose knowledge-base updates for documentation gaps
- Suggest improvements to workflow, templates, or tooling

## Example Questions by Category

**For Planning Phase:**

- Was the APR clear and complete before we started?
- Did we catch scope creep early?
- Were stakeholders aligned?

**For Testing Phase:**

- Did we have the right test coverage?
- Were tests written alongside code or after?
- Did E2E tests catch issues unit tests missed?

**For Development Phase:**

- Did we follow SOLID principles consistently?
- Were code reviews helpful and timely?
- Did validation (`npm run verify:all`) catch issues early?

**For Process:**

- Did agent handoffs work smoothly?
- Were the feature workspace artifacts useful?
- What would make the next feature easier?

## Resources

- Retrospective template: `features/_template/retro/retrospective.md`
- Atlassian retro guidance: `knowledge-base/copilot/workflows-apr-retro.md`
- Feature workspace: `features/<branch>/`

## Outputs

- Completed retrospective document
- Action items with owners and dates
- Proposed knowledge-base improvements
- Updated session reflection if applicable
```
