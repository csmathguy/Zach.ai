# SQLite Knowledge Base

## Overview

SQLite is a C-library that provides a lightweight, disk-based database that doesn't require a separate server process. It's the most widely deployed database engine in the world, powering applications ranging from web browsers to embedded devices to mobile apps.

**Official Website**: https://www.sqlite.org

**Current Version**: 3.47+ (as of January 2026)

**Philosophy**: SQLite is not a competitor to client/server databases like PostgreSQL or MySQL. Instead, it competes with `fopen()` - it's designed for **local data storage** for individual applications and devices.

### Key Characteristics

- **Zero Configuration**: No setup or administration required
- **Self-Contained**: Single file database, no external dependencies
- **Cross-Platform**: Same binary format works on all platforms (32/64-bit, big/little-endian)
- **Public Domain**: No licensing restrictions, completely free
- **ACID Compliant**: Fully transactional with atomic commits
- **Embedded**: Runs in the same process as the application

### When to Use SQLite

✅ **Perfect For**:

- Local development databases
- Embedded devices and IoT
- Desktop applications
- Mobile apps (iOS/Android)
- Low-to-medium traffic websites (<100K hits/day)
- Testing and CI/CD
- Application file format
- Data analysis and data science
- Caching enterprise data locally

❌ **Not Recommended For**:

- High-concurrency write workloads (multiple simultaneous writers)
- Very large datasets (>1 TB, though SQLite supports up to 281 TB)
- Network file systems (use local storage only)
- Client/server applications with many concurrent network clients

---

## Quick Reference

### Essential Concepts

**Database = Single File**: An entire database is stored in a single `.db` or `.sqlite` file.

**No Server**: SQLite runs in the same process as your application - no separate database server.

**Thread-Safe**: Multiple threads can access the same database (with proper locking).

**Portable**: Database files work across different operating systems and architectures.

### Basic SQL Commands

```sql
-- Create table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO users (id, email, name) VALUES ('1', 'user@example.com', 'John');

-- Query data
SELECT * FROM users WHERE email = 'user@example.com';

-- Update data
UPDATE users SET name = 'Jane' WHERE id = '1';

-- Delete data
DELETE FROM users WHERE id = '1';

-- Create index
CREATE INDEX idx_users_email ON users(email);

-- Enable WAL mode (recommended)
PRAGMA journal_mode=WAL;

-- Check database integrity
PRAGMA integrity_check;

-- View schema
.schema users

-- List all tables
.tables
```

### Command-Line Interface

```bash
# Open database
sqlite3 database.db

# Open in read-only mode
sqlite3 file:database.db?mode=ro

# Execute SQL from file
sqlite3 database.db < schema.sql

# Dump database to SQL
sqlite3 database.db .dump > backup.sql

# Export to CSV
sqlite3 database.db <<EOF
.headers on
.mode csv
.output users.csv
SELECT * FROM users;
EOF

# Common sqlite3 commands:
.tables              # List all tables
.schema              # Show all schemas
.schema users        # Show schema for specific table
.databases           # List attached databases
.indices users       # Show indices for table
.quit                # Exit
```

---

## Enterprise Best Practices

### 1. Enable WAL Mode (Critical for Production)

**Write-Ahead Logging (WAL)** dramatically improves performance and concurrency.

```sql
PRAGMA journal_mode=WAL;
```

Or in Node.js with Prisma:

```typescript
// Add to datasource in schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db?mode=rwc&journal_mode=WAL"
}
```

**Benefits of WAL**:

- ✅ **Faster writes**: 50-100% performance improvement
- ✅ **Better concurrency**: Readers don't block writers
- ✅ **More reliable**: Fewer fsync() operations
- ✅ **Crash-safe**: Better recovery from power failures

**Trade-offs**:

- Requires all connections from same machine (no network filesystems)
- Creates additional `-wal` and `-shm` files alongside database
- Slightly slower for read-only workloads (1-2%)

**When to use**: Almost always. Default for production apps.

### 2. Database File Location

