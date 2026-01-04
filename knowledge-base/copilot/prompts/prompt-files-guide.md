# Prompt Files - Comprehensive Guide

**Purpose**: Document prompt files as user-facing entry points for standardized workflows  
**Status**: Currently configured but not actively used - documented for future activation  
**Official Docs**: https://code.visualstudio.com/docs/copilot/customization/prompt-files

---

## Overview

Prompt files are Markdown files (`.prompt.md`) that define **reusable templates** for common development tasks. They serve as **user-facing entry points** invoked via slash commands (`/apr`, `/retro`, `/explain`) in VS Code Copilot Chat.

**Key Insight**: Prompts are the **interface layer** - users discover and invoke them. Agents are the **implementation layer** - they orchestrate complex workflows.

### Customization Hierarchy

VS Code provides 4 distinct customization types with different purposes:

1. **Custom Instructions** (`.github/copilot-instructions.md`) - Persistent guidelines for ALL conversations
2. **Prompt Files** (`.github/prompts/*.prompt.md`) - On-demand task templates with `/` commands
3. **Custom Agents** (`.github/agents/*.agent.md`) - Role-based personas with complex workflows
4. **MCP Servers** (`mcp.json`) - External tool integrations

**Reference**: [VS Code Copilot Chat Documentation](https://code.visualstudio.com/docs/copilot/copilot-chat)

---

## When to Use Prompts vs Agents

### Prompts Are Best For

✅ **Standardizing common workflows** across teams

- Generate APRs following template structure
- Conduct retrospectives with consistent format
- Perform code reviews against standards

✅ **On-demand task invocation**

- User types `/apr` → APR generation starts
- User types `/retro` → Retrospective begins
- User types `/test` → Test plan generation

✅ **Providing user guidance**

- Argument hints ("Describe the feature goal, user needs...")
- Example prompts ("Explain authentication flow")
- Quick reference for task requirements

✅ **Quick, reusable templates**

- 10-50 lines focused on single task
- Minimal orchestration logic
- Reference agents for complex workflows

### Agents Are Best For

✅ **Complex multi-step workflows**

- Planning → Architecture → Testing → Development
- Decision trees and branching logic
- Phase-specific verification checklists

✅ **Role-based personas**

- Planner agent (research, APR creation)
- Architect agent (ADRs, contracts, diagrams)
- Developer agent (TDD implementation)
- Retro agent (retrospective analysis)

✅ **Autonomous decision-making**

- Choose which tools to invoke
- Determine when to hand off to next agent
- Validate deliverables before handoff

✅ **Persistent mode selection**

- User selects agent mode from dropdown
- Agent context persists across conversation
- Workflow-oriented interaction

**Key Pattern**: Prompts reference agents. User invokes `/apr` → Copilot uses `planner` agent → Agent executes workflow.

---

## Prompt File Structure

### Anatomy of a Prompt File

```markdown
---
name: apr
description: Generate or update an Architectural & Product Requirements document
argument-hint: Describe the feature goal, user needs, and key constraints
agent: planner
tool-set: planner
model: claude-3.5-sonnet
tools:
  - search
  - fetch
  - read_file
  - edit
---

# APR Generation Prompt Body

Generate an APR with the following sections:

1. **Overview & Objective** - Why and what success looks like
2. **Goals & Success Metrics** - Business outcomes, non-goals
3. **Scope** - In/out of scope, dependencies, timeline
   ...

Reference: [APR Template](../../../work-items/_template/plan/apr.md)
```

### Frontmatter Fields

| Field           | Required | Description                                   | Example                 |
| --------------- | -------- | --------------------------------------------- | ----------------------- |
| `name`          | No       | Slash command name (defaults to filename)     | `apr` for `/apr`        |
| `description`   | No       | Short description shown in chat               | "Generate APR document" |
| `argument-hint` | No       | Guidance shown in chat input                  | "Describe feature goal" |
| `agent`         | No       | Agent to use (`ask`, `edit`, `agent`, custom) | `planner`               |
| `tool-set`      | No       | Tool set from tool-sets.jsonc                 | `planner`               |
| `model`         | No       | Language model to use                         | `claude-3.5-sonnet`     |
| `tools`         | No       | Array of tool names available                 | `[search, fetch, edit]` |

**Default Behavior**:

- If `tools` specified → Use those tools
- Else if `tool-set` specified → Use tools from tool-set
- Else if `agent` specified → Use default tools for that agent
- Else → Use current agent's default tools

**Reference**: [Prompt File Structure Documentation](https://code.visualstudio.com/docs/copilot/customization/prompt-files#_prompt-file-structure)

### Body Syntax

**Variables**:

- `${workspaceFolder}` - Workspace root path
- `${file}` - Current file path
- `${selection}` - Selected text
- `${input:variableName}` - Prompt user for input
- `${input:variableName:placeholder}` - With default placeholder

**References**:

- Markdown links to files: `[Template](../path/to/template.md)`
- Tool references: `#tool:githubRepo` or `#tool:fetch`
- Context mentions: Use `#codebase`, `#file`, `#terminalSelection`

**Example**:

```markdown
Review the selected code in ${file}:

\`\`\`
${selection}
\`\`\`

Check against SOLID principles documented in [Development Guide](../../../knowledge-base/codebase/development-guide.md).

Use #tool:search to find similar patterns in #codebase.
```

---

## Best Practices (From Microsoft Documentation)

### Microsoft's Official Recommendations

From [VS Code Prompt Files Guide](https://code.visualstudio.com/docs/copilot/customization/prompt-files#_tips-for-defining-prompt-files):

1. ✅ **Clearly describe** what the prompt should accomplish and expected output format
2. ✅ **Provide examples** of expected input and output to guide AI responses
3. ✅ **Use Markdown links** to reference custom instructions rather than duplicating guidelines
4. ✅ **Leverage variables** like `${selection}` and input variables for flexibility
5. ✅ **Test with editor play button** to refine prompts iteratively

### Enterprise Best Practices

**Keep Prompts Thin**:

- Target: 10-50 lines for most prompts
- Focus: User-facing task description only
- Delegate: Reference agents for complex orchestration
- Example: APR prompt lists sections, planner agent handles research/creation

**Reference, Don't Duplicate**:

```markdown
<!-- ❌ Bad: Duplicating guidance -->

## SOLID Principles

- Single Responsibility: Each class one job
- Open/Closed: Open for extension
  [100+ lines duplicated from development-guide.md]

<!-- ✅ Good: Reference knowledge base -->

## SOLID Principles

Review code against [SOLID principles](../../../knowledge-base/codebase/development-guide.md#solid-principles).
```

**Provide Context Guidance**:

```markdown
<!-- ✅ Good: Help users understand what to provide -->

argument-hint: Describe the feature goal, user needs, and key constraints
```

**Use Argument Hints**:

- Shows in chat input field
- Guides users on what information to provide
- Makes prompts more discoverable

**Make Prompts Discoverable**:

- Use `chat.promptFilesRecommendations` setting to show prompts when starting new chat
- Clear descriptions help users understand when to use each prompt
- Organize prompts by workflow phase

---

## Current State in This Project

### Existing Prompt Files

Located in `.github/prompts/`:

**1. apr.prompt.md (21 lines)** ✅ Optimal

- **Purpose**: Generate APR documents
- **Invocation**: `/apr`
- **Agent**: `planner`
- **Tool-Set**: `planner` (search, fetch, read_file, edit)
- **Sections**: Lists 9 APR sections (Overview, Goals, Scope, Features, UX, Architecture, Risks, Validation, Questions)
- **Reference**: `work-items/_template/plan/apr.md`

**2. retro.prompt.md (23 lines)** ✅ Optimal

- **Purpose**: Conduct feature retrospectives
- **Invocation**: `/retro`
- **Agent**: `retro`
- **Tool-Set**: `retro` (search, fetch, read_file)
- **Sections**: Lists 6 retro sections (Summary, Went Well, Painful, Learnings, Improvements, Follow-ups)
- **Facilitation**: Includes guiding questions ("What surprised you?", "What would we change?")
- **References**: `work-items/_template/retro/retrospective.md`, `knowledge-base/copilot/workflows-apr-retro.md`

**3. explain.prompt.md (11 lines)** ✅ Optimal

- **Purpose**: Explain selected code
- **Invocation**: `/explain`
- **Agent**: `ask`
- **Body**: Simple "Explain the selected code. Include: What it does, Key dependencies"
- **Use Case**: Quick utility for code understanding

### Tool-Sets Configuration

Located in `.github/tool-sets.jsonc`:

```json
{
  "planner": {
    "tools": ["search", "fetch", "read_file", "edit"],
    "description": "Author APRs and documentation",
    "icon": "note"
  },
  "retro": {
    "tools": ["search", "fetch", "read_file"],
    "description": "Review and reflect on completed work",
    "icon": "history"
  }
}
```

**Status**: Tool-sets properly configured and match prompt file metadata.

### Current Usage Status

⚠️ **Partially Inactive**: Prompts are properly configured but NOT actively used in current workflow.

**Evidence**:

- ✅ Prompts structured correctly with proper frontmatter
- ✅ Tool-sets configured and referenced
- ✅ Agents exist and match prompt references
- ❌ No slash command invocations found in codebase
- ❌ Current workflow uses agents directly via mode dropdown
- ❌ No documentation of slash command usage in README

**Why Not Active**:

- Workflow relies on agent mode switching (dropdown in chat view)
- Agents provide same functionality through persistent mode
- Team hasn't documented or promoted slash command usage

**To Activate**:

1. Add "Available Slash Commands" section to README
2. Document prompt usage in onboarding guide
3. Show examples: `/apr describe user authentication feature`
4. Configure `chat.promptFilesRecommendations` to show prompts in new chats

---

## Potential Future Prompts

Based on current workflows, these prompts would be valuable:

### Development Workflow Prompts

**1. /test** - Generate Test Plan

```markdown
---
name: test
description: Generate test plan for selected code
argument-hint: Reference the code to test
agent: tester
tool-set: tester
---

Generate test plan following TDD principles:

- List test cases
- Gherkin scenarios
- Coverage targets (70%+ per layer)

Reference: [TDD Guide](../../../knowledge-base/tdd/README.md)
```

**2. /review** - Code Review

```markdown
---
name: review
description: Review code against SOLID principles and standards
argument-hint: Select code to review or reference file
agent: ask
tools: [search, read_file]
---

Review ${selection} against:

- SOLID principles
- TypeScript best practices
- Testing coverage

Reference: [Development Guide](../../../knowledge-base/codebase/development-guide.md)
```

**3. /refactor** - Apply Refactoring Patterns

```markdown
---
name: refactor
description: Suggest refactoring improvements
argument-hint: Select code to refactor
agent: edit
tools: [search, read_file, edit]
---

Suggest refactoring for ${selection}:

- Extract duplicated code
- Apply design patterns
- Improve naming and structure

Reference: [Refactor Instructions](../../instructions/refactor.instructions.md)
```

**4. /debug** - Troubleshoot with TDD

```markdown
---
name: debug
description: Troubleshoot failing tests using TDD cycle
argument-hint: Reference failing test or error message
agent: developer
tool-set: developer
---

Analyze failure and apply TDD RED-GREEN-REFACTOR:

1. Understand why test fails (RED)
2. Minimal fix to pass (GREEN)
3. Refactor while maintaining GREEN

Reference: [TDD Guide](../../../knowledge-base/tdd/README.md#red-green-refactor)
```

**5. /adr** - Create Architecture Decision Record

```markdown
---
name: adr
description: Create ADR for architectural decision
argument-hint: Describe the decision and alternatives considered
agent: architect
tool-set: researcher
---

Create ADR following structure:

- Context (problem, constraints)
- Decision (what we're doing)
- Rationale (why this over alternatives)
- Consequences (trade-offs, risks)

Reference: [ADR Template](../../../work-items/_template/architecture/adr-template.md)
```

---

## Activation Strategy (Future)

When ready to activate prompts in the workflow:

### Phase 1: Documentation (1-2 hours)

1. **Update README.md** with "Available Slash Commands" section
2. **Document usage examples** for each prompt
3. **Add to onboarding guide** for new team members
4. **Create cheat sheet** in `knowledge-base/copilot/prompts/quick-reference.md`

### Phase 2: Team Training (1 week)

1. **Demo session** showing `/apr`, `/retro`, `/explain` usage
2. **Update workflow docs** to mention slash commands as alternative to agent mode
3. **Add prompt recommendations** via VS Code settings
4. **Collect feedback** on which prompts are valuable

### Phase 3: Expansion (Ongoing)

1. **Create additional prompts** based on Phase 2 feedback
2. **Iterate on existing prompts** to improve clarity
3. **Document patterns** for writing effective prompts
4. **Share across projects** for team standardization

### Phase 4: Optimization (Continuous)

1. **Monitor usage patterns** - which prompts are invoked most
2. **Refine argument hints** based on user confusion
3. **Update references** as KB articles evolve
4. **Deprecate unused prompts** to reduce clutter

---

## Integration with Agents

### Current Pattern: Prompts Reference Agents

**Best Practice**: Prompts are entry points, agents are orchestration.

```
User types: /apr describe authentication feature
     ↓
VS Code invokes: apr.prompt.md
     ↓
Prompt specifies: agent=planner
     ↓
Planner agent executes: planner.agent.md workflow
     ↓
Agent delivers: APR document in work-items/
```

**What Stays in Agents**:

- Multi-step workflows (Step 1, Step 2, Step 3...)
- Decision trees (if X then Y, else Z)
- Verification checklists (deliverables complete before handoff)
- Handoff criteria (when to pass to next agent)
- Complex orchestration (research → plan → create → validate)

**What Goes in Prompts**:

- User-facing task description ("Generate APR with these sections")
- Argument hints ("Describe feature goal, user needs, constraints")
- Expected output format ("Include Overview, Goals, Scope...")
- References to templates and guidelines
- Simple invocation pattern

### Tool Priority Order

When prompt specifies tools AND agent specifies tools:

1. **Tools in prompt file** (if specified) - highest priority
2. **Tools from tool-set** referenced in prompt (if specified)
3. **Tools from agent** referenced in prompt (if specified)
4. **Default tools for agent** - lowest priority

**Example**:

```markdown
---
agent: planner
tool-set: researcher # Uses researcher tools, not planner's default
tools: [fetch, search] # Overrides tool-set, uses only these
---
```

---

## VS Code Settings for Prompts

### Enable Prompt Recommendations

Add to `.vscode/settings.json`:

```json
{
  "chat.promptFilesRecommendations": ["apr", "retro", "explain"]
}
```

**Effect**: Shows recommended prompts when starting new chat session.

### Configure Prompt Locations

```json
{
  "chat.promptFilesLocations": [
    ".github/prompts",
    "~/.vscode/prompts" // User profile prompts
  ]
}
```

**Default**: VS Code looks in `.github/prompts` for workspace prompts.

### Sync User Prompts

Enable Settings Sync for prompts:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Settings Sync: Configure"
3. Select "Prompts and Instructions"
4. User profile prompts sync across devices

---

## Testing and Iteration

### Quick Testing Workflow

1. **Edit prompt file** in `.github/prompts/`
2. **Open prompt in editor**
3. **Click play button** in editor title bar
4. **Choose "Run in new chat session"**
5. **Evaluate output** and refine prompt
6. **Repeat** until desired results

**Tip**: Use play button for rapid iteration without switching to chat view.

### Testing Checklist

Before committing new prompt:

- [ ] Frontmatter is valid YAML
- [ ] `name` field matches intended slash command
- [ ] `description` clearly explains prompt purpose
- [ ] `argument-hint` guides users on what to provide
- [ ] `agent` and `tool-set` references are correct
- [ ] Body references use relative paths
- [ ] Variables (`${file}`, `${selection}`) are valid
- [ ] Tool references (`#tool:name`) are available
- [ ] Tested via play button with sample input
- [ ] Output matches expected format

---

## Examples from Community

### Awesome Copilot Repository

Microsoft maintains a collection of community prompts:
https://github.com/github/awesome-copilot

**Common patterns observed**:

1. **Code generation prompts** - Create React components, API endpoints
2. **Review prompts** - Security review, performance review, accessibility audit
3. **Documentation prompts** - Generate JSDoc, README sections, API docs
4. **Testing prompts** - Generate test cases, mock data, test fixtures
5. **Refactoring prompts** - Extract functions, apply patterns, optimize code

### Example: Security Review Prompt

```markdown
---
name: security
description: Perform a security review of selected code
argument-hint: Select code to review or reference REST API
agent: ask
tools: [search, read_file]
---

Perform security review of ${selection} or ${input:apiEndpoint}:

Check for:

- SQL injection vulnerabilities
- XSS attack vectors
- Authentication/authorization flaws
- Sensitive data exposure
- CSRF protection
- Rate limiting

Reference: [OWASP Top 10](https://owasp.org/www-project-top-ten/)
```

---

## Related Resources

### Official Documentation

- **Prompt Files Guide**: https://code.visualstudio.com/docs/copilot/customization/prompt-files
- **Copilot Chat**: https://code.visualstudio.com/docs/copilot/copilot-chat
- **Workspace Context**: https://code.visualstudio.com/docs/copilot/workspace-context
- **Custom Agents**: https://code.visualstudio.com/docs/copilot/customization/custom-agents
- **Custom Instructions**: https://code.visualstudio.com/docs/copilot/customization/custom-instructions

### Internal Documentation

- **Agent Architecture Best Practices**: [../agent-architecture-best-practices.md](../agent-architecture-best-practices.md)
- **Workflows (APR & Retro)**: [../workflows-apr-retro.md](../workflows-apr-retro.md)
- **Agent Skills**: [../agent-skills.md](../agent-skills.md)
- **Tool Sets**: [../tool-sets.jsonc](../tool-sets.jsonc)

### Community Resources

- **Awesome Copilot**: https://github.com/github/awesome-copilot
- **VS Code Copilot Series**: https://www.youtube.com/playlist?list=PLj6YeMhvp2S5_hvBl2SE-7YCHYlLQ0bPt

---

## Summary

### Key Takeaways

1. **Prompts are user-facing entry points** - Invoked via slash commands (`/apr`, `/retro`)
2. **Agents are orchestration layer** - Complex workflows with decision points
3. **Prompts reference agents** - Best practice pattern for separation of concerns
4. **Keep prompts thin** (10-50 lines) - Delegate complex logic to agents
5. **Reference, don't duplicate** - Link to KB articles and templates
6. **Currently configured but inactive** - Ready for activation when team decides

### Current Status

**Implementation**: ✅ Complete and well-structured  
**Documentation**: ✅ Now documented in knowledge base  
**Activation**: ⏸️ On hold - team using agent mode dropdown for now  
**Future Decision**: Activate when team ready to promote slash command workflow

### Next Steps (When Ready)

1. Document slash command usage in README
2. Train team on prompt invocation patterns
3. Create 3-4 additional task-specific prompts
4. Enable prompt recommendations in VS Code settings
5. Collect feedback and iterate on prompt library

**No immediate action required** - documentation preserved for future activation.
