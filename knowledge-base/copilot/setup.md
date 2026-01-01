# Setup: Copilot + Agents + Tools + MCP + Prompts

Prereqs

- Latest VS Code; Copilot enabled with your GitHub account.
- For MCP: confirm trust and security posture.

Steps

1. Copilot sign-in: See https://code.visualstudio.com/docs/copilot/setup
2. Chat basics and agents: https://code.visualstudio.com/docs/copilot/chat/copilot-chat
3. Enable tools picker in Chat view; select relevant tools per task: https://code.visualstudio.com/docs/copilot/chat/chat-tools
4. Add MCP servers if needed: https://code.visualstudio.com/docs/copilot/customization/mcp-servers
   - Use Extensions view with `@mcp`, or define `mcp.json` (workspace or user).
5. Create custom agents (.agent.md) for common roles: https://code.visualstudio.com/docs/copilot/customization/custom-agents
6. Create prompt files (.prompt.md) for reusable flows: https://code.visualstudio.com/docs/copilot/customization/prompt-files
7. Optional: Add custom instructions for global guidance: https://code.visualstudio.com/docs/copilot/customization/custom-instructions

Workspace structure (recommended)

- `.github/agents`: custom agents (`*.agent.md`) with handoffs where needed.
- `.github/prompts`: reusable prompts (`*.prompt.md`) with tools specified in frontmatter.
- `.github/copilot-instructions.md`: optional global instructions to guide responses.
- `.github/tool-sets.jsonc`: optional tool set definitions for grouping related tools.
- `mcp.json`: optional MCP server definitions at workspace scope.

Security and approvals (recommended defaults)

- Require manual approval for risky tools/URLs; review params before running.
- Consider terminal auto-approve rules only for safe commands.
- See Security: https://code.visualstudio.com/docs/copilot/security