```typescript
// ✅ Good: Relative path in project
const dbPath = path.join(__dirname, '../prisma/dev.db');

// ✅ Good: Environment-specific location
const dbPath = process.env.DATABASE_PATH || './data/database.db';

// ❌ Bad: Hardcoded absolute path
const dbPath = 'C:\\Users\\username\\database.db'; // Not portable
```

**Best Practices**:

- Store database file in project directory for development
- Use environment variable for production path
- Ensure directory exists before connecting
- Use absolute paths resolved from `__dirname` or `process.cwd()`
- Keep database file with application (not on network drive)

### 3. Connection Management

#### With Prisma (Recommended)

```typescript
// src/infrastructure/prisma/client.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db?mode=rwc&journal_mode=WAL',
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
});

export { prisma };
```

#### With better-sqlite3 (Direct Access)

```typescript
import Database from 'better-sqlite3';

const db = new Database('database.db', {
  verbose: console.log, // Log queries in development
});

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Optimize for performance
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('temp_store = MEMORY');

// Prepare statement for reuse
const insertUser = db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)');

// Execute
insertUser.run('1', 'user@example.com', 'John');

// Close when done
db.close();
```

### 4. Performance Optimization

#### Indexes

```sql
-- Single-column index
CREATE INDEX idx_users_email ON users(email);

-- Multi-column index
CREATE INDEX idx_posts_author_published ON posts(author_id, published);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Partial index (SQLite 3.8.0+)
CREATE INDEX idx_active_users ON users(email) WHERE active = 1;
```

**Best Practices**:

- Index foreign keys
- Index columns used in WHERE, ORDER BY, and JOIN
- Don't over-index (indexes slow down writes)
- Use partial indexes for frequently filtered subsets

#### Transactions

```sql
BEGIN TRANSACTION;
  INSERT INTO users VALUES ('1', 'user1@example.com', 'User 1');
  INSERT INTO posts VALUES ('1', '1', 'First Post');
COMMIT;
```

With better-sqlite3:

```typescript
const insertMany = db.transaction((users) => {
  for (const user of users) {
    insertUser.run(user.id, user.email, user.name);
  }
});

// Runs all inserts in a single transaction (much faster)
insertMany([
  { id: '1', email: 'user1@example.com', name: 'User 1' },
  { id: '2', email: 'user2@example.com', name: 'User 2' },
]);
```

**Best Practices**:

- Batch multiple writes in a single transaction
- Use transactions for atomic operations
- Keep transactions short (hold locks for minimal time)
- Use `IMMEDIATE` or `EXCLUSIVE` transactions for writes

#### PRAGMAs for Performance

```sql
-- Enable WAL mode
PRAGMA journal_mode=WAL;

-- Reduce fsync() calls (faster, less durable)
PRAGMA synchronous=NORMAL;

-- Increase cache size (default is 2MB)
PRAGMA cache_size=-64000;  -- Negative = KB, so -64000 = 64MB

-- Store temp tables in memory
PRAGMA temp_store=MEMORY;

-- Optimize for read or write performance
PRAGMA optimize;
```

**In Prisma connection string**:

```
file:./dev.db?mode=rwc&journal_mode=WAL&synchronous=NORMAL&cache_size=-64000
```

### 5. Backup Strategies

#### Online Backup (Hot Backup)

```sql
-- Using SQLite's backup API
.backup main backup.db
```

With better-sqlite3:

```typescript
import Database from 'better-sqlite3';

const source = new Database('database.db', { readonly: true });
const backup = new Database('backup.db');

source
  .backup(backup)
  .then(() => {
    console.log('Backup complete');
  })
  .catch((err) => {
    console.error('Backup failed:', err);
  })
  .finally(() => {
    source.close();
    backup.close();
  });
```

#### Simple File Copy (Offline Backup)

```bash
# Stop application first
cp database.db database.backup.db
cp database.db-wal database.backup.db-wal  # If using WAL mode
cp database.db-shm database.backup.db-shm
```

Or with checkpoint:

```sql
-- Ensure all data is in main database file
PRAGMA wal_checkpoint(TRUNCATE);
```

Then copy just the `.db` file.

**Best Practices**:

