# SQLite Database Tools

**Project**: Zach.ai Database Foundation  
**Purpose**: Documentation for accessing and managing SQLite databases in this project  
**Location**: Development databases in `backend/dev.db` and `backend/prod.db`

---

## Current Database Files

- **Development**: `backend/dev.db` (cleared frequently for testing)
- **Production**: `backend/prod.db` (deployed, migrations only, data preserved)

---

## Command-Line Access

### Option 1: SQLite3 CLI

**Install** (Windows):

```powershell
# Download from official SQLite website
# https://www.sqlite.org/download.html
# Get "sqlite-tools-win-x64-*.zip" or "sqlite-tools-win32-x86-*.zip"

# Extract sqlite3.exe to a directory in your PATH
# Or run from extracted location
```

**Usage**:

```bash
cd backend
sqlite3 dev.db

# Useful commands:
.tables                    # List all tables
.schema users             # Show table structure
.schema                   # Show all schemas
SELECT * FROM users;      # Query data
.headers on               # Show column headers
.mode column              # Format output as columns
.exit                     # Exit
```

### Option 2: Node.js REPL (better-sqlite3)

Already installed! No additional setup needed.

```bash
cd backend
node
```

```javascript
const db = require('better-sqlite3')('dev.db');

// List tables
db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();

// Show schema
db.prepare(`SELECT sql FROM sqlite_master WHERE name='users'`).get();

// Query data
db.prepare('SELECT * FROM users').all();

// Count records
db.prepare('SELECT COUNT(*) as count FROM users').get();

// Close connection
db.close();
```

### Option 3: Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens web UI at `http://localhost:5555` - visual database browser with:

- ✅ Table browsing
- ✅ Data viewing/editing
- ✅ Query builder
- ✅ Relationship visualization

**Note**: Ignore the `?journal_mode=WAL` error in console - Studio works fine.

---

## GUI Database Tools

### Recommended: DB Browser for SQLite (Free)

**Download**: https://sqlitebrowser.org/dl/

**Features**:

- ✅ Visual table designer
- ✅ SQL query editor with syntax highlighting
- ✅ Data browser and editor
- ✅ Import/Export (CSV, SQL)
- ✅ Database schema visualization
- ✅ No installation required (portable version available)

**Usage**:

1. Download and install
2. Open Database → `C:\Users\csmat\source\repos\Zach.ai\backend\dev.db`
3. Browse data, run queries, view schema

### Alternative: DBeaver (Free, Universal)

**Download**: https://dbeaver.io/download/

**Features**:

- ✅ Supports SQLite + 80+ other databases
- ✅ Advanced SQL editor with autocomplete
- ✅ ERD (Entity Relationship Diagram) generator
- ✅ Data export/import tools
- ✅ Query history and saved scripts

**Setup**:

1. Install DBeaver
2. New Connection → SQLite
3. Path: `C:\Users\csmat\source\repos\Zach.ai\backend\dev.db`

### Alternative: DataGrip (Paid, JetBrains)

**Download**: https://www.jetbrains.com/datagrip/

**Features**:

- ✅ Professional-grade SQL IDE
- ✅ Intelligent query completion
- ✅ Schema refactoring tools
- ✅ Version control integration
- ✅ 30-day free trial

---

## Quick Testing Scripts

### Clear Development Database

```bash
cd backend
node -e "const db = require('better-sqlite3')('dev.db'); ['action_assignees','action_thoughts','project_thoughts','actions','projects','thoughts','users'].forEach(t => db.prepare('DELETE FROM ' + t).run()); console.log('✅ Cleared all data')"
```

### View Record Counts

```bash
cd backend
node -e "const db = require('better-sqlite3')('dev.db'); ['users','thoughts','projects','actions'].forEach(t => { const c = db.prepare('SELECT COUNT(*) as count FROM ' + t).get(); console.log(t + ':', c.count); })"
```

### Backup Database

```powershell
# Development backup
Copy-Item backend/dev.db backend/dev.db.backup

# Restore backup
Copy-Item backend/dev.db.backup backend/dev.db
```

---

## Deployment Database Strategy

### Two-Database Approach

**Why Two Databases?**

- Separation of concerns: testing vs production
- Data safety: never accidentally clear production
- Different workflows: interactive dev vs automated prod

### Development Database (`dev.db`)

