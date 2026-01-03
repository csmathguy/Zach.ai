# Custom Agents in VS Code

Complete guide to creating and managing custom agents for GitHub Copilot.

**Last Updated**: January 2026 (VS Code 1.106+)

---

## What are Custom Agents?

Custom agents are specialized AI configurations that define specific behaviors, available tools, and instructions for different development roles and tasks. They enable you to quickly switch between focused workflows without manually reconfiguring tools and context each time.

**Key Capabilities**:

- **Role-Based**: Create agents for planner, architect, developer, reviewer, etc.
- **Tool Control**: Specify exactly which tools are available per agent
- **Instructions**: Define how the AI should operate in that role
- **Handoffs**: Create guided workflows that transition between agents
- **Reusable**: Use in background agents and cloud agents

**File Format**: `.agent.md` (Markdown with YAML frontmatter)

---

## Why Use Custom Agents?

### Problem: One-Size-Fits-All Doesn't Work

Different tasks require different capabilities:

- **Planning** needs read-only tools (no accidental edits)
- **Implementation** needs full editing capabilities
- **Review** needs analysis tools + security scanning
- **Testing** needs test execution + coverage tools

### Solution: Task-Specific Agents

Custom agents ensure the AI has the right capabilities for each job:

- Planning agent: Research tools only, generates implementation plans
- Developer agent: Full editing, follows TDD workflow, runs tests
- Review agent: Analysis tools, identifies vulnerabilities, suggests improvements

---

## Agent File Structure

### Complete Example

```markdown
---
name: Planner
description: Generate an implementation plan for new features or refactoring existing code
argument-hint: 'Describe the feature or refactoring task'
tools: ['fetch', 'githubRepo', 'search', 'usages']
model: Claude Sonnet 4
infer: true
target: vscode
handoffs:
  - label: Start Implementation
    agent: developer
    prompt: Implement the plan outlined above.
    send: false
  - label: Research Technologies
    agent: researcher
    prompt: Research the technologies mentioned in the plan.
    send: false
---

# Planning Instructions

You are in planning mode. Your task is to generate an implementation plan for a new feature or for refactoring existing code.

**Do not make any code edits** - just generate a plan.

## Plan Structure

The plan consists of a Markdown document with these sections:

### 1. Overview

Brief description of the feature or refactoring task.

### 2. Requirements

List of requirements for the feature or refactoring task.

### 3. Implementation Steps

Detailed list of steps to implement the feature or refactoring task.

### 4. Testing

List of tests that need to be implemented to verify the feature or refactoring task.

## Deliverables

- [ ] APR document in `work-items/<branch>/plan/apr.md`
- [ ] User stories with acceptance criteria
- [ ] Architecture considerations noted
```

### YAML Frontmatter Fields

| Field           | Required | Description                                | Example                          |
| --------------- | -------- | ------------------------------------------ | -------------------------------- |
| `name`          | No       | Agent name (defaults to filename)          | `Planner`                        |
| `description`   | No       | Brief description shown in chat input      | `Generate implementation plans`  |
| `argument-hint` | No       | Hint text guiding user interaction         | `Describe the feature to plan`   |
| `tools`         | No       | Available tools/tool-sets                  | `['search', 'fetch', 'planner']` |
| `model`         | No       | Preferred AI model                         | `Claude Sonnet 4`                |
| `infer`         | No       | Enable as subagent (default: true)         | `true`                           |
| `target`        | No       | Environment (`vscode` or `github-copilot`) | `vscode`                         |
| `handoffs`      | No       | List of next-step transitions              | See handoffs section             |

**Tool Syntax**:

- Built-in tools: `'search'`, `'fetch'`, `'edit'`
- Tool sets: `'developer'`, `'planner'`, `'tester'`
- MCP tools: Tool names from MCP servers
- MCP server (all tools): `'server-name/*'`

**Model Selection**:

- Fast coding: `Claude Sonnet 3.5`
- Reasoning: `Claude Sonnet 4`, `o1`, `o3-mini`
- Keep consistent per workflow for stable behavior

### Body Content

The body contains agent instructions in Markdown format:

**What to Include**:

- Agent role and purpose
- Behavioral guidelines
- Step-by-step procedures
- Quality criteria
- Deliverables checklist
- References to instruction files

**Reference Syntax**:

- Instruction files: `[TypeScript Instructions](../instructions/typescript.instructions.md)`
- Knowledge base: `[TDD Guide](../../knowledge-base/tdd/README.md)`
- Tools: Use `#tool:<tool-name>` syntax (e.g., `#tool:githubRepo`)

**Best Practices**:

- Keep agent body focused on workflow
- Reference detailed content in instructions/KB
- Include verification checklists
- Specify clear deliverables

---

## Handoffs: Guided Workflows

Handoffs enable sequential workflows that transition between agents with suggested next steps.

### Why Handoffs?

**Problem**: Multi-step workflows require manual context switching and prompt crafting.

**Solution**: Handoff buttons appear after chat completion, pre-filling prompts with context.

**Benefits**:

- **Guided Flow**: Clear path through multi-step processes
- **Context Preservation**: Relevant information passed to next agent
- **Control**: Developers review and approve each step
- **Consistency**: Same workflow pattern every time

### Handoff Configuration

```yaml
handoffs:
  - label: Start Implementation
    agent: developer
    prompt: Implement the plan outlined above.
    send: false
  - label: Review Changes
    agent: reviewer
    prompt: Review the implementation for quality and security.
    send: true
```

**Handoff Fields**:
| Field | Required | Description |
|-------|----------|-------------|
| `label` | Yes | Button text shown to user |
| `agent` | Yes | Target agent identifier |
| `prompt` | Yes | Pre-filled prompt for next agent |
| `send` | No | Auto-submit prompt (default: false) |

**When to Auto-Send** (`send: true`):

- Deterministic next steps (e.g., "Run tests" after implementation)
- Low-risk operations (read-only analysis)
- Workflow momentum desired

**When to Manual Send** (`send: false`):

- User should review context first
- Prompt may need customization
- High-impact operations (code changes, deployment)

### Common Workflow Patterns

#### Planning → Implementation

```yaml
# planner.agent.md
handoffs:
  - label: Implement Plan
    agent: developer
    prompt: Implement the plan outlined above.
    send: false
```

#### Implementation → Testing

```yaml
# developer.agent.md
handoffs:
  - label: Run Tests
    agent: tester
    prompt: Implementation complete. Validate with the full test suite.
    send: true
```

#### Testing → Review

```yaml
# tester.agent.md
handoffs:
  - label: Code Review
    agent: reviewer
    prompt: Tests passing. Review implementation for quality and security.
    send: false
```

#### Review → Retrospective

```yaml
# reviewer.agent.md
handoffs:
  - label: Start Retrospective
    agent: retro
    prompt: Feature is complete and validated. Begin the retrospective process.
    send: false
```

### Handoff Best Practices

1. **Explicit Deliverables**: Document what previous agent should produce
2. **Context Preservation**: Include summary of key decisions in handoff prompt
3. **Verification Checklist**: Specify what next agent should verify
4. **Escape Hatches**: Provide alternative handoffs for edge cases

**Example with Context**:

```yaml
handoffs:
  - label: Implement Plan
    agent: developer
    prompt: |
      Implement the plan outlined above.

      **Context from Planning**:
      - Architecture decisions documented in ADRs
      - Interfaces defined in contracts.md
      - Test strategy specified in test-plan.md

      **Next Steps**:
      1. Create feature branch
      2. Implement following TDD (RED-GREEN-REFACTOR)
      3. Run validation suite
    send: false
```

---

## Tool Sets

Tool sets group related tools for specific workflows.

### Define Tool Set

```json
// .github/tool-sets.jsonc
{
  "planner": {
    "description": "Read-only tools for planning and research",
    "tools": ["fetch", "githubRepo", "search", "usages"]
  },
  "developer": {
    "description": "Full development tools",
    "tools": ["edit", "search", "fetch", "terminal", "test"]
  },
  "tester": {
    "description": "Testing and validation tools",
    "tools": ["test", "terminal", "search"]
  }
}
```

### Use Tool Set in Agent

```yaml
---
name: Planner
tools: ['planner'] # References tool set from tool-sets.jsonc
---
```

### Tool Priority Order

When multiple sources specify tools, priority is:

