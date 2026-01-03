```prompt
---
name: apr
description: Generate or update an Architectural & Product Requirements document
argument-hint: 'Describe the feature goal, user needs, and key constraints'
tool-set: planner
agent: planner
---

Generate a comprehensive APR following the template in `work-items/_template/plan/apr.md`. Include:

1. **Overview**: Working name, problem statement, stakeholders
2. **Goals & Success Metrics**: Business outcomes, non-goals, success criteria
3. **Scope**: In-scope features, out-of-scope items
4. **Feature Breakdown**: Numbered features with use cases, acceptance criteria, test notes
5. **UX/Flow Notes**: User journey and agent handoff flow
6. **Architecture**: System impact, dependencies, constraints, assumptions
7. **Risks & Mitigations**: Table format with mitigation strategies
8. **Validation & Rollout**: Test strategy, manual QA, release plan
9. **Open Questions**: Follow-ups and decisions needed

Reference [knowledge-base/copilot/workflows-apr-retro.md](../../knowledge-base/copilot/workflows-apr-retro.md) for ProductPlan PRD guidance.

**Critical**: Include branch creation requirement in the APR—user must run `git checkout -b <feature-branch>` after APR approval and before any code edits.
```