- Use `.backup` command or backup API for hot backups
- Automate backups with cron jobs or scheduled tasks
- Store backups separately from application
- Test backup restoration regularly
- Keep multiple generations of backups

### 6. Concurrency Handling

SQLite allows **multiple readers** or **one writer** at a time.

#### Read-Heavy Workloads

```typescript
// Multiple read connections are fine
const db1 = new Database('database.db', { readonly: true });
const db2 = new Database('database.db', { readonly: true });
const db3 = new Database('database.db', { readonly: true });
```

#### Write Workloads

```typescript
// Only one write connection at a time
const db = new Database('database.db');

// Set busy timeout for write conflicts
db.pragma('busy_timeout = 5000'); // Wait up to 5 seconds
```

With Prisma:

```typescript
// Connection pooling handled automatically
// Max 10 connections by default
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db?connection_limit=10',
    },
  },
});
```

**Best Practices**:

- Use WAL mode for better concurrency
- Set `busy_timeout` to handle temporary locks
- Keep write transactions short
- Consider queueing writes in high-contention scenarios
- For high write concurrency, consider PostgreSQL instead

### 7. Data Types and Constraints

SQLite uses **dynamic typing** but supports type affinity.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Recommended for UUIDs
  email TEXT NOT NULL UNIQUE,       -- Enforced unique constraint
  age INTEGER CHECK (age >= 0),     -- Check constraint
  balance REAL DEFAULT 0.0,         -- Floating point
  bio TEXT,                          -- Can store up to 2GB
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata BLOB                      -- Binary data
);

-- Foreign key constraint (must enable first)
PRAGMA foreign_keys = ON;

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Best Practices**:

- Use `TEXT` for UUIDs (better than INTEGER for distributed systems)
- Always enable foreign keys: `PRAGMA foreign_keys = ON`
- Use `CHECK` constraints for validation
- Use `NOT NULL` to prevent null values
- Use `DEFAULT` for automatic values

---

## SQLite with Prisma

### Schema Configuration

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

### Environment Configuration

```bash
# .env
DATABASE_URL="file:./dev.db?mode=rwc&journal_mode=WAL"
```

### Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

---

## Testing with SQLite

### In-Memory Database

Perfect for tests - fast, isolated, disposable.

```typescript
// With Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file::memory:?cache=shared',
    },
  },
});

// With better-sqlite3
const db = new Database(':memory:');
```

### Test Setup

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file::memory:?cache=shared',
      },
    },
  });

  // Apply migrations to in-memory DB
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: 'file::memory:?cache=shared',
    },
  });

  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
});

export { prisma };
```

**Best Practices**:

- Use in-memory database for unit/integration tests
- Use file-based database for E2E tests
- Clean database between tests
- Seed test data as needed

---

## Security Considerations

### SQL Injection Prevention

✅ **Use Parameterized Queries**:

```typescript
// ✅ Good: Parameterized (safe)
const user = await prisma.user.findUnique({
  where: { email: userInput },
});

// ✅ Good: With better-sqlite3
const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
const user = stmt.get(userInput);

// ❌ Bad: String concatenation (vulnerable)
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
db.exec(query); // DON'T DO THIS!
```

### File Permissions

```bash
# Set restrictive permissions on database file
chmod 600 database.db

# Ensure only application user can read/write
chown appuser:appgroup database.db
```

### Encryption

SQLite doesn't have built-in encryption, but you can use:

- **SQLCipher**: Commercial extension for encryption at rest
- **Filesystem encryption**: Encrypt entire disk/volume
- **Application-level encryption**: Encrypt sensitive fields before storing

```typescript
// Example: Encrypt sensitive data before storing
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
}

// Store encrypted data in database
await prisma.user.create({
  data: {
    email: 'user@example.com',
    ssn: encrypt(ssn), // Encrypted sensitive field
  },
});
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "database is locked"

**Cause**: Another connection has an active write transaction

**Solutions**:

```typescript
// 1. Set busy timeout
db.pragma('busy_timeout = 5000');

// 2. Enable WAL mode
db.pragma('journal_mode = WAL');

// 3. Keep transactions short
db.transaction(() => {
  // Do work quickly
})();
```

