# Process Log

**Purpose**: Chronological record of development progress - factual "what happened" entries.

**Location**: `work-items/<feature>/dev/process-log/`

**Format**: Each entry is a timestamped markdown file: `YYYY-MM-DD-HHMMSS.md`

---

## Process Log vs Retrospective

| Aspect       | Process Log               | Retrospective                          |
| ------------ | ------------------------- | -------------------------------------- |
| **Purpose**  | Record what was completed | Reflect on what was learned            |
| **Content**  | Facts, summaries, context | Insights, improvements, actions        |
| **Timing**   | After every commit        | After every commit                     |
| **Tone**     | Objective, brief          | Reflective, detailed                   |
| **Audience** | Next task continuation    | Future developers, process improvement |

---

## When to Create Entry

**After EVERY commit**, before retrospective:

1. Commit code changes
2. Update task list
3. **Create process log entry** ← NEW STEP
4. Add retrospective entry
5. Implement improvements (if applicable)
6. Continue to next task

---

## Entry Template

See `TEMPLATE.md` for the entry structure.

---

## Agent Workflow: Direct Fill-In (Recommended)

**IMPORTANT**: Agent must fill in ALL template sections with actual data, not leave placeholders!

After committing code:

1. **Create timestamped file**: `work-items/<work-item>/dev/process-log/$(Get-Date -Format "yyyy-MM-dd-HHmmss").md`
2. **Copy template**: From `work-items/_template/dev/process-log/TEMPLATE.md`
3. **Fill ALL sections** with actual data:
   - Replace [Brief Task Description] with actual task name
   - Insert actual commit hash and message
   - List **specific files** created/modified with **actual purposes**
   - Include **actual test counts** (e.g., "200 passing - 34 new")
   - Document **actual issues encountered** with resolutions
   - Specify **next steps** from task-list.md
4. **Save**: Complete when no placeholders remain
5. **Continue**: Create retrospective entry (see `work-items/_template/feature-branch-name/retro/`)

### ❌ Bad (Placeholders Left)

```markdown
**Files Created**:

- `path/to/file1.ts` - [purpose]

**Test Results**:

- X tests passing (Y total)
```

### ✅ Good (Actual Data)

```markdown
**Files Created**:

- `backend/src/infrastructure/prisma/repositories/PrismaActionRepository.ts` - Action repository with idempotent many-to-many operations
- `backend/src/domain/repositories/IActionRepository.ts` - Interface defining action repository contract

**Test Results**:

- 200 tests passing (200 total - 34 new PrismaActionRepository tests)
- Coverage: Infrastructure 85%, Overall 78%
```

---

## Script Usage (Optional - Minimal Automation)

The PowerShell script creates the file and fills basic metadata, but **agent must still fill all content sections**:

```powershell
.\scripts\dev\new-process-log-entry.ps1 `
  -WorkItem "O1-database-foundation" `
  -Description "PrismaActionRepository" `
  -Task "Section 2.8"
```

**After script runs, agent must**:

- Open the created file
- Replace ALL placeholder text with actual detailed information
- Ensure no "[Item 1]" or "[purpose]" placeholders remain

---

## Example Timeline

```
2026-01-02-141500.md  - Day 0: Prerequisites and automation
2026-01-02-153000.md  - Day 1: Domain models (User, Thought, Project, Action)
2026-01-02-161200.md  - Day 2.1-2.3: Prisma setup and client
2026-01-02-170800.md  - Day 2.4: Mappers with type safety
2026-01-03-093000.md  - Day 2.5: PrismaUserRepository
2026-01-03-112200.md  - Day 2.6: PrismaThoughtRepository (immutability)
```

---

## Best Practices

- **Keep it brief**: 1-2 paragraphs per section max
- **Focus on facts**: What was done, what works, what's next
- **Link to commit**: Include commit hash for traceability
- **Context for continuation**: What the next developer needs to know
- **Avoid duplication**: Don't repeat what's in retrospective

---

## Migration for Existing Work Items

For features already in progress:

1. Create `dev/process-log/` directory
2. Create initial entry summarizing work to date
3. Continue with timestamped entries going forward
