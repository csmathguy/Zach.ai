# Knowledge Base Documentation Instructions

**Apply to**: All documentation creation and maintenance  
**Purpose**: Ensure consistent organization of project knowledge and long-term memory

---

## Core Principle

**Knowledge base documentation is long-term memory that lives separate from code.**

Do NOT scatter `.md` documentation files throughout the codebase (`backend/`, `frontend/`, `scripts/`). All project knowledge should be centralized in `knowledge-base/`.

---

## When to Use Knowledge Base

### ✅ Belongs in Knowledge Base (`knowledge-base/`)

**Technology Documentation**:

- Framework guides (React, Express, Vite, etc.)
- Library usage patterns (Prisma, Jest, Testing Library)
- Tool configuration (ESLint, Prettier, PM2)
- Database schema documentation
- API documentation

**Project Documentation**:

- Architecture decisions
- Development workflows
- Deployment strategies
- Code quality standards
- Design patterns used

**Agent/Copilot Documentation**:

- Agent behaviors and skills
- Prompt templates
- Workflow guides
- Tool configurations

**Examples**:

- `knowledge-base/prisma/database-structure.md` - Schema documentation
- `knowledge-base/sqlite/database-tools.md` - Database access methods
- `knowledge-base/tdd/README.md` - TDD principles and patterns
- `knowledge-base/deployment/deployment.md` - Deployment procedures

### ❌ Does NOT Belong in Knowledge Base

**Code-Specific Files** (live with code):

- `README.md` in project directories (project overview)
- API endpoint documentation (OpenAPI/Swagger files)
- Component-level documentation (JSDoc comments in code)
- Package-level README files

**Temporary Work Items**:

- APRs, test plans, implementation notes → `work-items/<feature>/`
- Retrospectives → `work-items/<feature>/retro/`
- Task checklists → `work-items/<feature>/dev/`

---

## Knowledge Base Structure

```
knowledge-base/
├── codebase/              # This project's documentation
│   ├── README.md
│   ├── development-guide.md
│   ├── structure.md
│   └── validation.md
├── deployment/            # Deployment and hosting
│   └── deployment.md
├── <technology>/          # Per-technology documentation
│   └── README.md          # Comprehensive guide (400+ lines)
└── README.md              # Knowledge base index
```

### Technology Folders

Each major technology gets its own folder with comprehensive documentation:

- `eslint/` - Linting configuration and rules
- `prettier/` - Code formatting standards
- `jest/` - Testing framework usage
- `react/` - React patterns and components
- `typescript/` - TypeScript best practices
- `prisma/` - ORM usage and patterns
- `sqlite/` - Database management
- `pm2/` - Process management
- `tdd/` - Test-Driven Development

**Standard**: Each technology folder should have a comprehensive `README.md` (400+ lines) covering:

- Overview and purpose
- Quick reference commands
- Enterprise best practices
- Setup instructions
- Common patterns
- Troubleshooting
- References

---

## Agent Responsibilities

### Planning Agent (`planner`)

- Creates APRs in `work-items/<feature>/plan/apr.md`
- ❌ Does NOT create knowledge base documentation

### Architecture Agent (`architect`)

- Creates ADRs in `work-items/<feature>/architecture/`
- ❌ Does NOT create knowledge base documentation

### Research Agent (`researcher`)

- **Primary responsibility**: Create/update knowledge base documentation
- Creates comprehensive technology guides (400+ lines)
- Updates existing guides when new patterns discovered
- Documents findings in `work-items/<feature>/research/research-findings.md`
- **Key action**: Moves research into permanent knowledge base

### Developer Agent (`developer`)

- Implements features following knowledge base patterns
- ❌ Does NOT create knowledge base documentation
- ❌ Does NOT scatter `.md` files in code directories

### Retrospective Agent (`retro`)

- Identifies knowledge base improvements needed
- Creates action items for researcher to update knowledge base
- ❌ Does NOT directly modify knowledge base

---

## Documentation Placement Rules

### Rule 1: Technology-Specific Knowledge → `knowledge-base/<technology>/`

**Bad** ❌:

```
backend/DATABASE-TOOLS.md         # Scattered in code
backend/DATABASE-STRUCTURE.md     # Scattered in code
frontend/COMPONENT-PATTERNS.md    # Scattered in code
```

**Good** ✅:

```
knowledge-base/sqlite/database-tools.md       # Centralized
knowledge-base/prisma/database-structure.md   # Centralized
knowledge-base/react/component-patterns.md    # Centralized
```

### Rule 2: Project-Specific Knowledge → `knowledge-base/codebase/`

**Bad** ❌:

```
backend/ARCHITECTURE.md           # Should be centralized
scripts/DEPLOYMENT-GUIDE.md       # Should be centralized
```

**Good** ✅:

```
knowledge-base/codebase/architecture.md
knowledge-base/deployment/deployment.md
```

### Rule 3: Feature Work → `work-items/<feature>/`

**Good** ✅:

```
work-items/O1-database-foundation/plan/apr.md
work-items/O1-database-foundation/architecture/adr-01-prisma.md
work-items/O1-database-foundation/dev/task-list.md
work-items/O1-database-foundation/retro/retrospective.md
```

**Important**: Work items are temporary - once feature is complete, valuable knowledge gets extracted into knowledge base by researcher agent.

---

## Creating New Knowledge Base Documentation

### Step 1: Determine Category

Ask: "What technology or topic does this document?"