#### Issue 2: "Unable to open database file"

**Cause**: File permissions or directory doesn't exist

**Solutions**:

```typescript
import fs from 'fs';
import path from 'path';

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
```

#### Issue 3: "Disk I/O error"

**Cause**: Corrupted database or filesystem issue

**Solutions**:

```sql
-- Check integrity
PRAGMA integrity_check;

-- If corrupted, try recovery
.recover database.db

-- Restore from backup
```

#### Issue 4: "Too many SQL variables"

**Cause**: SQLite has a limit of 999 parameters per query

**Solution**:

```typescript
// ❌ Bad: Single query with 1000+ parameters
await prisma.user.createMany({
  data: users, // 1000+ users
});

// ✅ Good: Batch in chunks
const chunkSize = 500;
for (let i = 0; i < users.length; i += chunkSize) {
  const chunk = users.slice(i, i + chunkSize);
  await prisma.user.createMany({ data: chunk });
}
```

#### Issue 5: "Database file grows too large"

**Solutions**:

```sql
-- Reclaim unused space
VACUUM;

-- Auto-vacuum mode
PRAGMA auto_vacuum = FULL;

-- Check file size
PRAGMA page_count;
PRAGMA page_size;
-- Size = page_count * page_size
```

### Debug Mode

```typescript
// Enable query logging with Prisma
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Enable verbose mode with better-sqlite3
const db = new Database('database.db', {
  verbose: console.log,
});
```

---

## SQLite vs PostgreSQL

| Feature            | SQLite                       | PostgreSQL                   |
| ------------------ | ---------------------------- | ---------------------------- |
| **Setup**          | Zero config, single file     | Server install & config      |
| **Concurrency**    | Single writer                | Many concurrent writers      |
| **Scalability**    | Single machine, <1TB         | Multi-server, petabytes      |
| **Performance**    | Fast for local access        | Fast for client/server       |
| **Transactions**   | Full ACID                    | Full ACID                    |
| **Features**       | Subset of SQL                | Full SQL with extensions     |
| **Best For**       | Local apps, embedded systems | Multi-user, high-concurrency |
| **Deployment**     | No separate process          | Separate server process      |
| **Backup**         | Simple file copy             | pg_dump, pg_basebackup       |
| **Network**        | Local only (no network FS)   | Network-native               |
| **Administration** | None required                | DBA skills helpful           |

**Migration Path**: Prisma makes it easy to switch from SQLite to PostgreSQL - just change the `provider` in `schema.prisma` and update the connection URL.

---

## Performance Benchmarks

**Typical SQLite Performance** (single-threaded):

- **Inserts**: 50,000 - 100,000 per second (in transaction)
- **Reads**: 100,000 - 500,000 per second
- **Updates**: 40,000 - 80,000 per second (in transaction)
- **Database Size**: Up to 281 TB (practical limit ~1 TB)

**Optimization Tips**:

- Use transactions for batches
- Enable WAL mode
- Increase cache size
- Use prepared statements
- Add indexes to frequently queried columns

---

## References

- **Official Website**: https://www.sqlite.org
- **Documentation**: https://www.sqlite.org/docs.html
- **SQL Syntax**: https://www.sqlite.org/lang.html
- **WAL Mode**: https://www.sqlite.org/wal.html
- **Appropriate Uses**: https://www.sqlite.org/whentouse.html
- **better-sqlite3 (Node.js)**: https://github.com/WiseLibs/better-sqlite3
- **Prisma SQLite**: https://www.prisma.io/docs/orm/overview/databases/sqlite

---

## Next Steps

1. Review [Prisma documentation](../prisma/README.md) for ORM integration
2. Read [Repository Pattern](../codebase/development-guide.md#repository-pattern) for architecture
3. Set up SQLite with Prisma: `npx prisma init --datasource-provider sqlite`
4. Enable WAL mode in connection string
5. Create migrations and implement repositories
6. Write integration tests with in-memory SQLite

---

**Last Updated**: January 2026  
**Version**: SQLite 3.47+
