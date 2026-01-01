# PowerShell Helper Scripts

Automate common workflows for staging and main (production) environments.

## Scripts

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

- Creates a scheduled task named `PM2-Resurrect-Zach`.
- Runs at user login to restore PM2 processes.
- Verify with: `Get-ScheduledTask -TaskName PM2-Resurrect-Zach`
