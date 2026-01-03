# Agent Refinement Skills

Reusable patterns for refiner agent operations.

---

## Skill: Analyze Retrospective Documents

**Purpose**: Extract actionable insights from retrospective files.

**Usage**:

```
Read all files in work-items/<branch>/retro/
Group findings by category (workflow, knowledge, tools)
Identify patterns (repeated issues, consistent successes)
```

**Pattern**:

1. List all retrospective files chronologically
2. For each file, extract:
   - What went well ✅
   - What didn't go well ❌
   - What we learned 📚
   - Action items 🔧
3. Create aggregated analysis:
   - Common pain points (appeared in 2+ retrospectives)
   - Consistent successes (to preserve)
   - Recurring confusions (documentation gaps)
   - Workflow improvements (action items)

**Output**: Summary document with categorized findings and frequency counts.

---

## Skill: Detect Content Duplication

**Purpose**: Find duplicated content across agent/instruction/KB files.

**Usage**:

```
Search for common patterns across documentation tiers
Identify redundant explanations
Map duplication to canonical location
```

**Pattern**:

1. Define search targets (TypeScript, Jest, SOLID, Git, etc.)
2. For each target, search:
   ```bash
   grep -r "TypeScript strict mode" .github/agents/
   grep -r "TypeScript strict mode" .github/instructions/
   grep -r "TypeScript strict mode" knowledge-base/
   ```
3. Create duplication matrix:
   | Content | Agent | Instructions | KB | Canonical Location |
4. Identify removal candidates (content in non-canonical locations)

**Output**: Duplication matrix with recommendations.

---

## Skill: Research Best Practices

**Purpose**: Find current best practices for agent systems.

**Usage**:

```
Search for agent management patterns
Search for documentation structure patterns
Search for workflow orchestration patterns
```

**Search Queries**:

1. "GitHub Copilot agent management best practices 2025"
2. "AI agent workflow design patterns"
3. "Technical documentation hierarchy software engineering"
4. "Agent handoff patterns context preservation"

**Pattern**:

1. Execute searches with `fetch_webpage` tool
2. Extract key patterns from results
3. Compare to current implementation
4. Document gaps and opportunities

**Output**: Research findings document with patterns to apply.

---

## Skill: Refactor Agent File

**Purpose**: Remove duplication from agent file, add references.

**Usage**:

```
Input: Agent file path, duplication matrix
Output: Refined agent with KB/instruction references
```

**Pattern**:

1. **Identify sections to remove**:
   - Technology explanations (→ KB)
   - Setup instructions (→ KB/instructions)
   - Code examples (→ KB)
   - Best practices (→ KB development-guide.md)

2. **Create replacement references**:

   ```markdown
   # Before

   ## TypeScript Best Practices

   [50 lines of TypeScript guidance]

   # After

   ## TypeScript Best Practices

   **Reference**: [TypeScript Instructions](../instructions/typescript.instructions.md)
   **Deep Dive**: [knowledge-base/typescript/README.md](../../knowledge-base/typescript/README.md)

   Follow TypeScript strict mode and type-safe patterns.
   ```

3. **Preserve workflow guidance**:
   - Keep: Process steps, decision points, verification checklists
   - Remove: Technology tutorials, comprehensive examples

4. **Strengthen handoffs**:
   - Add deliverables list
   - Add verification checklist
   - Specify context to preserve

**Output**: Refined agent file with reduced size, increased clarity.

---

## Skill: Refactor Instruction File

**Purpose**: Streamline instructions, reference KB for deep dive.

**Usage**:

```
Input: Instruction file path
Output: Focused instruction with KB references
```

**Pattern**:

1. **Remove tutorial content**:
   - "What is X" explanations
   - Comprehensive setup guides
   - Extensive troubleshooting

2. **Keep workflow integration**:
   - Quick reference commands
   - Project-specific patterns
   - How to use during agent work

3. **Add KB reference section**:

   ```markdown
   **Apply to**: File patterns
   **Reference**: [knowledge-base/tech/README.md](../../knowledge-base/tech/README.md) (XXX lines comprehensive guide)

   ## Quick Reference

   [Essential commands]

   ## Workflow Integration

   [How to use during development]

   **Deep Dive**: See KB article for [specific topics].
   ```

**Output**: Streamlined instruction file focused on integration.

---

## Skill: Validate Knowledge Base Article

**Purpose**: Ensure KB article is comprehensive and well-structured.

**Usage**:

```
Input: KB article path
Output: Validation report with gaps identified
```

**Required Sections**:

1. ✅ Overview (what, why, when to use)
2. ✅ Quick reference (commands, patterns)
3. ✅ Setup instructions (installation, configuration)
4. ✅ Enterprise best practices
5. ✅ Common patterns (code examples)
6. ✅ Troubleshooting (issues, solutions)
7. ✅ References (official docs, resources)

**Quality Checks**:

- Article length: 400-600+ lines for major technologies
- Code examples: Present and well-commented
- Cross-references: Links to related KB articles
- Comprehensive: Answers common questions from process logs

**Output**: Validation report with missing sections and improvement recommendations.

---

## Skill: Create Duplication Matrix

**Purpose**: Visual representation of duplicated content.

**Usage**:

```
Input: List of content topics, file paths
Output: Markdown table showing duplication
```

**Pattern**:

