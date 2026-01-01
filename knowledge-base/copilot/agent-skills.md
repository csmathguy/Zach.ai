# Agent Skills

Overview

- Agent Skills are portable folders of instructions, scripts, and resources that Copilot loads when relevant to a task.
- Works across Copilot in VS Code (chat and agent mode), Copilot CLI, and Copilot coding agent; based on the open standard at https://agentskills.io/.
- Distinct from custom instructions: skills are task-specific and can include resources; instructions are always-on guidelines.

Setup in VS Code

- Require VS Code Insiders for preview; enable the setting chat.useAgentSkills.
- Preferred location: .github/skills/; legacy supported: .claude/skills/.
- Structure: each skill is a subfolder with SKILL.md and optional resources.

Create a Skill

- Folder: .github/skills/<skill-name>/
- File: SKILL.md with YAML frontmatter and a body.
- Frontmatter fields:
  - name: unique, lowercase, hyphenated (e.g., webapp-testing), ≤64 chars.
  - description: clear capabilities and when to use; ≤1024 chars.
- Body guidance:
  - Describe purpose, when to use, and step-by-step procedures.
  - Provide examples of inputs/outputs and reference any scripts/resources.
  - Use relative links to files within the skill directory (e.g., [test template](./test-template.js)).

## Example SKILL.md

name: webapp-testing
description: Helps plan and implement web application tests with Playwright

---

# Skill Instructions

- When asked to create or extend web UI tests, load this skill.
- Steps:
  - Analyze app routes and user flows.
  - Generate Playwright test files using the provided template.
  - Run tests via the terminal tool; report failures with actionable fixes.
- Resources:
  - Template: ./test-template.js
  - Examples: ./examples/

How Copilot Uses Skills

- Level 1: Discovery — reads name/description to decide relevance.
- Level 2: Instructions — loads SKILL.md body when matched.
- Level 3: Resources — accesses referenced files on demand.

Use Shared Skills

- Browse skills: https://github.com/github/awesome-copilot and https://github.com/anthropics/skills.
- Copy skill directories into .github/skills/; review and customize SKILL.md.
- Ensure resources/scripts adhere to your security and workflow standards.

Best Practices

- Naming: clear, hyphenated names mapped to real workflows.
- Scope: keep skills focused; split complex domains into composable skills.
- Resources: include minimal, audited scripts; prefer templates over opaque binaries.
- Security: review terminal commands; avoid broad auto-approve; pin safe allow-lists.
- Portability: place in .github/skills/; avoid repo-specific absolute paths.
- Testing: validate skills end-to-end (discovery → instructions → resources) in Insiders.

References

- VS Code docs: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Agent Skills standard: https://agentskills.io/
- Blog announcement: https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/
