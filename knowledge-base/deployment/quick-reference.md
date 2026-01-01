# Quick Reference Guide

## Essential Commands

### Development

```powershell
npm run dev          # Start dev servers with hot reload
npm run setup        # Install all dependencies
npm run build        # Build frontend and backend
npm run typecheck    # Type check all projects
```

### Production

```powershell
npm run deploy       # Build, snapshot, and reload production
npm run start:main   # Start production process (first time)
```

### PM2 Management

```powershell
npx pm2 ls                    # List all processes
npx pm2 logs main             # View logs for main
npx pm2 logs main --lines 100 # View last 100 lines
npx pm2 monit                 # Monitor CPU/memory
npx pm2 describe main         # Detailed process info
npx pm2 restart main          # Restart process
npx pm2 reload main           # Zero-downtime reload
npx pm2 stop main             # Stop process
npx pm2 delete main           # Remove process
npx pm2 save                  # Save process list
npx pm2 resurrect             # Restore saved processes
```

## URLs

| Environment  | URL                   | Description                     |
| ------------ | --------------------- | ------------------------------- |
| Dev Frontend | http://localhost:5173 | Vite dev server (hot reload)    |
| Dev Backend  | http://localhost:3000 | Express dev server (hot reload) |
| Production   | http://localhost:8080 | PM2-managed production          |

## File Structure

```
Zach.ai/
├── frontend/              # Frontend source
│   ├── src/              # TypeScript source
│   └── dist/             # Built output
├── backend/              # Backend source
│   ├── src/              # TypeScript source
│   └── dist/             # Built output
├── deploy/current/       # Production snapshot
│   ├── frontend/dist/    # Deployed frontend
│   └── backend/          # Deployed backend
├── scripts/              # Helper PowerShell scripts
├── docs/                 # Documentation
├── ecosystem.config.js   # PM2 configuration
└── package.json          # Root npm scripts
```

## Common Tasks

### Make a change and test

```powershell
# 1. Start dev
npm run dev

# 2. Edit code (changes appear instantly)
# 3. Commit when satisfied
git add .
git commit -m "Feature: description"
```

### Deploy to production

```powershell
# 1. Ensure on main branch
git checkout main
git pull origin main

# 2. Deploy
npm run deploy

# 3. Verify
# Open http://localhost:8080
```

### View what's running

```powershell
npx pm2 ls
npx pm2 logs main --lines 20
```

### Clean restart

```powershell
npx pm2 delete main
npm run start:main
```

## Environment Variables

| Variable     | Default                 | Description                  |
| ------------ | ----------------------- | ---------------------------- |
| NODE_ENV     | development             | Environment mode             |
| PORT         | 3000 (dev), 8080 (prod) | Server port                  |
| FRONTEND_DIR | (auto)                  | Override frontend static dir |

## Git Workflow

```powershell
# Feature development
git checkout -b feature/my-feature
# Code, test with npm run dev
git add .
git commit -m "Add: my feature"
git push origin feature/my-feature

# After PR merged to main
git checkout main
git pull origin main
npm run deploy
```

## Troubleshooting

**Port already in use:**

```powershell
# Find process on port 8080
netstat -ano | findstr :8080
# Kill process (replace PID)
taskkill /PID <PID> /F
```

**PM2 not found:**

```powershell
# Use npx to run without global install
npx pm2 ls
```

**Changes not showing in production:**

```powershell
# Rebuild and deploy
npm run deploy
# Force restart if needed
npx pm2 restart main
```

**Clear PM2 logs:**

```powershell
npx pm2 flush
```

## Auto-Start Setup

Task Scheduler task `PM2-Resurrect-Main` runs on login:

```powershell
# Verify task exists
Get-ScheduledTask -TaskName PM2-Resurrect-Main

# Run manually
npx pm2 resurrect

# Re-register if needed
./scripts/setup-auto-start.ps1
```

## Health Checks

```powershell
# Backend health
Invoke-RestMethod http://localhost:8080/health

# API status
Invoke-RestRequest http://localhost:8080/api/status | ConvertFrom-Json

# Full test
Invoke-RestRequest http://localhost:8080/api/hello | ConvertFrom-Json
```
