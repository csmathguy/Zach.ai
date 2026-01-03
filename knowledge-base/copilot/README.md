# Copilot Knowledge Base

Start here for GitHub Copilot (VS Code) concepts we’ll use in Zach.ai.

## Core Documentation

- **summary.md** — What Copilot offers and how we'll use it
- **setup.md** — Enable Copilot, agents, tools, MCP servers, prompts
- **best-practices.md** — Prompting, security, tool usage, model selection
- **references.md** — Topic → link map to authoritative docs
- **structure.md** — Recommended `.github` folder layout for agents/prompts/tool sets
- **workflows-apr-retro.md** — APR/PRD structure and retrospective best practices

## Agent System (Three Tiers)

**Tier 1: Custom Agents** (Workflow Orchestration)

- **agents/README.md** — Complete guide to custom agents with handoffs and tool-sets
- **agents/** — Project agents (.agent.md files): planner, architect, researcher, tester, developer, retro, refiner

**Tier 2: Agent Skills** (Reusable Capabilities)

- **agent-skills.md** — Create and use portable Agent Skills across Copilot (auto-loaded when relevant)
- Project skills: refinement, webapp-testing, apr-planning, retrospective, feature-workflow

**Tier 3: Instructions** (Technology Integration)

- Located in `.github/instructions/` - Applied to specific file patterns
- See [structure.md](./structure.md) for instruction organization

## Extension and Tools

- **prompts/** — Prompt files (.prompt.md), tips, examples
- **tools/** — Built-in, extension, and MCP tools used by Copilot
- **mcp-servers/** — Using and configuring MCP servers in VS Code
- **extension-dev/** — Extending Copilot/VS Code via tools and chat participants
