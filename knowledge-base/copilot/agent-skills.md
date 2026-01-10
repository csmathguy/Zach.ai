# Agent Skills

## Overview

Agent Skills are portable, reusable capability packages that Copilot automatically loads when relevant to a task. They provide a standardized way to extend Copilot with specialized workflows, templates, and resources.

**Key Characteristics**:

- **Portable**: Work across Copilot in VS Code (chat and agent mode), Copilot CLI, and Copilot coding agent
- **Task-Specific**: Activated only when relevant to current work (vs. custom instructions which are always-on)
- **Resource-Rich**: Can include scripts, templates, examples alongside instructions
- **Standard-Based**: Based on open standard at https://agentskills.io/

**Distinct from Custom Instructions**:

- Custom Instructions = Always-on global guidelines
- Agent Skills = Task-specific capabilities loaded on demand

## Setup in VS Code

**Requirements**:

- VS Code Insiders (for preview features)
- Enable setting: `chat.useAgentSkills`

**Preferred Location**: `.github/skills/` (legacy `.claude/skills/` still supported)

**Directory Structure**:

```
.github/skills/
├── webapp-testing/
│   ├── SKILL.md              # Skill definition (required)
│   ├── test-template.js      # Template resource
│   └── examples/             # Example files
├── refinement/
│   └── SKILL.md
└── apr-planning/
    └── SKILL.md
```

## Create a Skill

### File Structure

**Folder**: `.github/skills/<skill-name>/`  
**Main File**: `SKILL.md` (or `.skill.md` for single-file skills)

### YAML Frontmatter (Required)

```yaml
---
name: webapp-testing
description: Helps plan and implement web application tests with Playwright. Use when creating or extending UI test suites.
---
```

**Frontmatter Fields**:

- `name`: Unique identifier (lowercase, hyphenated, ≤64 chars)
  - Examples: `webapp-testing`, `refinement`, `apr-planning`
  - Used for skill discovery and matching
- `description`: Clear explanation of capabilities and when to use (≤1024 chars)
  - Should answer: "What does this skill do?" and "When should I use it?"
  - Used by Copilot to determine relevance

### Skill Body (Markdown)

**Content Guidelines**:

1. **Purpose**: What problem this skill solves
2. **When to Use**: Specific scenarios or triggers
3. **Instructions**: Step-by-step procedures
4. **Examples**: Input/output samples
5. **Resources**: Reference templates, scripts, examples

**Resource References**:

- Use relative paths: `[test template](./test-template.js)`
- Keep resources minimal and focused
- Prefer templates over executable binaries (security)

## Example SKILL.md

```markdown
---
name: webapp-testing
description: Helps plan and implement web application tests with Playwright. Use when creating or extending UI test suites for React/Vue applications.
---

# Web Application Testing Skill

## Purpose

Guide test creation and implementation for web applications using Playwright.

## When to Use

- User requests UI tests for web features
- Need to extend existing test suite
- Testing user flows or component behavior

## Instructions

### Step 1: Analyze Application

- Review app routes and component structure
- Identify critical user flows to test
- Note accessibility requirements (keyboard nav, screen readers)

### Step 2: Generate Test Files

- Use provided Playwright template (see below)
- Follow AAA pattern (Arrange-Act-Assert)
- Include meaningful test descriptions

### Step 3: Run and Validate

- Execute tests via terminal: `npm run test:e2e`
- Report failures with actionable error messages
- Suggest fixes based on error analysis

## Resources

- Template: [test-template.js](./test-template.js)
- Examples: [./examples/](./examples/)

## Best Practices

- Keep tests isolated (no shared state)
- Use data-testid selectors over brittle CSS
- Test behavior, not implementation
```

## How Copilot Uses Skills

Skills are loaded progressively in three levels:

**Level 1: Discovery** - Copilot reads `name` and `description` to determine relevance

- Fast initial scan
- Matches against user's request
- Decides whether to load full skill

**Level 2: Instructions** - Loads `SKILL.md` body when matched

- Reads procedures and guidelines
- Understands context and approach
- Applies instructions to current task

