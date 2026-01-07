# Zach.ai Agents Directory

This repository ships a complete Copilot/Codex agent workflow. Use this file as the single reference for locating agent definitions, knowing which instructions to load, and understanding how to trigger each agent from VS Code, the Copilot CLI, or the Codex CLI.

## Files You Need

- **Agents**: `.github/agents/*.agent.md`
- **Global instructions**: `.github/copilot-instructions.md`
- **Scoped instructions**: `.github/instructions/*.instructions.md`
- **Knowledge base**: `knowledge-base/`
- **Feature templates**: `work-items/_template/`

## Session Checklist

1. Start at the repository root so tools can see both `backend/` and `frontend/`.
2. Read `.github/copilot-instructions.md` (global rules) plus any instruction files referenced by the agent you plan to run.
3. Open the agent's `.agent.md` file to load its workflow context before giving it tasks.
4. Only after the above steps, run Copilot or Codex with the correct agent.

## Workflow Overview

| Phase               | Agent (file)                                        | Inputs                               | Outputs                                                           | Handoff                                            |
| ------------------- | --------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------- |
| Planning            | `planner` (`.github/agents/planner.agent.md`)       | Product vision, user goals           | APR (`work-items/<feature>/plan/apr.md`), feature folder skeleton | Architect -> Developer/Test when planner hands off |
| Architecture        | `architect` (`.github/agents/architect.agent.md`)   | APR, constraints                     | ADRs, contracts, updated architecture README                      | Researcher (if new tech), Tester, Developer        |
| Research            | `researcher` (`.github/agents/researcher.agent.md`) | Tech gaps from APR/ADRs              | KB articles under `knowledge-base/`, research findings            | Tester (for tooling guidance)                      |
| Testing Strategy    | `tester` (`.github/agents/tester.agent.md`)         | APR, contracts                       | Test plan, TS-XXX suites, Gherkin specs                           | Developer                                          |
| Development         | `developer` (`.github/agents/developer.agent.md`)   | APR, ADRs, contracts, test plan      | Code + updated tests following TDD                                | Tester (for validation) -> Retro                   |
| Retrospective       | `retro` (`.github/agents/retro.agent.md`)           | Completed feature + validation notes | Retro docs under `work-items/<feature>/retro/`                    | Refiner (optional)                                 |
| Workflow Refinement | `refiner` (`.github/agents/refiner.agent.md`)       | Completed feature artifacts & retros | Updates to agents/instructions/KB                                 | Back to Planner for future work                    |

## Agent Reference

### Planner

- **Purpose**: Build APRs and establish feature workspaces before any code changes.
- **Key docs**: `work-items/_template/plan/apr.md`, `knowledge-base/copilot/workflows-apr-retro.md`.
- **Deliverables**: Approved APR, feature branch, initial retro doc, next-agent prompts.
- **Handoffs**: Tester ("Design the test strategy"), Developer ("Start implementation") when APR & tests are ready.

### Architect

- **Purpose**: Transform APRs into ADRs, contracts, and architecture docs.
- **Key docs**: `work-items/<feature>/architecture/*.md`, `knowledge-base/codebase/architecture-decisions/`.
- **Deliverables**: Architecture README, ADRs, contract definitions, diagrams.
- **Handoffs**: Researcher if new tech is needed, Tester with finalized contracts, Developer when architecture is locked.

### Researcher

- **Purpose**: Investigate technologies referenced in APRs/ADRs and update the knowledge base.
- **Key docs**: `knowledge-base/copilot/agents/README.md`, relevant technology folders under `knowledge-base/`.
- **Deliverables**: `knowledge-base/<topic>/README.md` updates and research summaries in `work-items/<feature>/research/`.
- **Handoffs**: Tester (for tooling guidance) and Developer (for implementation caveats).

### Tester

- **Purpose**: Create TS-XXX suites, test plans, and Gherkin specs that drive TDD.
- **Key docs**: `work-items/_template/tests/`, `.github/instructions/testing.instructions.md`, `.github/instructions/tdd.instructions.md`.
- **Deliverables**: Updated `tests/test-plan.md`, TS-XXX suite files, Gherkin checklists.
- **Handoffs**: Developer with explicit acceptance criteria, later Retro for validation notes.

### Developer

- **Purpose**: Implement features via TDD, adhering to SOLID and validation gates.
- **Key docs**: `.github/agents/developer.agent.md`, `.github/instructions/tdd.instructions.md`, `.github/instructions/testing.instructions.md`, `.github/instructions/typescript.instructions.md`, `knowledge-base/tdd/README.md`.
- **Deliverables**: Production code + tests, dev task files under `work-items/<feature>/dev/`, validation summary before handoff.
- **Handoffs**: Tester (run test suite) and Retro (capture lessons).

### Retro

- **Purpose**: Document learnings immediately after implementation/testing for the feature.
- **Key docs**: `work-items/_template/retro/retrospective.md`, `.github/instructions/retrospective.instructions.md`.
- **Deliverables**: Updated retro docs per phase/task plus action items.
- **Handoffs**: Refiner (apply improvements) or Planner (if scope changes needed).

### Refiner

- **Purpose**: Improve agents, instructions, and KB after retrospectives surface gaps.
- **Key docs**: `.github/agents/refiner.agent.md`, `.github/instructions/refinement.instructions.md`.
- **Deliverables**: Updates to instructions/agents/KB plus follow-up work items.
- **Handoffs**: Planner/Architect when new guidance is ready.

## Using Agents In Tools

### VS Code Copilot / Copilot CLI

1. Open the Copilot Chat agent selector (or run `/agent`) and choose the desired agent (planner, developer, etc.).
2. Mention relevant files by path (e.g., `@backend/src/server.ts`) or rely on copilot CLI flags such as `copilot --agent developer --prompt "<task>" --allow-tool 'write'`.
3. Keep approvals aligned with the agent's permissions (developer/tester can edit files; planner/researcher should be read-heavy).

### Codex CLI

- **Interactive**: Run `codex`, set `/sandbox workspace-write` (or read-only for analysis), then prompt with "Act as the Zach.ai <agent> defined in .github/agents/<agent>.agent.md...".
- **Non-interactive template**:

```bash
codex exec \
  --sandbox workspace-write \
  --ask-for-approval on-request \
  "Act as the Zach.ai developer agent defined in .github/agents/developer.agent.md. Load .github/instructions/tdd.instructions.md and .github/instructions/testing.instructions.md, follow the TDD workflow, and <describe task>. Summarize changes plus validation steps."
```

Update the highlighted paths and sandbox mode to match the agent (e.g., planner or tester can run in `read-only` when no edits are expected).

## References

- GitHub Copilot instructions hierarchy: `knowledge-base/copilot/README.md`
- Agent architecture best practices: `knowledge-base/copilot/agent-architecture-best-practices.md`
- Copilot CLI usage with agents: `knowledge-base/copilot/copilot-cli.md`
- Codex CLI usage: `knowledge-base/tooling/codex-cli.md`
