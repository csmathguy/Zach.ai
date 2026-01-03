# Database Management Scripts

Automation scripts for SQLite database management with Prisma ORM.

## Prerequisites

- **Node.js**: 18+ (for Prisma)
- **PowerShell**: Windows PowerShell 5.1+ OR PowerShell Core 7+
  - Windows: `powershell.exe` (built-in) or `pwsh.exe` (install separately)
  - npm scripts use `powershell` for Windows PowerShell 5.1 compatibility
- **Prisma**: Installed via `npm install` in backend directory

## Overview

These scripts provide a complete database workflow for development and production deployments. All scripts are idempotent and safe to run multiple times.

## Scripts

### db-init.ps1

Initialize Prisma and create SQLite database.

**Usage**:

```powershell
.\db-init.ps1                      # Development database
.\db-init.ps1 -Environment production  # Production database
```

**What it does**:

- Checks if Prisma is installed
- Validates schema.prisma exists
- Generates Prisma Client
- Creates/updates database using `prisma db push` (dev) or `prisma migrate deploy` (prod)

**Safe to run**: Multiple times (idempotent)

---

### db-check.ps1

Health check script for database validation.

**Usage**:

```powershell
.\db-check.ps1
```

**What it does**:

- Verifies database file exists
- Checks database size
- Validates database is accessible

**Used by**: main-deploy.ps1 to determine if database needs initialization

---

### db-migrate.ps1

Run database migrations (development or production).

**Usage**:

```powershell
.\db-migrate.ps1                          # Development (interactive)
.\db-migrate.ps1 -Environment production  # Production (non-interactive)
.\db-migrate.ps1 -Name "add_user_field"   # Create new migration (dev only)
```

**What it does**:

- **Development**: Creates new migrations with `prisma migrate dev`
- **Production**: Applies pending migrations with `prisma migrate deploy`
- **Data Safety**: Production mode NEVER clears data, only applies new migrations

---

### db-reset.ps1

Reset database to clean state (DEVELOPMENT ONLY).

**Usage**:

```powershell
.\db-reset.ps1        # With confirmation prompt
.\db-reset.ps1 -Force # Skip confirmation
```

**What it does**:

- ⚠️ **DESTRUCTIVE**: Deletes all database files
- Blocks execution if NODE_ENV=production
- Requires confirmation (unless -Force)
- Re-runs db-init.ps1 to recreate schema

**WARNING**: This deletes all data! Use only in development.

---

### db-seed.ps1

Seed database with test data (idempotent).

**Usage**:

```powershell
.\db-seed.ps1
```

**What it does**:

- Runs `prisma/seed.ts` script
- Creates test users, thoughts, projects, actions
- Idempotent: Checks if data exists before seeding

---

### db-studio.ps1

Launch Prisma Studio GUI for database browsing.

**Usage**:

```powershell
.\db-studio.ps1              # Default port 5555
.\db-studio.ps1 -Port 5556   # Custom port
```

**What it does**:

- Opens Prisma Studio in browser
- Provides visual database editor
- Read and write data with GUI

**Access**: http://localhost:5555

---

### db-backup.ps1

Create timestamped backup of database.

**Usage**:

```powershell
.\db-backup.ps1                           # Backup dev.db
.\db-backup.ps1 -DatabasePath backend/prod.db  # Backup specific database
```

**What it does**:

- Creates timestamped backup: `dev.db.YYYYMMDD-HHMMSS.backup`
- Includes WAL files (-shm, -wal) if present
- Used automatically by main-deploy.ps1 before migrations

**Backup retention**: Keep for 7 days minimum

---

### db-restore.ps1

Restore database from backup.

**Usage**:

```powershell
.\db-restore.ps1 -BackupPath backend/dev.db.20260102-143022.backup
.\db-restore.ps1 -BackupPath backend/prod.db.20260102-143022.backup -DatabasePath backend/prod.db
```

**What it does**:

- Restores database from timestamped backup
- Includes WAL files (-shm, -wal)
- Requires confirmation to prevent accidental overwrites

**After restore**: Restart application with `pm2 restart main`

---

## npm Script Shortcuts

From `backend/` directory:

```bash
npm run db:init          # Initialize database
npm run db:check         # Health check
npm run db:migrate       # Run migrations (dev)
npm run db:migrate:prod  # Run migrations (production)
npm run db:reset         # Reset database (DESTRUCTIVE)
npm run db:seed          # Seed test data
npm run db:studio        # Open Prisma Studio GUI
npm run db:backup        # Create backup
npm run db:restore       # Restore from backup (requires -BackupPath)
```

