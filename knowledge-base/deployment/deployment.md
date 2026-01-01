# Local Deployment Workflow

This document explains the snapshot-based deployment strategy for hosting the production site locally.

## Overview

**Main** (production) runs from a **snapshot** at `deploy/current/`, while **staging** (development) runs directly from the repository. This separation lets you work on code without affecting the live site.

## Architecture

```
Zach.ai/
├── frontend/               # Working copy (staging uses this)
│   ├── src/
│   └── dist/              # Built by npm run build
├── backend/                # Working copy (staging uses this)
│   ├── src/
│   └── dist/              # Built by npm run build
├── deploy/
│   └── current/           # Production snapshot
│       ├── frontend/dist/ # Copied from frontend/dist
│       └── backend/
│           ├── dist/      # Copied from backend/dist
│           ├── package.json
│           └── node_modules/  # Installed via npm install --production
└── ecosystem.config.js    # PM2 config (zach-main points to deploy/current)
```

## Workflow

### 1. **Development (Staging)**

Work in the repository and test with staging:

```powershell
./scripts/staging-start.ps1
```

- Frontend dev server: http://localhost:5173
- Backend dev server: http://localhost:3000

Both watch for changes and auto-restart.

### 2. **Deploy to Production (Main)**

When ready to update the live site:

```powershell
./scripts/main-deploy.ps1
```

This script:

1. Builds frontend and backend
2. Copies artifacts to `deploy/current/`
3. Installs production dependencies in the snapshot
4. Reloads PM2 `zach-main` process (zero-downtime)
5. Saves PM2 process list

Production site: http://localhost:8080

### 3. **Auto-Start on Reboot**

Register a Windows Task Scheduler task to restore PM2 processes at user login:

```powershell
./scripts/setup-auto-start.ps1
```

This ensures `zach-main` restarts automatically after Windows reboot.

## Key Benefits

- **Isolation**: Code changes don't affect the live site until deployed
- **Rollback**: Keep old snapshots for quick rollback (manual copy)
- **Clean state**: Production runs only with production dependencies
- **Zero-downtime**: PM2 `reload` ensures seamless updates

## Commands Reference

| Task                 | Command                          | Description                        |
| -------------------- | -------------------------------- | ---------------------------------- |
| **Start staging**    | `./scripts/staging-start.ps1`    | Run frontend/backend in dev mode   |
| **Deploy main**      | `./scripts/main-deploy.ps1`      | Build, snapshot, reload production |
| **Reload main**      | `./scripts/main-reload.ps1`      | Gracefully reload PM2 process      |
| **Update from git**  | `./scripts/main-update.ps1`      | Pull, build, deploy                |
| **Auto-start setup** | `./scripts/setup-auto-start.ps1` | Configure Task Scheduler           |
| **PM2 status**       | `npx pm2 ls`                     | View running processes             |
| **PM2 logs**         | `npx pm2 logs zach-main`         | Tail production logs               |
| **PM2 stop**         | `npx pm2 stop zach-main`         | Stop production                    |
| **PM2 delete**       | `npx pm2 delete zach-main`       | Remove production process          |

## Backend Configuration

The backend server (`backend/src/server.ts`) checks for static assets in this order:

1. `FRONTEND_DIR` environment variable (if set)
2. `deploy/current/frontend/dist` (snapshot)
3. `frontend/dist` (in-repo fallback)

This ensures main serves from the snapshot after deployment.

## Typical Flow

1. **Make changes** in `frontend/src` or `backend/src`
2. **Test locally** with staging:
   ```powershell
   ./scripts/staging-start.ps1
   ```
3. **Commit** changes when satisfied:
   ```powershell
   git add .
   git commit -m "Feature: ..."
   git push origin main
   ```
4. **Deploy to main**:
   ```powershell
   ./scripts/main-deploy.ps1
   ```
5. **Verify** production: http://localhost:8080

## Troubleshooting

- **Main not starting**: Check logs with `npx pm2 logs zach-main --lines 100`
- **Port conflicts**: Ensure 8080 (main), 5173 (frontend staging), 3000 (backend staging) are available
- **Stale snapshot**: Re-run `./scripts/main-deploy.ps1` to refresh
- **Dependencies missing**: Deploy script runs `npm install --production` in snapshot; check logs if modules are missing

## Future Enhancements

- **Docker**: Optionally run main in a container for better isolation
- **Reverse proxy**: Use Caddy or NGINX to serve on port 80/443 with HTTPS
- **Rollback script**: Automate snapshot versioning and rollback
- **Health checks**: Monitor uptime and auto-restart on failure
