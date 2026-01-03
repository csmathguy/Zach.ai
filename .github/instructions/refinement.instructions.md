# Agent Refinement Instructions

**Apply to**: Refiner agent workflow after feature completion  
**Purpose**: Guide systematic analysis and cleanup of agent system based on retrospective learnings

---

## Core Refinement Principles

### 1. Separation of Concerns

**Three-tier documentation system**:

```
┌─────────────────────────────────┐
│  AGENT (Workflow)               │  What order to do things
│  - Process steps                │  When to take action
│  - Decision points              │  Where to hand off
│  - References to details        │
└────────┬────────────────────────┘
         │ references
         ▼
┌─────────────────────────────────┐
│  INSTRUCTIONS (Integration)     │  How to work with technology
│  - Technology-specific          │  Patterns for this project
│  - Apply to file patterns       │  Workflow integration
│  - Brief, actionable            │
└────────┬────────────────────────┘
         │ references
         ▼
┌─────────────────────────────────┐
│  KNOWLEDGE BASE (Reference)     │  Deep technical knowledge
│  - Comprehensive articles       │  400-600+ lines per tech
│  - Setup, patterns, examples    │  Troubleshooting
│  - Long-term reference          │
└─────────────────────────────────┘
```

**Golden Rule**: Content flows DOWN, references flow UP. Never reverse this hierarchy.

### 2. Duplication is the Enemy

**Signs of duplication**:

- Same setup instructions in agent + instructions + KB
- Same code examples in multiple files
- Same troubleshooting in multiple places
- Same best practices repeated

**Fix duplication**:

1. Identify canonical location (usually KB)
2. Remove from non-canonical locations
3. Replace with reference link
4. Keep only workflow-specific context in agent

### 3. Links Over Content

**Bad** (duplicating content):

```markdown
## TypeScript Best Practices

TypeScript is a typed superset of JavaScript...
[50 lines of TypeScript explanation]
```

**Good** (referencing authoritative source):

```markdown
## TypeScript Best Practices

**Reference**: [TypeScript Instructions](../instructions/typescript.instructions.md)  
**Deep Dive**: [knowledge-base/typescript/README.md](../../knowledge-base/typescript/README.md)

Follow TypeScript strict mode. Run `npm run typecheck` before committing.
```

### 4. Workflow Over Tutorial

**Agents guide process, not teach technology**.

**Keep in agent**:

- ✅ "Step 1: Verify file locations exist"
- ✅ "Run `npm test` continuously during GREEN phase"
- ✅ "Create feature branch immediately after APR approval"

**Remove from agent** (→ KB):

- ❌ "TypeScript is a superset of JavaScript that..."
- ❌ "Jest is a testing framework that..."
- ❌ "SOLID principles are..."

---

## Refinement Process

### Phase 1: Retrospective Analysis

**Read all retrospective documents chronologically**:

```bash
# List all retrospectives
ls work-items/<branch>/retro/*.md

# Read in order
# Look for patterns:
# - Repeated confusion (missing guidance)
# - Repeated success (patterns to preserve)
# - Action items (workflow improvements needed)
```

**Create analysis document**:

- What confused agents repeatedly?
- What workflow steps were skipped or unclear?
- What knowledge was missing from KB?
- What worked exceptionally well?

### Phase 2: Duplication Detection

**Automated search for common duplications**:

```bash
# Search for duplicated TypeScript guidance
grep -r "TypeScript strict mode" .github/agents/ .github/instructions/ knowledge-base/

# Search for duplicated Jest patterns
grep -r "AAA pattern" .github/agents/ .github/instructions/ knowledge-base/

# Search for duplicated SOLID principles
grep -r "Single Responsibility" .github/agents/ .github/instructions/ knowledge-base/
```

**Manual review**:

- Read each agent file - note sections over 20 lines
- Read each instruction file - note tutorial-style content
- Compare to KB articles - identify redundancy

**Create duplication matrix**:

| Content          | Agent                 | Instructions                  | KB                      | Action                                    |
| ---------------- | --------------------- | ----------------------------- | ----------------------- | ----------------------------------------- |
| TypeScript setup | ✅ developer.agent.md | ✅ typescript.instructions.md | ✅ typescript/README.md | Keep in KB only, link from others         |
| Jest AAA pattern | ✅ developer.agent.md | ✅ testing.instructions.md    | ✅ jest/README.md       | Keep in KB, brief mention in instructions |

### Phase 3: Best Practices Research

**Before making changes, research current best practices**.

**Search queries**:

1. "GitHub Copilot agent management best practices"
2. "AI agent workflow design patterns"
3. "Technical documentation structure software engineering"
4. "Agent orchestration handoff patterns"

**Focus areas**:

- How do successful agent systems organize workflows?
- What belongs in agent files vs separate documentation?
- How are handoffs structured for clarity?
- How is context preserved across agents?

**Document findings** in `work-items/<branch>/refine/research-findings.md`:

- Key patterns discovered
- Best practices to apply
- Anti-patterns to avoid
- Examples from other systems

### Phase 4: Agent File Refinement

**For each agent file**:

1. **Remove duplicated content**:
   - Technology explanations (→ KB)
   - Setup instructions (→ KB or instructions)
   - Code examples (→ KB)
   - Best practices lists (→ KB development-guide.md)

2. **Replace with references**:

   ```markdown
   **Reference**: [Link to instructions]
   **Deep Dive**: [Link to KB article]
   ```

3. **Keep workflow guidance**:
   - Step-by-step process
   - Decision points ("If X, then do Y")
   - Handoff criteria
   - Verification checklists

4. **Strengthen handoffs**:
   - List explicit deliverables
   - Add verification checklist
   - Specify context to preserve
   - Document where deliverables are stored

**Example refinement**:

```markdown
# Before (bloated agent)

## Step 3: Write Tests

Jest is a testing framework with built-in mocking...
[100 lines of Jest explanation]

To write tests, follow AAA pattern:

- Arrange: Set up test data
- Act: Execute the function
- Assert: Verify results

[50 lines of test examples]

# After (clean agent)

## Step 3: Write Tests

**Reference**: [TDD Instructions](../instructions/tdd.instructions.md)
**Testing Guide**: [knowledge-base/jest/README.md](../../knowledge-base/jest/README.md)

Follow RED-GREEN-REFACTOR cycle:

1. Write failing test (RED)
2. Implement minimum code (GREEN)
3. Refactor (maintain GREEN)

Run `npm test -- --watch` for continuous feedback.

See TDD instructions for complete workflow and testing patterns.
```

### Phase 5: Instruction File Refinement

**For each instruction file**:

1. **Remove tutorial content**:
   - "What is X" explanations (→ KB)
   - Comprehensive setup guides (→ KB)
   - Extensive examples (→ KB)

2. **Keep workflow integration**:
   - Quick reference commands
   - Patterns specific to our project
   - How instructions apply during agent work

3. **Add KB references**:
   - Link to comprehensive KB article
   - Note article length ("470+ lines")
   - Make it clear KB is the deep dive

**Example refinement**:

