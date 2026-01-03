```prompt
---
name: retro
description: Conduct a retrospective for a completed feature
argument-hint: 'Reference the feature branch or completed work'
tool-set: retro
agent: retro
---

Facilitate a retrospective following the template in `work-items/_template/retro/retrospective.md`. Guide the user through:

1. **Quick Summary**: Outcome, date range, participants
2. **What Went Well?**: Celebrate successes and effective practices
3. **What Was Painful or Missing?**: Identify friction points and gaps
4. **Learnings & Experiments**: Document new insights and validated approaches
5. **Improvements & Actions**: Table with category, action, owner, target date
6. **Follow-ups**: Link to related issues, PRs, or knowledge-base updates

Reference [knowledge-base/copilot/workflows-apr-retro.md](../../knowledge-base/copilot/workflows-apr-retro.md) for Atlassian retrospective best practices.

Ask open-ended questions to extract insights:
- "What surprised you during this feature?"
- "If we did this again, what would we change?"
- "What documentation would have helped?"
- "Did any assumptions prove incorrect?"

Propose concrete action items and suggest knowledge-base updates if patterns emerge.
```