- **Purpose**: Local testing, experimentation, frequent data clearing
- **Location**: `backend/dev.db`
- **Safe to Clear**: ✅ YES - can be reset anytime
- **Migrations**: `npx prisma migrate dev` (interactive, creates new migrations)
- **Workflow**:
  1. Make schema changes
  2. Create migration: `npx prisma migrate dev --name add_feature`
  3. Test with dev.db
  4. Reset if needed: `npx prisma migrate reset`

### Production Database (`prod.db`)

- **Purpose**: Deployed application with real user data
- **Location**: `backend/prod.db` OR `deploy/current/backend/prisma/prod.db`
- **Safe to Clear**: ❌ **NEVER** - data must persist
- **Migrations**: `npx prisma migrate deploy` (non-interactive, safe for CI/CD)
- **Workflow**:
  1. Migrations tested in development first
  2. Deployment script automatically:
     - Creates database if doesn't exist
     - Applies pending migrations if exists
     - **Preserves all existing data**
  3. Backup created before migrations
  4. Rollback available if migration fails

### Migration Commands Reference

```bash
# DEVELOPMENT - Create and apply migration
cd backend
npx prisma migrate dev --name add_user_profile

# DEVELOPMENT - Reset database (DESTRUCTIVE - dev only!)
npx prisma migrate reset

# PRODUCTION - Apply pending migrations (safe, preserves data)
cd backend
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# View migration history
sqlite3 dev.db "SELECT * FROM _prisma_migrations;"
```

### Deployment Flow (Automated)

**Scenario 1: Fresh Deployment (No Database)**

```powershell
# main-deploy.ps1 automatically:
1. Detects no prod.db exists
2. Runs: npx prisma migrate deploy
3. Result: Database created with all migrations applied
4. Copies prod.db to deploy snapshot
```

**Scenario 2: Incremental Deployment (Database Exists)**

```powershell
# main-deploy.ps1 automatically:
1. Detects prod.db exists
2. Creates backup: prod.db.20260102-143022.backup
3. Runs: npx prisma migrate deploy
4. Result: Only NEW migrations applied, existing data preserved
5. Copies updated prod.db to deploy snapshot
```

**What `npx prisma migrate deploy` Does**:

- ✅ Creates database if doesn't exist
- ✅ Applies only pending (unapplied) migrations
- ✅ Preserves all existing data
- ✅ Non-interactive (safe for scripts)
- ✅ Idempotent (safe to run multiple times)
- ❌ Does NOT create new migrations
- ❌ Does NOT reset or clear data
- ❌ Does NOT prompt for input

---

## Database Backup & Restore

### Automatic Backups (Production)

**When**: Before every deployment (automatically via main-deploy.ps1)

**Format**: `prod.db.YYYYMMDD-HHMMSS.backup`

**Example**: `prod.db.20260102-143022.backup`

### Manual Backup

```powershell
# Development database
Copy-Item backend/dev.db backend/dev.db.backup

# Production database
Copy-Item backend/prod.db backend/prod.db.$(Get-Date -Format "yyyyMMdd-HHmmss").backup

# Backup includes WAL files (if using WAL mode)
Copy-Item backend/prod.db-wal backend/prod.db-wal.backup -ErrorAction SilentlyContinue
```

### Restore from Backup

```powershell
# Using db-restore.ps1 script (preferred)
.\scripts\database\db-restore.ps1 -BackupPath "backend\prod.db.20260102-143022.backup"

# Manual restore
Copy-Item backend/prod.db.20260102-143022.backup backend/prod.db -Force

# Remember to restart application
pm2 restart main
```

### Backup Retention Policy

- **Keep**: Backups for 7 days minimum
- **Archive**: Major milestone backups (pre-major-release)
- **Store**: Outside of `backend/` directory for safety
- **Cleanup**: Automated script to remove old backups (>7 days)

---

## Migration Rollback Strategy

### If Deployment Fails During Migration

**Automatic**: Deployment script exits with error, application not restarted

**Manual Recovery**:

```powershell
1. Stop application:
   pm2 stop main

2. Restore database:
   .\scripts\database\db-restore.ps1 -BackupPath "backend\prod.db.TIMESTAMP.backup"

3. Verify restoration:
   sqlite3 backend/prod.db "SELECT COUNT(*) FROM users;"

4. Restart application:
   pm2 restart main

5. Verify health check:
   curl http://localhost:8080/health
```

### If Application Fails After Successful Migration

**Scenario**: Migration succeeded, but application has bugs/errors

**Options**:

1. **Fix Forward** (preferred if possible):
   - Deploy hotfix with bug fixes
   - Keep database as-is (migration was correct)

2. **Rollback Database + Application**:
   ```powershell
   pm2 stop main
   .\scripts\database\db-restore.ps1 -BackupPath "backend\prod.db.TIMESTAMP.backup"
   git checkout previous-tag
   npm run deploy
   ```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] All migrations tested in development (`dev.db`)
- [ ] Schema changes reviewed and approved
- [ ] Migration is backward-compatible (if possible)
- [ ] Database backup script tested (`db-backup.ps1`)
- [ ] Rollback procedure documented and tested
- [ ] Team notified of deployment window
- [ ] Downtime window scheduled (if needed)

### During Deployment

- [ ] Application stopped: `pm2 stop main`
- [ ] Database backup created automatically (main-deploy.ps1)
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Migration status verified: `npx prisma migrate status`
- [ ] Database copied to snapshot: `deploy/current/backend/prisma/`
- [ ] Application restarted: `pm2 restart main`
- [ ] Health check passed: `curl http://localhost:8080/health`
- [ ] Smoke test passed: Manual verification of key features

### Post-Deployment

- [ ] Monitor logs: `pm2 logs main --lines 100 --nostream`
- [ ] Verify database queries working (test read/write operations)
- [ ] Check application metrics (memory, CPU via `pm2 monit`)
- [ ] Monitor error logs for 15 minutes
- [ ] Archive backup (move to safe location, keep for 7 days)
- [ ] Document any issues or observations
- [ ] Notify team of successful deployment

### Rollback (if needed)

- [ ] Stop application immediately: `pm2 stop main`
- [ ] Restore database: `.\scripts\database\db-restore.ps1 -BackupPath "..."`
- [ ] Verify restoration: Query critical tables
- [ ] Deploy previous application version
- [ ] Restart application: `pm2 restart main`
- [ ] Verify health check passes
- [ ] Document incident for retrospective
- [ ] Schedule post-mortem meeting

---

## Advanced: Database Health Monitoring

### Quick Health Check

```bash
# Check if database is accessible
sqlite3 backend/prod.db "SELECT 1;"

# Count records in key tables
sqlite3 backend/prod.db "
SELECT 'users' as table, COUNT(*) as count FROM users
UNION ALL SELECT 'thoughts', COUNT(*) FROM thoughts
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'actions', COUNT(*) FROM actions;
"

# Check for corruption
sqlite3 backend/prod.db "PRAGMA integrity_check;"
```

### Database Size Monitoring

```powershell
# Check database size
Get-Item backend/prod.db | Select-Object Name, Length

# Check with WAL mode files
Get-ChildItem backend/prod.db* | Select-Object Name, Length | Format-Table -AutoSize
```

### Migration History

```bash
# View all applied migrations
sqlite3 backend/prod.db "SELECT migration_name, started_at, finished_at FROM _prisma_migrations ORDER BY started_at DESC;"

# Check for failed migrations
sqlite3 backend/prod.db "SELECT * FROM _prisma_migrations WHERE finished_at IS NULL;"
```

---

## Troubleshooting

### Issue: Database Locked

**Error**: `database is locked`

**Cause**: Another process is accessing the database

**Solution**:

```powershell
# Stop application
pm2 stop main

# Wait for WAL checkpoint
Start-Sleep -Seconds 5

# Retry operation
npx prisma migrate deploy
```

### Issue: Migration Failed Partially

**Error**: Migration applied but not marked as finished

**Solution**:

```bash
# Check migration table
sqlite3 prod.db "SELECT * FROM _prisma_migrations WHERE finished_at IS NULL;"

# If migration actually succeeded, mark as finished manually (CAREFUL!)
# Better: Restore backup and retry deployment
```

### Issue: Database File Not Found

**Error**: `Can't reach database server at file:./prod.db`

**Cause**: Wrong working directory or DATABASE_URL

**Solution**:

```powershell
# Check current directory
pwd

# Verify DATABASE_URL
Get-Content backend/.env | Select-String DATABASE_URL

# Ensure running from correct directory
cd backend
npx prisma migrate deploy
```

---

## References

- **Prisma Migrate**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **SQLite Documentation**: https://www.sqlite.org/docs.html
- **DB Browser for SQLite**: https://sqlitebrowser.org/
- **Deployment Checklist**: See `work-items/O1-database-foundation/dev/task-list.md` Section 3.3