**Level 3: Resources** - Accesses referenced files on demand

- Loads templates when needed
- Reads examples for patterns
- Uses scripts for automation

## Use Shared Skills

**Browse Community Skills**:

- GitHub Awesome Copilot: https://github.com/github/awesome-copilot
- Anthropic Skills: https://github.com/anthropics/skills

**Integration Steps**:

1. Copy skill directory into `.github/skills/`
2. Review `SKILL.md` for security and relevance
3. Customize instructions for your project
4. Audit any included scripts/resources
5. Test skill discovery and loading in VS Code Insiders

**Security Review Checklist**:

- [ ] Review all terminal commands for safety

## Current Project Skills

Our `.github/skills/` directory contains:

1. **refinement.skill.md** - Agent system refinement and duplication detection
2. **webapp-testing/** - Playwright E2E testing for React applications
3. **apr-planning/** - APR/PRD structure and planning workflows
4. **retrospective/** - Retrospective analysis and continuous improvement
5. **feature-workflow/** - Complete feature development lifecycle
6. **ui-design-review/** - Frontend UI/UX design review and spec workflow

See individual `SKILL.md` files for detailed usage instructions.

## References

**Official Documentation**:

- VS Code Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Agent Skills Standard: https://agentskills.io/
- GitHub Blog: https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/

**Related Knowledge Base**:

- [Custom Agents](./README.md) - Agent creation and handoffs
- [Structure](./structure.md) - Workspace organization
- [Best Practices](./best-practices.md) - Security and workflow guidelines

## Best Practices

### Naming

- **Clear**: Descriptive names that explain purpose (`webapp-testing`, not `test`)
- **Hyphenated**: Use lowercase with hyphens (`refinement`, not `RefineAgent`)
- **Workflow-Mapped**: Align with real development tasks

### Scope

- **Focused**: One skill = one capability domain
- **Composable**: Multiple skills can work together
- **Split Complex**: Break large domains into focused skills
  - Example: `frontend-testing` → `react-testing` + `playwright-e2e`

### Resources

- **Minimal**: Only include essential files
- **Audited**: Review all scripts for security
- **Templates Preferred**: Use templates over executables
- **Documented**: Comment complex scripts thoroughly

### Security

- **Manual Approvals**: Keep tool/URL approvals manual by default
- **Review Commands**: Audit terminal commands before execution
- **No Auto-Approve**: Avoid broad auto-approval patterns
- **Whitelist Safe Operations**: Only whitelist well-understood cases

### Portability

- **Standard Location**: Always use `.github/skills/`
- **Relative Paths**: Use relative references within skill folder
- **No Absolute Paths**: Avoid repo-specific absolute paths
- **Cross-Workspace**: Design for reuse across projects

### Testing

- **Progressive Loading**: Test discovery → instructions → resources
- **VS Code Insiders**: Validate in Insiders before production use
- **Full Workflow**: Test complete skill execution end-to-end
- **Resource Access**: Verify templates and examples load correctly

## Skill vs Agent vs Instruction

Understanding the three-tier system:

| Aspect          | Agent                            | Skill                            | Instruction                  |
| --------------- | -------------------------------- | -------------------------------- | ---------------------------- |
| **Scope**       | Workflow orchestration           | Reusable capability              | Technology integration       |
| **Format**      | `.agent.md` with frontmatter     | `SKILL.md` in folder             | `.instructions.md`           |
| **Location**    | `.github/agents/`                | `.github/skills/`                | `.github/instructions/`      |
| **When Active** | Switched manually or via handoff | Auto-loaded when relevant        | Applied by file pattern      |
| **Contains**    | Step-by-step workflow, handoffs  | Procedures, templates, resources | How-to guidance, patterns    |
| **References**  | Instructions, KB, skills         | Templates, resources             | Knowledge base articles      |
| **Example**     | `developer.agent.md`             | `webapp-testing/`                | `typescript.instructions.md` |

**Best Practice**: Agents orchestrate workflow → Skills provide capabilities → Instructions guide integration

References

- VS Code docs: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- Agent Skills standard: https://agentskills.io/
- Blog announcement: https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/