```markdown
| Content          | Agent File            | Instructions                  | Knowledge Base          | Recommendation                            |
| ---------------- | --------------------- | ----------------------------- | ----------------------- | ----------------------------------------- |
| TypeScript Setup | ✅ developer.agent.md | ✅ typescript.instructions.md | ✅ typescript/README.md | Keep in KB only, link from others         |
| Jest AAA Pattern | ✅ developer.agent.md | ✅ testing.instructions.md    | ✅ jest/README.md       | Keep in KB, brief mention in instructions |
| SOLID Principles | ✅ developer.agent.md | ✅ typescript.instructions.md | ✅ development-guide.md | Keep in KB, checkpoint in agent           |
| Git Workflow     | ✅ Multiple agents    | ❌ None                       | ❌ None                 | Create KB article, reference from agents  |
```

**Analysis**:

- Rows with 3 checkmarks = High duplication (priority removal)
- Rows with agent + KB = Agent should reference, not duplicate
- Rows with no KB = Create KB article

**Output**: Duplication matrix table with recommendations.

---

## Skill: Strengthen Agent Handoff

**Purpose**: Make agent handoffs explicit and verifiable.

**Usage**:

```
Input: Agent file, next agent in chain
Output: Enhanced handoff section
```

**Pattern**:

```markdown
## Handoff to [Next Agent]

### Deliverables

- [ ] [Specific artifact 1] - Location: `path/to/artifact.md`
- [ ] [Specific artifact 2] - Location: `path/to/artifact.md`
- [ ] [Specific artifact 3] - Format: [Description]

### Verification Checklist

- [ ] All deliverables created and committed
- [ ] [Quality check 1] passed
- [ ] [Quality check 2] verified
- [ ] Context documented in handoff

### Context to Preserve

- **What was decided**: [Key decisions summary]
- **Why it matters**: [Impact on next phase]
- **Open questions**: [What next agent should address]

### Next Agent Receives

- **Inputs**: [What previous agent produced]
- **Context**: [Background and decisions]
- **Constraints**: [Limitations to respect]
```

**Output**: Complete handoff section with explicit deliverables and verification.

---

## Skill: Create Refinement Report

**Purpose**: Document refinement analysis and changes.

**Usage**:

```
Input: Retrospective analysis, duplication matrix, changes made
Output: Comprehensive refinement report
```

**Report Structure**:

```markdown
# Agent System Refinement Report

## Executive Summary

- [Key findings in 2-3 sentences]
- [Changes count: X agents, Y instructions, Z KB]
- [Impact metrics]

## Retrospective Analysis

### Patterns Identified

- [Common pain points with frequency]
- [Consistent successes]
- [Key learnings]

## Duplication Analysis

[Insert duplication matrix]

### Removed Duplication

- [Agent X]: Removed [Y] lines, added refs to [Z]
- [Instructions X]: Removed [Y], linked to KB

## Agent Refinements

### [Agent Name]

**Changes**: [List of changes]
**Impact**: [How this improves workflow]
**Metrics**: [Lines removed, references added]

## Knowledge Base Updates

### Articles Created

- [Article name]: [Purpose, length, key sections]

### Articles Updated

- [Article name]: [Changes made, sections added]

## Best Practices Applied

- [Practice 1]: [How applied]
- [Practice 2]: [How applied]

## Recommendations for Future

1. [Recommendation with rationale]
2. [Recommendation with rationale]

## Metrics

- Agents refined: X
- Duplication removed: Y lines
- KB references added: Z
- New KB articles: N
```

**Output**: Complete refinement report for work item documentation.

---

## Skill: Verify Link Integrity

**Purpose**: Ensure all references to KB/instructions are valid.

**Usage**:

```
Input: List of agent/instruction files
Output: Link validation report
```

**Pattern**:

1. Extract all markdown links from files
2. Check relative path validity:
   - From agent to instructions: `../instructions/file.md`
   - From agent to KB: `../../knowledge-base/tech/README.md`
   - From instructions to KB: `../../knowledge-base/tech/README.md`
3. Verify target files exist
4. Report broken links with file + line number

**Validation Rules**:

- Agents can link to: Instructions, KB
- Instructions can link to: KB
- KB can link to: Other KB articles
- No upward references (KB → Instructions, Instructions → Agents)

**Output**: Report of broken links and invalid reference directions.

---

## Skill: Calculate Refinement Metrics

**Purpose**: Quantify improvement from refinement.

**Usage**:

```
Input: Before/after file sizes, number of references added
Output: Metrics summary
```

**Metrics to Calculate**:

1. **Size Reduction**:
   - Lines removed from agents: [Before] - [After]
   - Percentage reduction: ([Removed] / [Before]) \* 100%

2. **Reference Addition**:
   - KB references added: Count `**Reference**:` additions
   - Instruction references added: Count `**Deep Dive**:` additions

3. **Duplication Elimination**:
   - Duplicated sections removed: Count from duplication matrix
   - Files affected: Number of files edited

4. **Knowledge Base Growth**:
   - Articles created: Count new KB files
   - Articles updated: Count modified KB files
   - Lines added to KB: Sum of additions

**Output**:

```markdown
## Refinement Metrics

- **Agent Size Reduction**: 42% (1,200 → 696 lines)
- **KB References Added**: 15 references
- **Duplication Removed**: 8 duplicated sections
- **KB Articles Created**: 2 new comprehensive articles
- **KB Articles Updated**: 3 existing articles enhanced
- **Total KB Growth**: 1,200+ lines of comprehensive documentation
```

---

## Related Skills

- **[knowledge-base/copilot/skills.md](../../knowledge-base/copilot/skills.md)** - General Copilot skill patterns
- **[.github/instructions/knowledge-base.instructions.md](../instructions/knowledge-base.instructions.md)** - KB organization
- **[.github/instructions/retrospective.instructions.md](../instructions/retrospective.instructions.md)** - Retrospective analysis
