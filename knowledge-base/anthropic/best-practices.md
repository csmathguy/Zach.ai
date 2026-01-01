# Best Practices (Claude)

Prompting

- State objective, constraints, interfaces, and expected output structure.
- Provide short, scoped inputs; iterate with deltas.
- Prefer explicit references (files, APIs, schemas) when available.

Safety and controls

- Treat external content as untrusted; summarize or sanitize before re-use.
- Keep secrets out of prompts; use environment variables or connectors.
- Version prompts and record decisions for reproducibility.

Workflows

- Separate roles: Plan → Implement → Review with minimal cross-talk.
- Use checklists for acceptance criteria and test coverage.
- Evaluate with small, representative examples before scaling.
