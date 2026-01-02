# Database Structure Documentation

**Project**: Zach.ai Database Foundation  
**ORM**: Prisma 7.2.0  
**Database**: SQLite with WAL mode  
**Purpose**: Documentation of the actual database schema created by Prisma migrations

---

## Summary

**Location**: `backend/dev.db` (development) / `backend/prod.db` (production)  
**Migration**: `20260102170330_init`  
**Journal Mode**: WAL (Write-Ahead Logging)

## Tables Created

### Core Tables

1. **users** - User accounts
2. **thoughts** - Immutable thought capture
3. **projects** - Multi-step outcomes
4. **actions** - Next actions

### Junction Tables (Many-to-Many)

5. **project_thoughts** - Links projects to thoughts
6. **action_thoughts** - Links actions to thoughts
7. **action_assignees** - Links actions to assigned users

## Detailed Schema

### users

```sql
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

**Fields**:

- `id`: UUID primary key
- `email`: Unique user email
- `name`: User display name
- `createdAt`: Auto-generated timestamp

**Indexes**:

- Unique index on `email` for fast lookups and uniqueness constraint

---

### thoughts

```sql
CREATE TABLE "thoughts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedState" TEXT NOT NULL DEFAULT 'UNPROCESSED',
    "userId" TEXT NOT NULL,
    CONSTRAINT "thoughts_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "thoughts_userId_idx" ON "thoughts"("userId");
CREATE INDEX "thoughts_timestamp_idx" ON "thoughts"("timestamp");
```

**Fields**:

- `id`: UUID primary key
- `text`: The actual thought content
- `source`: Where it came from ('manual', 'agent', 'import', etc.)
- `timestamp`: When it was captured
- `processedState`: Processing status ('UNPROCESSED', 'PROCESSED', 'ARCHIVED')
- `userId`: Foreign key to users table

**Indexes**:

- Index on `userId` for fast user-based queries
- Index on `timestamp` for chronological sorting

**Foreign Keys**:

- `userId` → `users.id` (CASCADE on delete - if user deleted, thoughts deleted)

---

### projects

```sql
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "nextActionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE INDEX "projects_updatedAt_idx" ON "projects"("updatedAt");
```

**Fields**:

- `id`: UUID primary key
- `title`: Project name
- `description`: Optional detailed description
- `status`: 'ACTIVE', 'PAUSED', or 'COMPLETED'
- `nextActionId`: Optional pointer to the next action for this project
- `createdAt`: When project was created
- `updatedAt`: Last modification timestamp (auto-updated)

**Indexes**:

- Index on `status` for filtering active/paused/completed projects
- Index on `updatedAt` for sorting by recent activity

---

### actions

```sql
CREATE TABLE "actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "actions_projectId_fkey" FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "actions_projectId_idx" ON "actions"("projectId");
CREATE INDEX "actions_status_idx" ON "actions"("status");
CREATE INDEX "actions_actionType_idx" ON "actions"("actionType");
```

**Fields**:

- `id`: UUID primary key
- `title`: Action title
- `description`: Optional details
- `actionType`: 'Manual', 'AgentTask', 'Clarification', 'Review', 'Recurring', 'Reference'
- `status`: 'TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
- `projectId`: Optional FK to projects (null = inbox action)
- `createdAt`: When action was created
- `updatedAt`: Last modification timestamp

**Indexes**:

- Index on `projectId` for filtering project actions
- Index on `status` for filtering by status
- Index on `actionType` for filtering by type

**Foreign Keys**:

- `projectId` → `projects.id` (SET NULL on delete - if project deleted, actions become inbox items)

---

### Junction Tables

#### project_thoughts

```sql
CREATE TABLE "project_thoughts" (
    "projectId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    PRIMARY KEY ("projectId", "thoughtId"),
    CONSTRAINT "project_thoughts_projectId_fkey" FOREIGN KEY ("projectId")
        REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_thoughts_thoughtId_fkey" FOREIGN KEY ("thoughtId")
        REFERENCES "thoughts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Purpose**: Links projects to the thoughts that inspired them
**Cascade**: If project or thought deleted, link is automatically removed

#### action_thoughts

```sql
CREATE TABLE "action_thoughts" (
    "actionId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    PRIMARY KEY ("actionId", "thoughtId"),
    CONSTRAINT "action_thoughts_actionId_fkey" FOREIGN KEY ("actionId")
        REFERENCES "actions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "action_thoughts_thoughtId_fkey" FOREIGN KEY ("thoughtId")
        REFERENCES "thoughts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Purpose**: Links actions to the thoughts that inspired them
**Cascade**: If action or thought deleted, link is automatically removed

#### action_assignees

```sql
CREATE TABLE "action_assignees" (
    "actionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    PRIMARY KEY ("actionId", "userId"),
    CONSTRAINT "action_assignees_actionId_fkey" FOREIGN KEY ("actionId")
        REFERENCES "actions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "action_assignees_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Purpose**: Links actions to assigned users (supports multiple assignees per action)
**Cascade**: If action or user deleted, assignment link is automatically removed

---

## Entity Relationships

```
User (1) ────< (N) Thought
  │
  └─< (N) ActionAssignee >─ (N) Action
                               │
                               ├─< (N) ActionThought >─ (N) Thought
                               └─> (1) Project
                                      │
                                      └─< (N) ProjectThought >─ (N) Thought
```

## Key Design Decisions

1. **UUID Primary Keys**: All tables use UUID strings for globally unique IDs
2. **Immutable Thoughts**: No update/delete operations - captured for historical record
3. **Cascade Deletes**: Related data properly cleaned up when parent entities are deleted
4. **Nullable projectId**: Actions can exist in "inbox" without being assigned to a project
5. **Indexes**: Strategic indexes on foreign keys and frequently queried fields
6. **Timestamps**: Automatic `createdAt` and `updatedAt` tracking
7. **Enums as Strings**: Status and type values stored as strings for flexibility

## Verification Commands

### Check if database exists:

```bash
ls backend/dev.db
```

### View schema with Prisma CLI:

```bash
cd backend
npx prisma db pull  # Would pull schema from existing DB
npx prisma validate # Validates schema file
```

### Query database directly (if SQLite CLI installed):

```bash
sqlite3 backend/dev.db ".schema"
sqlite3 backend/dev.db "SELECT name FROM sqlite_master WHERE type='table';"
```

### Open in Prisma Studio:

```bash
cd backend
npx prisma studio  # Opens visual database browser on http://localhost:5555
```

## Migration History

- **20260102170330_init**: Initial schema with all core tables and relationships

## Status

✅ Database created successfully at `backend/dev.db`  
✅ All 7 tables created with proper constraints  
✅ All indexes created  
✅ Foreign key relationships established  
✅ Prisma Client generated and ready to use

## Related Documentation

- **Prisma Schema**: See `backend/prisma/schema.prisma` for declarative model definitions
- **Database Tools**: See `knowledge-base/sqlite/database-tools.md` for access methods
- **SQLite Knowledge Base**: See `knowledge-base/sqlite/README.md` for SQLite best practices
- **Prisma Knowledge Base**: See `knowledge-base/prisma/README.md` for Prisma usage patterns
