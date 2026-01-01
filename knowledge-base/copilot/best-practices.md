# Best Practices

Prompting

- Be specific; include goals, constraints, and expected output format.
- Add context with `#` references (files, codebase, terminal output) and `/` prompts.
- Iterate: refine with follow-ups; confirm assumptions.

Agents and tools

- Create role-specific custom agents (Plan → Implement → Review) and use handoffs.
- Keep tool lists minimal and relevant; prefer explicit `#tool` references for determinism.
- Group tools with tool sets for repeatable workflows.

Agent Skills

- Place skills under `.github/skills/` (portable) rather than legacy `.claude/skills/`.
- Use clear, hyphenated `name` and specific `description` frontmatter for relevance.
- Keep skills focused; compose multiple skills for complex workflows.
- Include minimal, audited resources (templates/scripts); reference via relative paths.
- Validate progressive loading: discovery → instructions → resources.

Security and approvals

- Keep tool/URL approvals manual by default; whitelist only well-understood cases.
- Review tool parameters and terminal commands; avoid broad auto-approval.
- Protect sensitive files; audit edits and terminal actions.

MCP servers

- Prefer trusted publishers; review `mcp.json` configs and logs.
- Clear cached tools when updating servers; restart to refresh capabilities.

Extension development (when needed)

- Tools: clear names (`verb_noun`), rich descriptions, input schemas, and confirmations.
- Chat participants: narrow scope, follow naming conventions, measure success.

Models

- Pick fast models for coding, reasoning models for planning/refactoring.
- Keep model choice consistent per workflow to stabilize behavior.