1. **Prompt file tools** (highest priority if using prompt)
2. **Agent tools** (from referenced agent in prompt)
3. **Default agent tools** (agent's own tool list)

**Example**:

```yaml
# planner.agent.md
tools: ['search', 'fetch']

# implementation.prompt.md
agent: planner
tools: ['search', 'fetch', 'edit']  # Adds 'edit' to planner's tools
```

---

## Create Custom Agents

### Via VS Code UI

1. **Open Agents Dropdown**: Click agent selector in chat view
2. **Configure Custom Agents**: Select "Configure Custom Agents"
3. **Create New**: Select "Create new custom agent"
4. **Choose Location**:
   - **Workspace**: `.github/agents/` (project-specific)
   - **User Profile**: Global profile folder (reuse across workspaces)
5. **Name Agent**: Enter filename (e.g., `planner.agent.md`)
6. **Edit Definition**: Fill YAML frontmatter and body

### Via File Creation

```powershell
# Create workspace agent
New-Item -ItemType Directory -Path .github/agents -Force
New-Item -ItemType File -Path .github/agents/planner.agent.md

# Edit with frontmatter and instructions
code .github/agents/planner.agent.md
```

### Agent Discovery

VS Code automatically detects `.agent.md` files in:

- `.github/agents/` (workspace agents)
- User profile folder (global agents)
- Organization-level (experimental - see sharing section)

---

## Manage Agents

### Show/Hide Agents

1. Select "Configure Custom Agents" from dropdown
2. Hover over agent in list
3. Click eye icon to show/hide from agents dropdown

### Update Agent

1. Select "Configure Custom Agents"
2. Click agent to edit
3. Modify YAML frontmatter or body
4. Save changes (reload if needed)

### Delete Agent

Delete the `.agent.md` file from:

- `.github/agents/` (workspace)
- Profile folder (global)

---

## Share Agents Across Teams

### Workspace-Level Sharing

**Location**: `.github/agents/` in repository

**Benefits**:

- Version controlled with code
- Team automatically has access
- Changes reviewed via pull requests
- Consistent across team

**Setup**:

1. Create agent in `.github/agents/`
2. Commit to repository
3. Team members pull changes
4. Agents appear in dropdown automatically

### Organization-Level Sharing (Experimental)

**Location**: GitHub organization settings

**Benefits**:

- Share across multiple repositories
- Centralized management
- Automatic discovery
- Organization-wide consistency

**Enable**:
Set `github.copilot.chat.customAgents.showOrganizationAndEnterpriseAgents` to `true`

**Learn More**:
https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents

---

## Project Agent System

Our `.github/agents/` directory contains a complete feature workflow:

1. **planner.agent.md** - APR/PRD creation, user story definition
2. **architect.agent.md** - ADR creation, contracts, technical design
3. **researcher.agent.md** - Technology research, KB documentation
4. **tester.agent.md** - Test strategy, Gherkin specifications
5. **developer.agent.md** - TDD implementation, SOLID compliance
6. **retro.agent.md** - Retrospective analysis, continuous improvement
7. **refiner.agent.md** - Agent system refinement, duplication removal

**Workflow**:

```
Planner → Architect → Researcher → Tester → Developer → Retro → Refiner
```

Each agent has handoffs to the next in the sequence, creating a guided feature development lifecycle.

---

## Best Practices

### Agent Design

1. **Single Responsibility**: One agent = one role
2. **Tool Minimization**: Only include necessary tools
3. **Clear Instructions**: Document role, process, deliverables
4. **Verification Checklists**: Specify quality criteria
5. **Handoff Guidance**: Explain context for next agent

### Workflow Orchestration

1. **Progressive Disclosure**: Break complex work into agent phases
2. **Manual Checkpoints**: Use `send: false` for review points
3. **Context Preservation**: Pass key decisions in handoff prompts
4. **Escape Hatches**: Provide alternative handoffs for edge cases

### Security

1. **Tool Restrictions**: Limit tools to minimum required
2. **Review Terminal Commands**: Audit commands before approval
3. **No Auto-Approve**: Keep manual approval as default
4. **Whitelist Safe Operations**: Only auto-approve well-understood cases

### Maintenance

1. **Document Changes**: Note why agent was modified
2. **Test Workflows**: Validate handoffs work end-to-end
3. **Gather Feedback**: Learn from retrospectives
4. **Refine Regularly**: Use refiner agent after major features

---

## Troubleshooting

### Agent Not Appearing

**Check**:

- File has `.agent.md` extension
- File is in `.github/agents/` folder
- YAML frontmatter is valid
- Agent not hidden in dropdown settings

**Fix**:

```powershell
# Verify location
Get-ChildItem .github/agents/*.agent.md

# Check YAML syntax
code .github/agents/your-agent.agent.md
```

### Handoff Not Working

**Check**:

- Target agent exists
- Agent identifier matches target agent name
- Prompt is properly formatted (multiline with `|` if needed)
- `send` field is valid boolean

**Fix**:

```yaml
# Ensure target agent exists
handoffs:
  - label: Next Step
    agent: developer # Must match developer.agent.md name
    prompt: Continue with implementation.
    send: false
```

### Tools Not Available

**Check**:

- Tool names are correct (case-sensitive)
- Tool set is defined in `tool-sets.jsonc`
- MCP server is installed and running
- Tool not disabled in settings

**Fix**:

```yaml
# Verify tool names
tools: ['search', 'fetch'] # Not 'Search', 'Fetch'


# Check tool set definition
# .github/tool-sets.jsonc
```

---

## Migration from Chat Modes

Custom agents were previously called "custom chat modes". Existing `.chatmode.md` files still work.

**Quick Fix Available**:

1. Open `.chatmode.md` file
2. VS Code shows Quick Fix action
3. Rename and move to `.github/agents/` with `.agent.md` extension

**Manual Migration**:

```powershell
# Move and rename
Move-Item .github/chatmodes/planner.chatmode.md .github/agents/planner.agent.md

# Update references in other files
```

---

## References

**Official Documentation**:

- Custom Agents: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- Background Agents: https://code.visualstudio.com/docs/copilot/agents/background-agents
- Cloud Agents: https://code.visualstudio.com/docs/copilot/agents/cloud-agents

**Related Knowledge Base**:

- [Agent Skills](../agent-skills.md) - Reusable capabilities
- [Structure](../structure.md) - Workspace organization
- [Best Practices](../best-practices.md) - Security and workflow
- [Workflows](../workflows-apr-retro.md) - APR and retrospective patterns

**Examples**:

- Awesome Copilot: https://github.com/github/awesome-copilot
- VS Code Samples: https://github.com/microsoft/vscode-extension-samples