```markdown
# Before (tutorial-style)

# Jest Testing Instructions

## What is Jest?

Jest is a delightful JavaScript testing framework...
[200 lines of Jest tutorial]

## Setup

Install Jest with:
npm install --save-dev jest
[50 lines of setup instructions]

## Writing Tests

[100 lines of test examples]

# After (workflow-focused)

# Jest Testing Instructions

**Apply to**: `**/*.test.{ts,tsx}`
**Reference**: [knowledge-base/jest/README.md](../../knowledge-base/jest/README.md) (470+ lines comprehensive guide)

## Quick Reference

- `npm test` - Run all tests
- `npm test -- --watch` - Watch mode
- `npm test -- --coverage` - Coverage report

## Workflow Integration

- Write tests FIRST (RED phase)
- Run continuously during GREEN phase
- Address `act()` warnings immediately

## Project Patterns

- Use `@jest/globals` imports
- In-memory SQLite for integration tests
- maxWorkers: 1 for file-based databases

**Deep Dive**: See KB article for setup, configuration, mocking, troubleshooting.
```

### Phase 6: Knowledge Base Validation

**Verify KB structure**:

```
knowledge-base/
├── README.md (index with all articles)
├── codebase/
│   ├── development-guide.md (SOLID, DRY, KISS)
│   └── structure.md
└── <technology>/
    └── README.md (comprehensive 400-600+ lines)
```

**Each KB article should include**:

1. ✅ Overview (what, why, when)
2. ✅ Quick reference (commands, patterns)
3. ✅ Setup instructions
4. ✅ Best practices
5. ✅ Common patterns
6. ✅ Troubleshooting
7. ✅ References (official docs)

**Check for gaps**:

- Technologies used but not documented
- Patterns mentioned but not explained
- Questions from process logs without KB answers

**Update KB README.md**:

- Add new articles to index
- Mark comprehensive articles with ✅
- Note article length (helps agents know what's available)

---

## Common Duplication Patterns to Fix

### Pattern 1: TypeScript Guidance

**Duplicated across**:

- developer.agent.md ("Use strict mode, avoid `any`...")
- typescript.instructions.md ("TypeScript is a typed superset...")
- knowledge-base/typescript/README.md (comprehensive guide)

**Fix**:

- **Keep in KB**: Comprehensive TypeScript guide (setup, types, patterns)
- **Keep in instructions**: Brief principles, workflow integration, quick reference
- **Keep in agent**: "Follow TypeScript instructions, run typecheck before commit"

### Pattern 2: Testing Workflows

**Duplicated across**:

- developer.agent.md (TDD RED-GREEN-REFACTOR explanation)
- tdd.instructions.md (TDD principles, test-first approach)
- testing.instructions.md (Jest patterns, test structure)
- knowledge-base/tdd/README.md (800+ lines TDD guide)
- knowledge-base/jest/README.md (470+ lines Jest guide)

**Fix**:

- **Keep in KB**: Comprehensive TDD and Jest guides
- **Keep in instructions**: Workflow integration, when to use which pattern
- **Keep in agent**: "Follow TDD cycle, see TDD instructions for details"

### Pattern 3: SOLID Principles

**Duplicated across**:

- developer.agent.md (SOLID compliance checkpoints)
- typescript.instructions.md (SOLID examples)
- knowledge-base/codebase/development-guide.md (comprehensive SOLID section)

**Fix**:

- **Keep in KB**: Comprehensive SOLID explanation with examples
- **Keep in instructions**: Brief mention, link to development guide
- **Keep in agent**: "Check SOLID compliance at checkpoints, see development guide"

### Pattern 4: Git Workflow

**Duplicated across**:

- Multiple agents (planner, developer, retro)
- Instructions files
- Knowledge base

**Fix**:

- **Keep in KB**: Git workflow patterns, commit message conventions
- **Keep in agents**: When to commit (after each RED-GREEN-REFACTOR cycle, after section complete)
- **Remove**: Git tutorial content from agents

---

## Verification Checklist

Before completing refinement:

### Content Separation

- [ ] Agents contain workflow only (no tutorials)
- [ ] Instructions contain integration only (no comprehensive guides)
- [ ] Knowledge base contains comprehensive reference
- [ ] No duplication between tiers

### Link Integrity

- [ ] All agent references to instructions are valid
- [ ] All agent references to KB are valid
- [ ] All instruction references to KB are valid
- [ ] All KB cross-references are valid
- [ ] No broken links

### Workflow Continuity

- [ ] Planner can produce clear APR
- [ ] Architect receives APR, can produce ADRs/contracts
- [ ] Tester receives contracts, can produce test plan
- [ ] Developer receives test plan + ADRs, can implement
- [ ] Retro receives completed work, can analyze
- [ ] Refiner receives retrospectives, can improve system

### Knowledge Base Completeness

- [ ] All technologies used are documented
- [ ] All patterns used are captured
- [ ] Gaps from retrospectives are filled
- [ ] Articles are comprehensive (400+ lines for major topics)
- [ ] KB README.md indexes all articles

### Best Practices Applied

- [ ] Researched current best practices
- [ ] Applied patterns from research
- [ ] Avoided anti-patterns
- [ ] Documented rationale for major decisions

---

## Commit Guidelines

**Separate commits by category**:

```bash
# 1. Agent refinements
git add .github/agents/
git commit -m "refactor(agents): remove duplication, add KB references

- developer.agent.md: Removed TypeScript tutorial, added refs
- tester.agent.md: Removed Jest examples, linked testing guide
- All agents: Strengthened handoff sections

Based on O1-database-foundation retrospective analysis.
Reduces agent file size by 40%, improves maintainability."

# 2. Instruction refinements
git add .github/instructions/
git commit -m "refactor(instructions): streamline and reference KB

- typescript.instructions.md: Removed tutorial, kept integration
- testing.instructions.md: Focused on workflow, linked Jest/TDD KB

Based on O1-database-foundation retrospective analysis."

# 3. Knowledge base updates
git add knowledge-base/
git commit -m "docs(kb): fill gaps identified in refinement

- Created knowledge-base/powershell/README.md (scripting patterns)
- Updated knowledge-base/jest/README.md (added SQLite section)

Based on O1-database-foundation retrospective analysis."

# 4. Refinement report
git add work-items/*/refine/
git commit -m "docs(refine): complete refinement report for O1

