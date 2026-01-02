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

## Generating Entries

### Manual Creation

```powershell
# Copy template with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
Copy-Item "TEMPLATE.md" "$timestamp.md"
# Then edit the file
```

### Using Script (Recommended)

```powershell
# From repository root
.\scripts\dev\new-process-log-entry.ps1 -WorkItem "O1-database-foundation"
# Opens new timestamped entry in default editor
```

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
