# PowerShell Helper Scripts

Automate common workflows for staging, production, and database management.

## Table of Contents

- [Deployment Scripts](#deployment-scripts)
- [Database Scripts](#database-scripts)
- [Environment Setup](#environment-setup)

---

## Deployment Scripts

### `staging-start.ps1`

Start both frontend and backend in development mode using PM2 (staging environment).

```powershell
./scripts/staging-start.ps1
```

- Installs dependencies (if needed).
- Starts `zach-staging-frontend` on port 5173 and `zach-staging-backend` on port 3000.
- Both processes will auto-restart on code changes (via `npm run dev`).

**Access staging:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/hello

### `main-deploy.ps1`

Build the frontend and backend, copy artifacts to a snapshot directory (`deploy/current`), and reload the main PM2 process. Main serves from this snapshot, allowing you to work on code in the repo without affecting the live site.

```powershell
./scripts/main-deploy.ps1
```

- Runs `npm run setup` and `npm run build`.
- Copies `frontend/dist` → `deploy/current/frontend/dist`.
- Copies `backend/dist` → `deploy/current/backend/dist` (plus package.json and node_modules).
- Reloads `zach-main` via PM2 so it picks up the new snapshot.
- Saves PM2 process list.

**TODO (Future Enhancement):** Add optional `-GenerateCoverage` flag to automatically run test coverage and include reports in deployment.

**Access main:**

- http://localhost:8080

### `generate-coverage.ps1`

Generate Jest test coverage and automatically copy coverage JSON files to frontend/public/coverage/ for display in the Codebase Analysis Dashboard.

```powershell
# Generate coverage for frontend only
./scripts/generate-coverage.ps1 -Project frontend

# Generate coverage for backend only
./scripts/generate-coverage.ps1 -Project backend

# Generate coverage for both projects
./scripts/generate-coverage.ps1 -Project all
```

**What it does:**

1. Runs `npm run test:coverage` in specified project(s)
2. Copies `{project}/coverage/coverage-summary.json` to `frontend/public/coverage/{project}-coverage-summary.json`
3. Makes coverage data available at `/coverage/{project}-coverage-summary.json` route

**View Results:**

- Navigate to http://localhost:5173/codebase-analysis (dev) or http://localhost:8080/codebase-analysis (production)
- Select Coverage tab
- Toggle between Frontend/Backend sub-tabs

**npm Shortcuts:**

```bash
# From root
npm run coverage:generate      # Generate all
npm run coverage:frontend      # Frontend only
npm run coverage:backend       # Backend only

# From project directory
npm run test:coverage:export   # Generate and export to dashboard
```

### `main-start.ps1`

Build and start main (production) from the repository using PM2. Use `main-deploy.ps1` for production deployments; this script is for initial setup or testing.

```powershell
./scripts/main-start.ps1
```

- Runs `npm run setup` to install subproject deps.
- Runs `npm run build` to build frontend and backend.
- Starts `zach-main` via PM2 in production mode on port 8080.
- Saves PM2 process list so it can be restored after reboot with `pm2 resurrect`.

### `main-reload.ps1`

Gracefully reload the main process (zero-downtime restart).

```powershell
./scripts/main-reload.ps1
```

Useful after making incremental backend changes without full rebuild.

### `main-update.ps1`

Pull latest code, rebuild, and reload main.

```powershell
./scripts/main-update.ps1
```

- Pulls from `origin main`.
- Installs deps and rebuilds.
- Reloads PM2 process and saves state.

### `setup-auto-start.ps1`

Register a Windows Task Scheduler task to automatically run `pm2 resurrect` at user login, ensuring `zach-main` restarts after reboot.

```powershell
./scripts/setup-auto-start.ps1
```

---

## Database Scripts

**Note**: Database scripts will be created as part of the O1-database-foundation work item.

### `db-init.ps1` (Planned)

Initialize Prisma and create database from scratch. **One-command setup for new developers.**

```powershell
# Initialize with default settings (development)
./scripts/db-init.ps1

# Initialize for specific environment
./scripts/db-init.ps1 -Environment production

# Reset existing database
./scripts/db-init.ps1 -Reset
```

**What it does:**

- Validates environment (checks for backend/package.json)
- Installs Prisma dependencies if missing
- Generates Prisma Client
- Creates SQLite database file
- Runs initial migrations
- Provides success/error feedback

**npm Shortcut:**

```bash
npm run db:init
```

### `db-migrate.ps1` (Planned)

Manage database migrations (create, apply, deploy).

```powershell
# Create a new migration
./scripts/db-migrate.ps1 -Action create -Name "add_users_table"

# Apply migrations (development)
./scripts/db-migrate.ps1 -Action apply

# Deploy migrations (production)
./scripts/db-migrate.ps1 -Action deploy

# Show migration status
./scripts/db-migrate.ps1 -Action status
```

**What it does:**

- Create: Generates new migration file
- Apply: Runs pending migrations (dev mode with db push)
- Deploy: Runs migrations safely in production
- Status: Shows applied and pending migrations

**npm Shortcuts:**

```bash
npm run db:migrate              # Apply in dev
npm run db:migrate:create       # Create new migration
npm run db:migrate:deploy       # Deploy in production
```

### `db-reset.ps1` (Planned)

Reset database to clean state.

```powershell
# Reset and keep migrations
./scripts/db-reset.ps1

# Reset and seed with test data
./scripts/db-reset.ps1 -Seed

# Show what would be deleted (dry-run)
./scripts/db-reset.ps1 -WhatIf
```

**What it does:**

- Drops all tables
- Re-runs migrations from scratch
- Optionally seeds test data
- Confirms before destructive actions

**npm Shortcut:**

```bash
npm run db:reset
```

### `db-seed.ps1` (Planned)

Populate database with test data.

```powershell
# Seed with default data
./scripts/db-seed.ps1

# Seed with specific dataset
./scripts/db-seed.ps1 -Dataset "full"

# Show what would be created (dry-run)
./scripts/db-seed.ps1 -WhatIf
```

**What it does:**

- Creates sample users
- Creates sample thoughts
- Creates sample projects and actions
- Links entities with relationships

**npm Shortcut:**

```bash
npm run db:seed
```

### `db-studio.ps1` (Planned)

Launch Prisma Studio (database GUI).

```powershell
# Launch on default port (5555)
./scripts/db-studio.ps1

# Launch on specific port
./scripts/db-studio.ps1 -Port 5566
```

**What it does:**

- Opens Prisma Studio web interface
- Handles port conflicts
- Opens browser automatically

**npm Shortcut:**

```bash
npm run db:studio
```

### `db-backup.ps1` (Planned)

Create timestamped backup of database.

```powershell
# Create backup in default location
./scripts/db-backup.ps1

# Create backup in specific location
./scripts/db-backup.ps1 -Path "C:/backups"

# Create compressed backup
./scripts/db-backup.ps1 -Compress
```

**What it does:**

- Copies database file with timestamp
- Optional compression (.zip)
- Validates backup integrity

**npm Shortcut:**

```bash
npm run db:backup
```

### `db-restore.ps1` (Planned)

Restore database from backup.

```powershell
# List available backups
./scripts/db-restore.ps1 -List

# Restore latest backup
./scripts/db-restore.ps1

# Restore specific backup
./scripts/db-restore.ps1 -BackupFile "dev.db.2026-01-01_123456.bak"

# Show what would be restored (dry-run)
./scripts/db-restore.ps1 -WhatIf
```

**What it does:**

- Lists available backup files
- Creates backup of current DB before restore
- Restores selected backup
- Validates restored database

**npm Shortcut:**

```bash
npm run db:restore
```

---

## Environment Setup

```powershell
./scripts/setup-auto-start.ps1
```

- Creates a scheduled task named `PM2-Resurrect-Zach`.
- Runs at user login to restore PM2 processes.
- Verify with: `Get-ScheduledTask -TaskName PM2-Resurrect-Zach`
