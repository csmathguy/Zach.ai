# Agent Setup (Codex and VS Code)

This repository uses VS Code Copilot custom agents and instruction files to guide behavior.
Codex should load the right agent and instructions before starting any task.

## Where Agents and Instructions Live

- Agents: `.github/agents/*.agent.md` (YAML frontmatter + Markdown body)
- Global instructions: `.github/copilot-instructions.md`
- Scoped instructions: `.github/instructions/*.instructions.md`
- Reference material: `knowledge-base/`

## Session Startup Checklist

1. Read `.github/copilot-instructions.md` for global workflow rules.
2. Decide the active agent based on the task:
   - Implementation work: `.github/agents/developer.agent.md`
   - Planning: `.github/agents/planner.agent.md`
   - Architecture: `.github/agents/architect.agent.md`
   - Research: `.github/agents/researcher.agent.md`
   - Testing: `.github/agents/tester.agent.md`
   - Retrospective: `.github/agents/retro.agent.md`
   - Refinement: `.github/agents/refiner.agent.md`
3. Load any instruction files linked from the agent (for developer: TDD, testing, TypeScript).
4. Only then begin the task work.

## Developer Agent Required Flow

If the task is implementation, open `.github/agents/developer.agent.md` first and follow it.
Do not start coding until the TDD workflow and validation steps are in context.

## Sources (Best Practices)

- VS Code custom agents: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- VS Code custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- Project Copilot setup: `knowledge-base/copilot/README.md`
- Agent structure: `knowledge-base/copilot/agents/README.md`
