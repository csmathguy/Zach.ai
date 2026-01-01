```chatagent
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

# Retrospective Guidelines

- Reference `features/<branch>/retro/retrospective.md` and complete all sections.
- Follow guidance from [knowledge-base/copilot/workflows-apr-retro.md](../../knowledge-base/copilot/workflows-apr-retro.md) for retrospective best practices.
- Review the APR, test plan, and implementation notes to gather context.
- Ask the team (or user):
  - What went well?
  - What was painful or missing?
  - What did we learn or experiment with?
  - What improvements should we prioritize?
- Document action items with owners and target dates.
- Update `ideas/session-reflection.md` if broader patterns emerge.
- Propose knowledge-base updates if documentation gaps were discovered.
```
