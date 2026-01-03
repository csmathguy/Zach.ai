# Dependencies Added During Development

**Purpose**: Track all dependencies added during this feature to ensure proper documentation or removal.

**When to Update**: Every time `npm install <package>` is run, add entry here.

---

## Template Entry

```markdown
### [package-name] (v[version]) - [STATUS]

- **Purpose**: [Why was this added? What problem does it solve?]
- **Decision**: [Why this package over alternatives?]
- **Status**: [✅ Active / ❌ Removed / ⚠️ Needs Review]
- **KB Location**: [knowledge-base path if documented, or "None - needs documentation"]
- **Date Added**: [YYYY-MM-DD]
- **Removal Date**: [YYYY-MM-DD if removed]
- **Removal Reason**: [Why removed, what replaced it]
```

---

## Dependencies Log

### Example: uuid (v10.0.0) - ❌ REMOVED

- **Purpose**: Generate UUIDs for test fixtures
- **Decision**: Initially chosen for UUID v4 generation in tests
- **Status**: ❌ Removed - unnecessary external dependency
- **KB Location**: None - removed before documentation needed
- **Date Added**: 2026-01-02
- **Removal Date**: 2026-01-02
- **Removal Reason**: Switched to Node crypto.randomUUID() (built-in, no external dependency)

### Example: @prisma/client (v6.0.0) - ✅ ACTIVE

- **Purpose**: Database ORM for SQLite access with type-safe queries
- **Decision**: Industry standard ORM with excellent TypeScript support and migration system
- **Status**: ✅ Active - Core infrastructure dependency
- **KB Location**: knowledge-base/prisma/README.md (comprehensive 400+ line guide)
- **Date Added**: 2026-01-02

---

## Pre-Commit Audit Checklist

Before completing feature, verify:

- [ ] All dependencies in package.json are documented here
- [ ] All ✅ ACTIVE dependencies have KB documentation or are scheduled for documentation
- [ ] All ❌ REMOVED dependencies are actually removed from package.json and code
- [ ] All imports/references to removed packages are updated
- [ ] No orphaned dependencies (in package.json but not used in code)

---

## Notes

**Knowledge Base Standards**:

- Major dependencies (framework, ORM, testing library) → Comprehensive 400+ line guide in `knowledge-base/<tech>/README.md`
- Supporting libraries → Add section to related KB article (e.g., supertest → jest/README.md)
- One-off utilities → Document in code comments if KB article not warranted

**When in Doubt**:

- If package is used in production code → Document in KB
- If package is development/testing only → May document in KB or in code comments
- If package was added then removed within same session → Still log here with removal reason
