````markdown
name: feature-workflow
description: Guide users through the complete Plan → Tests → Dev → Retro workflow for new features.

---

# Feature Workflow Skill

Use this skill when:

- A user wants to start a new feature or idea and needs guidance on the full lifecycle.
- Someone asks how to properly plan, test, implement, or reflect on work in this repository.
- You need to enforce the branch-first discipline and APR requirements before coding.

## Workflow Phases

### 1. Planning Phase

- Copy the feature template: `features/_template` → `features/<branch-name>`
- Use the `planner` agent or `/apr` prompt to draft an APR in `features/<branch>/plan/apr.md`
- Reference [knowledge-base/copilot/workflows-apr-retro.md](../../../knowledge-base/copilot/workflows-apr-retro.md) for APR structure
- **Critical**: Once the APR is approved, create the feature branch immediately:
  ```bash
  git checkout -b feat/<feature-name>
  ```
````

- Do NOT proceed to coding until the branch exists

### 2. Test Planning Phase

- Use the `tester` agent to design test strategy
- Update `features/<branch>/tests/test-plan.md` with scope, strategy, tooling, and exit criteria
- Reference testing docs: [Jest](../../../knowledge-base/jest/README.md), [Testing Library](../../../knowledge-base/testing-library/README.md), [Playwright](../../../knowledge-base/playwright/README.md)
- Define acceptance tests aligned with APR criteria

### 3. Development Phase

- Use the `developer` agent for implementation
- Follow [development-guide.md](../../../knowledge-base/codebase/development-guide.md) for SOLID, DRY, KISS principles
- Track decisions in `features/<branch>/dev/implementation-notes.md`
- Ensure all changes pass validation:
  ```bash
  npm run validate
  npm run verify:all
  ```

### 4. Retrospective Phase

- Use the `retro` agent or `/retro` prompt after feature completion
- Complete `features/<branch>/retro/retrospective.md` following Atlassian best practices
- Identify learnings, action items, and knowledge-base improvements
- Update `ideas/session-reflection.md` if broader patterns emerge

## Commands to Run

From repository root:

- **Full validation**: `npm run verify:all` (typecheck, lint, format, tests, E2E)
- **Quick validation**: `npm run validate` (typecheck, lint, format)
- **Run tests only**: `npm test`
- **E2E tests**: `npm run test:e2e`

## Agent Handoffs

The workflow agents are designed to hand off to each other:

- `planner` → `tester` (APR complete, design tests)
- `tester` → `developer` (tests defined, implement)
- `developer` → `tester` (implementation done, validate)
- `tester` → `retro` (feature validated, reflect)
- `retro` → `planner` (learnings captured, plan next)

## Resources

- Feature template: `features/_template/`
- Workflow guidance: `knowledge-base/copilot/workflows-apr-retro.md`
- Development standards: `knowledge-base/codebase/development-guide.md`
- Repository structure: `knowledge-base/codebase/structure.md`

## Security Notes

- Always require manual approval for terminal commands unless whitelisted
- Review all file edits before applying
- Ensure validation passes before commits
- Never auto-commit without user confirmation

```

```
