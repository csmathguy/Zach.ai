# Workspace Structure for Copilot

Recommended repo layout for VS Code + Copilot:

- .github/
  - agents/ — custom agents (`*.agent.md`)
  - prompts/ — reusable prompts (`*.prompt.md`)
  - instructions/ — scoped instruction files (`*.instructions.md`)
  - copilot-instructions.md — optional global guidance
  - skills/ — Agent Skills folders (`SKILL.md` + resources)
  - tool-sets.jsonc — optional tool set definitions
  - workflows/ — GitHub Actions CI (`*.yml`)
  - ISSUE_TEMPLATE/ — issue forms (`*.yml`)
  - pull_request_template.md — PR checklist
  - SECURITY.md — vulnerability reporting policy
  - CODEOWNERS — ownership and review gates
  - dependabot.yml — automated dependency updates
  - FUNDING.yml — sponsors configuration (optional)
- mcp.json — optional MCP server config (workspace-level)
- .gitignore — repository-wide ignore rules
- .gitattributes — line endings and linguist settings

Notes

- Agent Skills: portable capabilities auto-loaded when relevant; prefer `.github/skills/`.
- Agents: constrain behavior (plan-only vs implement) and enable handoffs.
- Prompts: standardize common flows; reference tools with `#tool:<name>`.
- Instructions: keep guidelines short; apply selectively with `applyTo` globs.
- Tool sets: group tools for repeatable workflows; referenced in prompts/agents.
- Workflows: start with lint/test CI; expand per frontend/backend stacks.
- Community health: templates, security, owners improve contribution quality.
- MCP: install servers via Extensions (`@mcp`) or configure here; review trust.

Docs

- Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Agents: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- Prompts: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- Custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- Tools & tool sets: https://code.visualstudio.com/docs/copilot/chat/chat-tools
- MCP servers: https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- CODEOWNERS: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- Actions workflows: https://docs.github.com/en/actions/using-workflows/about-workflows
