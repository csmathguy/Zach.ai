# GitHub Copilot Agent Architecture Best Practices

## Overview

This document synthesizes best practices for creating GitHub Copilot agents, instruction files, prompts, and knowledge base content. It establishes clear patterns for maintaining a clean hierarchy where agents are small workflow orchestrators, instructions provide technology integration, and the knowledge base contains comprehensive reference material.

**Official Resources**:

- [VS Code Chat Participant API](https://code.visualstudio.com/api/extension-guides/chat)
- [Diátaxis Documentation Framework](https://diataxis.fr/)
- [Patterns.dev](https://www.patterns.dev/)

**Philosophy**: Separation of concerns - Agents own workflow, instructions own integration, knowledge base owns reference.

---

## Core Principles

### 1. **Single Responsibility Principle for Agents**

Each agent should have ONE clear purpose:

```
✅ GOOD: planner agent - Creates APRs with requirements and success metrics
✅ GOOD: architect agent - Designs technical solutions with ADRs and contracts
✅ GOOD: developer agent - Implements features following TDD workflow

❌ BAD: super-agent - Plans, designs, implements, tests, deploys everything
❌ BAD: overlapping agents - Multiple agents doing similar work
```

**Key Insight from VS Code API**: "Chat participants should not be purely question-answering bots." They should orchestrate workflows and integrate with VS Code APIs, not duplicate knowledge.

### 2. **Documentation Hierarchy (Inverted Pyramid)**

```
┌─────────────────────────────────────┐
│  AGENTS (Smallest - Workflow)      │  ← What order? When to hand off?
├─────────────────────────────────────┤
│  INSTRUCTIONS (Medium - Tech)       │  ← How to use this technology?
├─────────────────────────────────────┤
│  KNOWLEDGE BASE (Largest - Ref)     │  ← Complete reference + examples
└─────────────────────────────────────┘
```

**Agents** (50-200 lines):

- Workflow orchestration (what steps, what order)
- Decision points (when to branch)
- Handoff criteria (when done)
- References to instructions/KB (links only)

**Instructions** (100-300 lines):

- Technology-specific integration
- Quick reference commands
- Workflow integration patterns
- Links to KB for deep dive

**Knowledge Base** (400-800+ lines):

- Comprehensive reference
- Code examples and patterns
- Setup instructions
- Troubleshooting
- Best practices

### 3. **Diátaxis Framework for Knowledge Base**

**Source**: https://diataxis.fr/

Organize KB articles using four quadrants:

```
                    Practical Steps
                          │
            ┌─────────────┼─────────────┐
            │             │             │
  Learning  │  TUTORIALS  │  HOW-TO     │  Problem-solving
            │             │  GUIDES     │
            │             │             │
            ├─────────────┼─────────────┤
            │             │             │
            │ EXPLANATION │ REFERENCE   │
            │             │             │
            └─────────────┼─────────────┘
                          │
                    Theory/Information
```

**Tutorials** - Learning-oriented (first-time users)

- Step-by-step lessons
- Learning by doing
- Get started guides

**How-To Guides** - Task-oriented (experienced users)

- Solve specific problems
- Series of steps
- Practical examples

**Reference** - Information-oriented (lookup)

- Technical descriptions
- API documentation
- Accurate and complete

**Explanation** - Understanding-oriented (background)

- Why things work this way
- Design decisions
- Conceptual guides

**Application to Our KB**:

- **Tutorials**: "Getting Started with TDD", "First Feature with APR-ADR Flow"
- **How-To**: "How to Write Gherkin Scenarios", "How to Create an ADR"
- **Reference**: Jest API, TypeScript strict mode rules, SOLID principles
- **Explanation**: "Why TDD First?", "Why Repository Pattern?", "Why Layered Architecture?"

---

## Agent Design Patterns

### Pattern 1: Workflow Orchestrator (Not Knowledge Repository)

**❌ BAD - Agent contains knowledge**:

````markdown
## TypeScript Best Practices

TypeScript is a typed superset of JavaScript. Use strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```
````

[50 more lines of TypeScript guidance...]

````

**✅ GOOD - Agent references knowledge**:

```markdown
## Step 2: Verify TypeScript Configuration

**Reference**: [TypeScript Instructions](../instructions/typescript.instructions.md)

1. Check tsconfig.json exists in both frontend/ and backend/
2. Run `npm run typecheck` to verify no errors
3. If errors exist, fix before proceeding

**Deep Dive**: See [TypeScript KB](../../knowledge-base/typescript/README.md) for complete setup guide.
````

### Pattern 2: Clear Handoff Contracts

**From VS Code API**: "Chat participants have access to the message history of the current chat session."

Each agent should produce explicit deliverables for the next agent:

```markdown
## Handoff Checklist

Before handing off to tester agent:

- [ ] APR approved and saved in work-items/<branch>/plan/apr.md
- [ ] Contracts documented in work-items/<branch>/architecture/contracts.md
- [ ] ADRs created with adr-promote.ps1 for all major decisions
- [ ] Integration points documented in work-items/<branch>/architecture/integration.md
- [ ] Architect retrospective documented in work-items/<branch>/retro/retrospective.md

**Deliverables for Tester**:

1. Repository interfaces with method signatures
2. Domain models with properties and invariants
3. DTOs with field definitions
4. Error contracts (when exceptions thrown)
5. Contract guarantees (returns null vs throws)
```

### Pattern 3: Avoid Circular References

**Reference Flow** (one direction only):

```
Agent → Instructions → Knowledge Base
  ↑         ↑              ↑
  │         │              │
  └─────────┴──────────────┘
       NO REVERSE FLOW
```

**Rules**:

- ✅ Agents CAN reference instructions and KB
- ✅ Instructions CAN reference KB
- ✅ KB articles CAN reference each other (peer-to-peer)
- ❌ KB CANNOT reference agents or instructions
- ❌ Instructions CANNOT reference agents
- ❌ Agents CANNOT reference each other (use handoffs)

### Pattern 4: Detection and Routing (VS Code API)

**Source**: VS Code Chat Participant API - "Implement participant detection"

Agents should have clear descriptions and examples for routing:

```markdown
---
name: architect
description: Design technical solutions with ADRs, contracts, and architecture diagrams
disambiguation:
  - category: architecture
    description: User needs technical design, architecture decisions, or contract definitions
    examples:
      - 'Design the repository pattern for user management'
      - 'What database should we use for this feature?'
      - 'Create ADR for ORM selection'
---
```

**Best Practices**:

- Be specific (avoid generic terminology)
- Use examples (representative queries)
- Use natural language (as if explaining to a user)
- Test detection (verify no conflicts with built-in participants)

---

## Instruction File Patterns

### Pattern 1: Technology Integration (Not Tutorials)

**❌ BAD - Instruction duplicates KB**:

````markdown
# Jest Testing Instructions

Jest is a JavaScript testing framework. Install it:

```bash
npm install --save-dev jest @types/jest ts-jest
```
````

Configuration:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```

[200 more lines of Jest setup, patterns, troubleshooting...]

````

**✅ GOOD - Instruction focuses on workflow integration**:

```markdown
# Jest Testing Instructions

**Apply to**: `**/*.test.{ts,tsx}`
**Reference**: [Jest KB](../../knowledge-base/jest/README.md) (470+ lines)

## Core Testing Principles

- Test behavior, not implementation
- AAA pattern (Arrange, Act, Assert)
- One assertion per test when possible

## Quick Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage
````

## Workflow Integration

- Write tests FIRST (RED phase of TDD)
- Run tests continuously during GREEN phase
- See [TDD Instructions](tdd.instructions.md) for complete workflow

**Deep Dive**: [Jest KB](../../knowledge-base/jest/README.md) for setup, mocking, coverage, troubleshooting.

````

### Pattern 2: ApplyTo Patterns (File Targeting)

**From VS Code Extension API**: Use glob patterns to target specific files

```markdown
**Apply to**: **/*.{ts,tsx}     # TypeScript files
**Apply to**: **/*.test.{ts,tsx} # Test files
**Apply to**: **/*.spec.ts       # Spec files
**Apply to**: e2e/**/*.ts        # E2E tests
````

### Pattern 3: Quick Reference (Not Comprehensive)

**Instruction Purpose**: Quick lookup during workflow, not teaching

```markdown
## Quick Reference

### Essential Commands

- `npm run validate` - Run all checks before commit
- `npm run typecheck` - TypeScript compilation check
- `npm run lint:fix` - Auto-fix ESLint issues

### Common Patterns

- Import from @jest/globals (not standard jest)
- Use AAA pattern (Arrange, Act, Assert)
- Mock with `jest.fn()` not `jest.mock()` for inline mocks

**For Examples**: See [Jest KB Examples](../../knowledge-base/jest/README.md#common-patterns)
```

---

## Knowledge Base Organization

### Structure Pattern (Technology-Based)

```
knowledge-base/
├── README.md (index with links)
├── codebase/           # This project's docs
│   ├── development-guide.md (SOLID, DRY, KISS)
│   ├── structure.md (repository organization)
│   └── validation.md (quality checks)
├── <technology>/       # Per-technology folders
│   └── README.md (comprehensive 400-800+ lines)
└── <framework>/
    └── README.md
```

### Article Structure (Diátaxis-Inspired)

Each KB article should include:

```markdown
# Technology Name

## Overview (What, Why, When)

- What is this technology?
- Why do we use it?
- When is it appropriate?

## Quick Reference (How-To - Task-Oriented)

- Essential commands
- Common patterns
- Quick lookups

## Setup Instructions (Tutorial - Learning-Oriented)

- Installation steps
- Configuration
- First example

## Best Practices (Explanation - Understanding-Oriented)

- Enterprise patterns
- Do's and don'ts
- Design principles

## Common Patterns (Reference - Information-Oriented)

- Code examples
- API documentation
- Configuration options

## Troubleshooting (How-To - Problem-Solving)

- Common issues
- Solutions
- Debug techniques

## References (External Links)

- Official documentation
- Community resources
- Related articles
```

### Minimum Standards

**For Major Technologies** (Jest, React, TypeScript, Prisma):

- **400-800+ lines** comprehensive
- All Diátaxis quadrants covered
- Code examples with explanations
- Cross-references to related KB articles
- External references to official docs

**For Minor Tools** (smaller utilities):

- **200-400 lines** sufficient
- Focus on integration with our workflow
- Quick reference + troubleshooting
- Links to official docs for deep dive

---

## Anti-Patterns to Avoid

### 1. ❌ Fat Agents (Too Much Knowledge)

**Problem**: Agent contains comprehensive tutorials, code examples, troubleshooting

**Solution**: Extract to KB, add reference link

### 2. ❌ Duplicated Content

**Problem**: Same TypeScript setup instructions in agent, instruction, and KB

**Solution**:

- KB: Complete setup guide (400+ lines)
- Instruction: Quick reference (50 lines) + link to KB
- Agent: Workflow step (5 lines) + link to instruction

### 3. ❌ Missing Separation

**Problem**: Agent does architect work, architect does developer work

**Solution**: Clear responsibility boundaries with handoff contracts

### 4. ❌ Circular References

**Problem**: KB references agents, instructions reference agents

**Solution**: One-way reference flow (Agent → Instruction → KB)

### 5. ❌ Generic Agent Names

**Problem**: Agent named "helper" or "assistant"

**Solution**: Specific names indicating single responsibility: "planner", "architect", "developer"

### 6. ❌ Instruction Files Teach Technology

**Problem**: Instruction file has complete Jest tutorial with setup, examples, patterns

**Solution**: Instruction has workflow integration + link to KB for comprehensive guide

### 7. ❌ Knowledge Base Has Workflow

**Problem**: KB article says "First, run planner agent, then architect agent, then..."

**Solution**: KB article focuses on technology reference, agents own workflow

---

## Implementation Checklist

### When Creating a New Agent

- [ ] **Single responsibility** - What is this agent's ONE purpose?
- [ ] **Clear handoff** - What deliverables does it produce?
- [ ] **Workflow only** - Does it orchestrate steps without teaching?
- [ ] **References KB/instructions** - Links instead of duplicating?
- [ ] **Handoff criteria** - When is it done?
- [ ] **Detection examples** - Natural language routing examples?

### When Creating a New Instruction File

- [ ] **ApplyTo pattern** - Which files does this apply to?
- [ ] **Quick reference** - Commands, patterns, lookups?
- [ ] **Workflow integration** - How does this fit in agent workflow?
- [ ] **KB links** - References to comprehensive KB articles?
- [ ] **Not a tutorial** - Avoids teaching basics?
- [ ] **Technology-specific** - Focused on one tech/pattern?

### When Creating a New KB Article

- [ ] **400-800+ lines** for major technologies (200-400 for minor)
- [ ] **Diátaxis quadrants** - Tutorial, How-To, Reference, Explanation?
- [ ] **Code examples** - Real examples with explanations?
- [ ] **Cross-references** - Links to related KB articles?
- [ ] **External references** - Links to official docs?
- [ ] **Comprehensive** - Complete treatment of topic?
- [ ] **No workflow** - Avoids agent-specific workflow steps?

### When Refining Existing System

- [ ] **Duplication check** - Same content in multiple places?
- [ ] **Hierarchy check** - Agents small, instructions medium, KB large?
- [ ] **Reference flow** - One-way (Agent → Instruction → KB)?
- [ ] **Separation check** - Each agent has single responsibility?
- [ ] **KB completeness** - All technologies documented?
- [ ] **Link validity** - All cross-references work?

---

## Metrics for Success

### Agent Quality

- **Size**: 50-200 lines (workflow only)
- **Clarity**: Single purpose clearly stated
- **Handoffs**: Explicit deliverables listed
- **References**: Links to instructions/KB, no duplication

### Instruction Quality

- **Size**: 100-300 lines (integration + quick reference)
- **Applicability**: Clear ApplyTo patterns
- **Integration**: Workflow-specific guidance
- **References**: Links to KB for comprehensive guide

### Knowledge Base Quality

- **Size**: 400-800+ lines for major tech (comprehensive)
- **Completeness**: All Diátaxis quadrants covered
- **Examples**: Real code examples with explanations
- **Cross-refs**: Links to related articles
- **Maintenance**: Updated when technology evolves

### System Quality

- **No Duplication**: Each concept documented once (in KB)
- **Clear Hierarchy**: Agents → Instructions → KB
- **One-Way Flow**: References flow down, never up
- **Separation**: Each agent has distinct responsibility
- **Completeness**: All technologies have KB articles

---

## Migration Strategy (Existing System)

### Step 1: Identify Duplication

Create matrix:

| Content      | Agent File | Instructions | Knowledge Base | Recommendation                                        |
| ------------ | ---------- | ------------ | -------------- | ----------------------------------------------------- |
| Jest Setup   | ✅ Found   | ✅ Found     | ✅ Found       | Keep in KB only, link from others                     |
| TDD Workflow | ✅ Found   | ✅ Found     | ✅ Found       | Keep in KB, high-level in instruction, steps in agent |

### Step 2: Extract to Knowledge Base

For each duplicated section:

1. Create/update KB article with comprehensive treatment
2. Verify 400+ line standard for major technologies
3. Include all Diátaxis quadrants

### Step 3: Replace with References

In agent files:

```markdown
# Before (50 lines of Jest setup)

[Duplicated content removed]

# After (3 lines with reference)

**Reference**: [Testing Instructions](../instructions/testing.instructions.md)
See instructions for Jest setup and workflow integration.
```

In instruction files:

```markdown
# Before (200 lines of Jest comprehensive guide)

[Duplicated content removed]

# After (50 lines quick reference + link)

## Quick Reference

[Commands, patterns, common tasks]

**Deep Dive**: [Jest KB](../../knowledge-base/jest/README.md) for complete guide.
```

### Step 4: Validate Hierarchy

Run checks:

- ✅ Agents 50-200 lines (workflow)
- ✅ Instructions 100-300 lines (integration)
- ✅ KB 400-800+ lines (comprehensive)
- ✅ No duplication (each concept once)
- ✅ One-way references (Agent → Instruction → KB)

---

## Example: Complete Hierarchy

### Agent File (75 lines)

```markdown
---
name: developer
description: Implement features using TDD following architecture and test plans
---

# Developer Agent - TDD Implementation

**Purpose**: Implement features following Test-Driven Development

**Reference**: [TDD Instructions](../instructions/tdd.instructions.md) | [Development Guide](../../knowledge-base/codebase/development-guide.md)

## Step 1: Review Architecture

**Reference**: [Architecture Artifacts](architecture.md)

1. Read ADRs in work-items/<branch>/architecture/
2. Review contracts in work-items/<branch>/architecture/contracts.md
3. Understand layer structure

## Step 2: Review Test Plan

**Reference**: [Test Plan](testing.md)

1. Read test-plan.md in work-items/<branch>/tests/
2. Identify test cases to implement
3. Understand coverage targets

## Step 3: Implement Tests (RED)

**Reference**: [TDD Instructions](../instructions/tdd.instructions.md#phase-1-red)

1. Write test FIRST for one feature
2. Run test → should FAIL with assertion error
3. Verify RED (not compilation error)

## Step 4: Implement Feature (GREEN)

**Reference**: [TDD Instructions](../instructions/tdd.instructions.md#phase-2-green)

1. Write minimum code to pass test
2. Run test → should PASS
3. Verify GREEN maintained

## Step 5: Refactor (MAINTAIN GREEN)

**Reference**: [Refactor Instructions](../instructions/refactor.instructions.md)

1. Clean up code while maintaining GREEN
2. Apply SOLID principles
3. Remove dead code

## Handoff Checklist

- [ ] All tests passing
- [ ] Coverage targets met (70%+)
- [ ] Zero TypeScript errors
- [ ] `npm run validate` passes
- [ ] Retrospective documented

**Deep Dive**: [TDD KB](../../knowledge-base/tdd/README.md) for comprehensive TDD guide.
```

### Instruction File (150 lines)

````markdown
# Test-Driven Development (TDD) Instructions

**Apply to**: All test and implementation files
**Reference**: [TDD KB](../../knowledge-base/tdd/README.md) (800+ lines)

## Core Principles

- Tests come FIRST. Always.
- RED → GREEN → REFACTOR cycle
- Test behavior, not implementation

## Phase 1: RED - Write Failing Test

**CRITICAL**: RED means:

- ✅ Tests COMPILE and RUN successfully
- ✅ Tests FAIL with ASSERTION ERRORS
- ❌ NOT "Cannot find module" or TypeScript errors

**Workflow**:

1. Create stub to allow compilation
2. Write test showing expected behavior
3. Run test → assertion failure (PROPER RED)

## Phase 2: GREEN - Make It Pass

Write minimum code to pass test. Don't optimize yet.

## Phase 3: REFACTOR - Improve Code

**CRITICAL**: Don't skip this phase - most common TDD failure mode.

**Reference**: [Refactor Instructions](refactor.instructions.md)

Clean up while maintaining GREEN:

- Extract duplicated code
- Rename for clarity
- Apply SOLID principles

## Quick Commands

```bash
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage
```
````

**Deep Dive**: [TDD KB](../../knowledge-base/tdd/README.md) for complete workflow, patterns, and examples.

````

### Knowledge Base Article (800+ lines)

```markdown
# Test-Driven Development (TDD) Knowledge Base

## Overview (Explanation - Understanding)

Test-Driven Development is a technique where you write tests BEFORE functional code...

**Philosophy**: Tests drive design. You think about interface first...

## Quick Reference (How-To - Task)

### Essential Commands
[Commands here]

### Common Patterns
[Patterns here]

## Complete TDD Cycle (Tutorial - Learning)

### Step-by-Step Example

[800 lines of comprehensive guide with examples, patterns, antipatterns, etc.]

## Advanced Patterns (Reference - Information)

[Code examples, API documentation, detailed patterns]

## Troubleshooting (How-To - Problem-Solving)

[Common issues and solutions]

## References

- Kent Beck's TDD book
- Martin Fowler on TDD
- [Related KB articles]
````

---

## Continuous Improvement

### Regular Reviews (Quarterly)

- **Duplication Audit**: Search for repeated content
- **Size Audit**: Check agents <200 lines, KB >400 lines
- **Link Audit**: Verify all references work
- **Separation Audit**: Each agent has single responsibility

### After Each Feature (Refiner Agent)

- **Extract New Patterns**: Did we discover new patterns? → KB
- **Refine Workflow**: Did agent workflow work? → Adjust agent
- **Update References**: Did technology change? → Update KB

### Metrics to Track

- **Duplication Count**: Number of topics documented in multiple places (target: 0)
- **Agent Size**: Average lines per agent (target: 50-200)
- **KB Coverage**: Technologies used vs documented (target: 100%)
- **Reference Validity**: Broken links (target: 0)

---

## Summary

### The Golden Rules

1. **Agents are small** (50-200 lines) - Workflow orchestration only
2. **Instructions are medium** (100-300 lines) - Technology integration
3. **KB is comprehensive** (400-800+ lines) - Complete reference
4. **References flow down** - Agent → Instruction → KB (never reverse)
5. **Single responsibility** - Each agent has ONE clear purpose
6. **No duplication** - Each concept documented once (in KB)
7. **Diátaxis structure** - KB organized by Tutorial, How-To, Reference, Explanation

### Quick Decision Tree

**Where should this content go?**

```
Is it workflow steps (what order, when to do)?
  YES → Agent file

Is it technology integration (how to use X in our workflow)?
  YES → Instruction file

Is it comprehensive reference (complete guide to technology)?
  YES → Knowledge Base

Is it duplicated in multiple places?
  YES → Move to KB, reference from others
```

### Success Criteria

✅ **Agents are concise** - Focus on workflow, reference KB
✅ **Instructions are focused** - Technology integration, link to KB
✅ **KB is comprehensive** - 400+ lines per major technology
✅ **No duplication** - Same content not repeated
✅ **Clear separation** - Each agent has distinct responsibility
✅ **One-way references** - Agent → Instruction → KB
✅ **Complete coverage** - All technologies have KB articles

---

## Related Documentation

- [VS Code Chat Participant API](https://code.visualstudio.com/api/extension-guides/chat)
- [Diátaxis Framework](https://diataxis.fr/)
- [Patterns.dev](https://www.patterns.dev/)
- [knowledge-base/codebase/development-guide.md](../codebase/development-guide.md)
- [knowledge-base/codebase/structure.md](../codebase/structure.md)
