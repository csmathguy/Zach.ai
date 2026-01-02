# Architecture Decision Records (ADRs)

**Purpose**: Document major architectural decisions that affect the entire codebase. These are PERMANENT records that explain WHY we made key technical choices.

**Location**: This is long-term memory. ADRs here are version-controlled and never deleted.

**Contrast with Work Items**: Work items (`work-items/`) contain short-term context and metadata for active work. They can be deleted after feature completion. ADRs are extracted from work items and promoted here for permanent reference.

---

## Current ADRs

### Database & ORM

- **[ADR-001: Use Prisma ORM](./adr-001-use-prisma-orm.md)** - TypeScript-first ORM with auto-generated types, migrations (vs TypeORM, Knex, Sequelize)
- **[ADR-002: Use SQLite with WAL Mode](./adr-002-use-sqlite-with-wal-mode.md)** - Embedded database with Write-Ahead Logging for performance and concurrency (vs PostgreSQL, MySQL)

### Architecture Patterns

- **[ADR-003: Use Repository Pattern](./adr-003-repository-pattern.md)** - Database abstraction via interfaces for testability and flexibility (vs Active Record, direct ORM usage)
- **[ADR-004: Layered Architecture](./adr-004-layered-architecture.md)** - Domain/Infrastructure/Application/API separation (vs monolithic, hexagonal, clean architecture)

---

## ADR Status

- **Proposed**: Under discussion, not yet implemented
- **Accepted**: Approved and being implemented
- **Deprecated**: No longer recommended, but still in use
- **Superseded**: Replaced by a newer ADR (link to replacement)

---

## How to Use ADRs

### For Developers

When implementing a feature:

1. Read relevant ADRs to understand WHY decisions were made
2. Follow patterns established in ADRs
3. If you need to deviate, create a new ADR explaining why

### For Architects

When designing a new feature:

1. Reference existing ADRs to maintain consistency
2. Create new ADRs for major decisions (database, framework, pattern)
3. Promote ADRs from work items to knowledge base when they affect codebase-wide architecture

### For Reviewers

During code review:

1. Verify code follows ADR decisions
2. Question deviations from established patterns
3. Suggest new ADRs if novel decisions are made

---

## ADR Lifecycle

### 1. Created in Work Item (Short-Term)

During feature development, ADRs are drafted in:

```
work-items/<branch>/architecture/adr-*.md
```

These contain feature-specific context and are part of the work item's "thinking process."

### 2. Promoted to Knowledge Base (Long-Term)

If the ADR affects the entire codebase (database choice, architecture pattern, framework selection), it's promoted here:

```
knowledge-base/codebase/architecture-decisions/adr-*.md
```

**Criteria for Promotion**:

- ✅ Decision affects multiple features or entire codebase
- ✅ Decision establishes a pattern others should follow
- ✅ Decision might be questioned in the future ("Why did we choose X?")
- ❌ Decision is feature-specific implementation detail
- ❌ Decision is temporary or experimental

### 3. Referenced Forever

Once promoted, ADRs are:

- Version-controlled (never deleted)
- Referenced in new feature planning
- Updated with "Superseded by ADR-X" if replaced
- Cited in code reviews and architecture discussions

---

## What Goes in ADRs vs Work Items

### ADRs (Knowledge Base - Long-Term)

**Database Decisions**:

- ✅ "Use Prisma ORM" - affects all features
- ✅ "Use SQLite with WAL" - affects all features
- ✅ "Repository Pattern" - affects all data access

**Framework Decisions**:

- ✅ "Use Express for backend" - affects all APIs
- ✅ "Use React for frontend" - affects all UI
- ✅ "Use Vite for build tool" - affects dev workflow

**Architecture Patterns**:

- ✅ "Layered architecture" - affects all features
- ✅ "Dependency injection" - affects all services

### Work Items (Short-Term Memory)

**Implementation Details**:

- ❌ "Thought model schema definition" - specific to feature
- ❌ "API endpoint design for /thoughts" - specific to feature
- ❌ "UI component structure for dashboard" - specific to feature

**Process Artifacts**:

- ❌ Gherkin test specifications - deleted after tests written
- ❌ Research findings - summarized in KB, original deleted
- ❌ Implementation notes - temporary context
- ❌ Retrospective findings - action items extracted, rest deleted

---

## ADR Template

See [architect.agent.md](../../.github/agents/architect.agent.md) for complete template.

**Key Sections**:

1. Context - Problem and constraints
2. Decision - What we're doing
3. Rationale - Why this over alternatives
4. Alternatives Considered - What we rejected and why
5. Consequences - Trade-offs and risks
6. Implementation Notes - How to apply this decision
7. Compliance - SOLID, patterns, testing

---

## Related Documentation

- [Architecture Overview](../architecture.md) - High-level system architecture
- [Development Guide](../development-guide.md) - SOLID, patterns, best practices
- [Structure Guide](../structure.md) - Repository organization
- [Workflow Guide](../../copilot/workflow-visual-guide.md) - When to create ADRs
