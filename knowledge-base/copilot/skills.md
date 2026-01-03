# Skills: Terminology Update

We previously used “skills” as a catch‑all term for Copilot capabilities (tools, prompts, agents). GitHub Copilot now supports formal Agent Skills — portable folders of instructions and resources that agents load automatically when relevant.

## What to Use

- **Agent Skills**: See [agent-skills.md](./agent-skills.md) for portable capabilities, setup, structure, and best practices
- **Custom Agents**: See [agents/README.md](./agents/README.md) for workflow orchestration, handoffs, tool-sets
- **Tools**: See [tools/](./tools/) for built‑in, extension, and MCP tools
- **Prompts**: See [prompts/](./prompts/) for reusable prompt files

## Three-Tier System

1. **Custom Agents** (`.agent.md`) - Workflow orchestration, manually switched or via handoffs
2. **Agent Skills** (`SKILL.md`) - Reusable capabilities, auto-loaded when relevant
3. **Instructions** (`.instructions.md`) - Technology integration, applied by file pattern

See [structure.md](./structure.md) for recommended workspace organization.

## References

- **Agent Skills in VS Code**: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- **Custom Agents**: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- **Agent Skills Standard**: https://agentskills.io/