---

## Workflows

### First Time Setup

```powershell
cd backend
npm run db:init          # Create database
npm run db:seed          # Add test data (optional)
npm run db:studio        # Verify in GUI (optional)
```

### Development Workflow

```powershell
# Make schema changes in prisma/schema.prisma
npm run db:migrate       # Create and apply migration
npm test                 # Run tests
```

### Creating a New Migration

```powershell
# After editing schema.prisma
pwsh ../scripts/database/db-migrate.ps1 -Name "add_user_profile"
# Or use Prisma CLI directly:
npx prisma migrate dev --name add_user_profile
```

### Production Deployment

Production database management is handled automatically by `main-deploy.ps1`:

1. **Backup**: Creates timestamped backup if database exists
2. **Check**: Verifies if database exists
3. **Initialize or Migrate**:
   - If no database: Runs `db-init.ps1` (creates fresh database)
   - If exists: Runs `db-migrate.ps1 -Environment production` (applies pending migrations)
4. **Copy**: Database copied to `deploy/current/backend/`
5. **Restart**: PM2 reloads application

**Manual production deployment**:

```powershell
cd backend
npm run db:backup              # Create backup first
npm run db:migrate:prod        # Apply migrations
pm2 restart main               # Restart application
```

### Rollback Procedure

If deployment fails:

```powershell
pm2 stop main                  # Stop application
pwsh scripts/database/db-restore.ps1 -BackupPath backend/dev.db.TIMESTAMP.backup
pm2 restart main               # Restart with restored database
```

---

## Database Files

### Development Database (`dev.db`)

- **Location**: `backend/dev.db`
- **Purpose**: Local testing and development
- **Lifecycle**: Can be cleared frequently (`npm run db:reset`)
- **Migrations**: `npx prisma migrate dev` (interactive)

### Production Database (`prod.db`)

- **Location**: `backend/prod.db` OR `deploy/current/backend/dev.db`
- **Purpose**: Live application data
- **Lifecycle**: **PERSISTENT** - Never cleared, only migrations applied
- **Migrations**: `npx prisma migrate deploy` (non-interactive, safe for CI/CD)
- **Backups**: Created automatically before every deployment

---

## Troubleshooting

### "Database is locked" Error

**Cause**: Another process is accessing the database (Prisma Studio, dev server, tests)

**Solution**:

```powershell
pm2 stop main              # Stop backend if running
# Close Prisma Studio
npm run db:check           # Verify database is accessible
```

### Migration Failed

**Cause**: Schema changes conflict with existing data or constraints

**Solution**:

```powershell
# Development: Reset and try again
npm run db:reset
npm run db:migrate

# Production: Restore backup
pwsh scripts/database/db-restore.ps1 -BackupPath "backend/dev.db.TIMESTAMP.backup"
```

### "Schema.prisma not found"

**Cause**: Running command from wrong directory

**Solution**:

```powershell
cd backend                 # Ensure in backend directory
npm run db:init
```

### Fresh Clone Setup

**Issue**: New developers need database setup

**Solution**:

```powershell
git clone <repo>
cd Zach.ai
npm install                # Root dependencies
cd backend
npm install                # Backend dependencies
npm run db:init            # Create database
npm run db:seed            # Add test data
npm test                   # Verify everything works
```

---

## Safety Features

1. **Production Protection**: db-reset.ps1 blocks execution if NODE_ENV=production
2. **Confirmation Prompts**: Destructive operations require "YES" confirmation
3. **Automatic Backups**: main-deploy.ps1 creates backup before migrations
4. **Idempotent**: All scripts safe to run multiple times
5. **Error Handling**: Scripts exit with proper error codes for CI/CD
6. **Data Preservation**: Production migrations NEVER clear data

---

## CI/CD Integration

These scripts are designed for automation:

```yaml
# Example GitHub Actions
- name: Setup database
  run: |
    cd backend
    npm run db:init

- name: Run migrations
  run: |
    cd backend
    npm run db:migrate:prod

- name: Create backup
  run: |
    cd backend
    npm run db:backup
```

---

## References

- **Prisma Docs**: https://www.prisma.io/docs
- **SQLite Docs**: https://www.sqlite.org/docs.html
- **Knowledge Base**: `knowledge-base/prisma/` and `knowledge-base/sqlite/`
- **Deployment Guide**: `knowledge-base/deployment/`

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review `knowledge-base/prisma/database-structure.md`
3. Review `knowledge-base/sqlite/database-tools.md`
4. Check script output for detailed error messages
