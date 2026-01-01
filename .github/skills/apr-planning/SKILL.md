````markdown
name: apr-planning
description: Guide APR creation following ProductPlan PRD structure and enforce branch-first discipline.

---

# APR Planning Skill

Use this skill when:

- Starting a new feature and need to draft an Architectural & Product Requirements document.
- The user invokes the `planner` agent or `/apr` prompt.
- Someone asks how to structure requirements or what sections an APR needs.

## Purpose

This skill ensures every feature has a clear, documented plan before implementation begins. It enforces:

- Comprehensive requirements gathering
- Stakeholder alignment on goals and scope
- Risk identification and mitigation strategies
- Test planning and acceptance criteria
- Branch creation before any code changes

## Procedure

### 1. Gather Requirements

Interview the user to understand:

- **Problem statement**: What user need or business goal does this address?
- **Stakeholders**: Who needs to approve or be informed?
- **Success criteria**: How will we measure success?
- **Constraints**: Time, resources, technical limitations

### 2. Draft the APR

Create or update `features/<branch>/plan/apr.md` following [ProductPlan PRD guidance](../../../knowledge-base/copilot/workflows-apr-retro.md):

**Required Sections:**

1. **Overview** - Working name, problem statement, stakeholders
2. **Goals & Success Metrics** - Business outcomes, non-goals, success criteria
3. **Scope** - In-scope features, out-of-scope items
4. **Feature Breakdown** - Numbered features with:
   - Description
   - Use cases
   - Acceptance criteria
   - Test notes
5. **UX/Flow Notes** - User journey, agent handoffs
6. **Architecture** - System impact, dependencies, constraints, assumptions
7. **Risks & Mitigations** - Table with risk → mitigation mapping
8. **Validation & Rollout** - Test strategy, manual QA, release plan
9. **Open Questions** - Decisions needed, follow-ups

### 3. Reference Documentation

Link to relevant knowledge-base docs:

- Development standards: `knowledge-base/codebase/development-guide.md`
- Repository structure: `knowledge-base/codebase/structure.md`
- Testing frameworks: `knowledge-base/jest/README.md`, `knowledge-base/playwright/README.md`
- Technology-specific docs as needed

### 4. Enforce Branch Creation

**Critical gate**: Before proceeding to implementation, instruct the user:

```bash
git checkout -b feat/<feature-name>
```
````

- The branch name should match the feature identifier
- Verify branch creation with `git branch --show-current`
- **Do not allow code edits** until the branch exists

### 5. Validate Completeness

Check that the APR includes:

- [ ] Clear acceptance criteria for each feature
- [ ] Risk assessment with mitigations
- [ ] Test strategy aligned with acceptance criteria
- [ ] Dependencies and constraints documented
- [ ] Stakeholder sign-off obtained (or documented as pending)

### 6. Hand Off to Testing

Once the APR is approved:

- Use the `tester` agent handoff to design tests
- Ensure test plan references APR acceptance criteria
- Confirm feature workspace structure is ready

## Example APR Flow

1. User describes feature idea
2. Agent asks clarifying questions about goals, users, constraints
3. Agent drafts APR sections incrementally, reviewing with user
4. User approves APR content
5. **Agent instructs**: "Create feature branch with `git checkout -b feat/<name>`"
6. User confirms branch created
7. Agent hands off to `tester` for test planning

## Resources

- APR template: `features/_template/plan/apr.md`
- ProductPlan PRD guidance: `knowledge-base/copilot/workflows-apr-retro.md`
- Example APR: `features/feat-copilot-agents/plan/apr.md`

## Common Pitfalls to Avoid

- Starting implementation before APR approval
- Skipping risk assessment or mitigation strategies
- Vague acceptance criteria ("works well" instead of measurable outcomes)
- Missing branch creation step
- Not documenting assumptions or constraints
- Forgetting to link to relevant documentation

## Outputs

- Complete APR document in `features/<branch>/plan/apr.md`
- Feature branch created and verified
- Open questions logged for follow-up
- Handoff to test planning ready

```

```