- Framework/Library? → `knowledge-base/<tech>/`
- This project? → `knowledge-base/codebase/`
- Deployment/Hosting? → `knowledge-base/deployment/`
- Tool configuration? → `knowledge-base/<tool>/`

### Step 2: Check if Category Exists

```powershell
# List existing categories
Get-ChildItem knowledge-base -Directory | Select-Object Name
```

If category doesn't exist, create it with a comprehensive README.md.

### Step 3: Create Comprehensive Documentation

**Minimum Standards**:

- 400+ lines for major technology guides
- Clear table of contents
- Quick reference section
- Enterprise best practices
- Setup instructions
- Code examples
- Troubleshooting section
- References to official documentation

### Step 4: Link from Knowledge Base Index

Update `knowledge-base/README.md` with link to new documentation.

---

## Updating Existing Documentation

### When to Update

- New patterns discovered during development
- New tools or libraries added
- Best practices refined through retrospectives
- Breaking changes in dependencies
- Deployment procedures changed

### Who Updates

**Researcher Agent** is responsible for:

- Creating new technology documentation
- Updating existing documentation
- Ensuring 400+ line standard maintained
- Keeping examples current

**Process**:

1. Retrospective identifies knowledge gap
2. Action item created: "Update knowledge-base/<tech>/README.md with X"
3. Researcher agent performs update
4. Changes reviewed for accuracy

---

## Migration Strategy

If you find `.md` files scattered in code directories:

1. **Identify the category** (technology, project, tool)
2. **Move to appropriate knowledge base location**
3. **Update all references** in work items and code
4. **Remove old file** from code directory
5. **Document move** in git commit message

**Example**:

```powershell
# Move misplaced files
Move-Item backend/DATABASE-TOOLS.md knowledge-base/sqlite/database-tools.md
Move-Item backend/DATABASE-STRUCTURE.md knowledge-base/prisma/database-structure.md

# Update references
# (Use grep_search to find all references, then replace_string_in_file)

# Commit with clear message
git commit -m "docs: move database documentation to knowledge base

- Moved DATABASE-TOOLS.md to knowledge-base/sqlite/
- Moved DATABASE-STRUCTURE.md to knowledge-base/prisma/
- Updated all references in task-list.md
- Removed Chocolatey references (not part of workflow)"
```

---

## Anti-Patterns to Avoid

### ❌ Scattered Documentation

```
backend/
├── README.md                    # ✅ OK - project-level overview
├── DATABASE-TOOLS.md            # ❌ BAD - should be in knowledge-base/sqlite/
├── PRISMA-GUIDE.md              # ❌ BAD - should be in knowledge-base/prisma/
├── DEPLOYMENT.md                # ❌ BAD - should be in knowledge-base/deployment/
└── src/
    └── API-DOCS.md              # ❌ BAD - should be OpenAPI/Swagger or knowledge-base/
```

### ❌ Technology-Specific Docs Without Category

```
knowledge-base/
├── database-tools.md            # ❌ BAD - should be sqlite/database-tools.md
└── testing-guide.md             # ❌ BAD - should be jest/README.md
```

### ❌ Knowledge Base in Work Items

```
work-items/O1-database-foundation/
├── knowledge-base-prisma.md     # ❌ BAD - should be in knowledge-base/prisma/
└── testing-patterns.md          # ❌ BAD - should be in knowledge-base/tdd/ or jest/
```

---

## Tools Integration

### Exclude External Package Documentation

**Do NOT** document third-party tools that have excellent official documentation:

- ❌ Don't create `knowledge-base/chocolatey/` - we don't use it
- ❌ Don't create `knowledge-base/npm/` - official docs are sufficient
- ❌ Don't duplicate official API documentation

**Do** document:

- ✅ How WE use the tool in THIS project
- ✅ Our configuration and patterns
- ✅ Integration with our workflow
- ✅ Common pitfalls WE encountered
- ✅ Project-specific examples

**Example**:

```markdown
# ✅ Good: knowledge-base/prisma/README.md

## Overview

Prisma is our ORM of choice for database access.

## Our Configuration

- SQLite for simplicity
- WAL mode for performance
- Migration strategy: dev vs prod

## Our Patterns

- Repository pattern implementation
- Mapper functions (toDomain/toPrisma)
- Transaction handling

## References

- Official Prisma docs: https://www.prisma.io/docs
```

---

## Enforcement Checklist

Before committing documentation:

- [ ] Is this a `.md` file?
- [ ] Is it technology/project knowledge (not feature-specific)?
- [ ] Is it in `knowledge-base/` (not scattered in code)?
- [ ] Does it follow 400+ line standard (for major guides)?
- [ ] Is it linked from `knowledge-base/README.md`?
- [ ] Have I updated any references from old location?
- [ ] Have I removed the old file if moved?

---

## Summary

**Golden Rule**: Long-term knowledge goes in `knowledge-base/`, organized by technology or topic. Code directories should only have code-specific README files, not comprehensive guides.

**Quick Decision Tree**:

1. Is it feature-specific work? → `work-items/<feature>/`
2. Is it technology knowledge? → `knowledge-base/<technology>/`
3. Is it project knowledge? → `knowledge-base/codebase/`
4. Is it deployment knowledge? → `knowledge-base/deployment/`
5. Is it agent/workflow knowledge? → `knowledge-base/copilot/`

**Researcher Agent**: Primary owner of knowledge base maintenance and expansion.