Analysis of retrospectives, duplication matrix, recommendations.
Documents agent system improvements for future reference."
```

---

## Success Metrics

**Quantitative**:

- Lines removed from agents: [X] (target: 30-50% reduction)
- KB references added: [Y] (should increase)
- Duplication eliminated: [Z] files with same content
- KB articles created: [N] new comprehensive guides

**Qualitative**:

- Agent files are easier to read (workflow is clear)
- Handoffs are explicit (deliverables documented)
- Knowledge base is comprehensive (no gaps)
- Links work (no broken references)
- Workflow flows smoothly (no confusion points)

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Removing Too Much

**Problem**: Stripping agents to bare bones, losing workflow guidance

**Fix**: Keep workflow steps, decision points, verification checklists. Only remove technology tutorials and duplicated content.

### ❌ Mistake 2: Breaking Links

**Problem**: Removing content but forgetting to add references

**Fix**: Every removal should be replaced with a link to canonical location.

### ❌ Mistake 3: Creating Orphan Content

**Problem**: Creating KB articles but not linking them from agents/instructions

**Fix**: Bi-directional connections - KB should be referenced, agents should reference.

### ❌ Mistake 4: Ignoring Retrospectives

**Problem**: Refining based on theory, not actual pain points

**Fix**: Start with retrospective analysis. Fix problems that actually occurred.

### ❌ Mistake 5: No Research

**Problem**: Refining based on gut feel, not best practices

**Fix**: Always research current best practices before major changes.

---

## Related Documentation

- **[knowledge-base/copilot/README.md](../../knowledge-base/copilot/README.md)** - Copilot agent patterns
- **[knowledge-base/codebase/development-guide.md](../../knowledge-base/codebase/development-guide.md)** - SOLID, DRY, KISS
- **[.github/instructions/knowledge-base.instructions.md](knowledge-base.instructions.md)** - KB organization rules

---

## Next Steps After Refinement

1. **Archive work item** - Move to `work-items/archive/` or mark complete
2. **Update agent system docs** - Note changes in copilot/README.md
3. **Share learnings** - Team retrospective on what improved
4. **Monitor next feature** - Verify refinements improve workflow
5. **Iterate** - Continue refining after each major feature
