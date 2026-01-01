# Deployment Knowledge Base

Documentation for local development and production deployment workflows.

## Contents

- **[local-hosting.md](local-hosting.md)** - Complete deployment architecture and workflow
- **[testing-checklist.md](testing-checklist.md)** - Step-by-step verification checklist
- **[quick-reference.md](quick-reference.md)** - Common commands and quick lookups

## Quick Start

### Development

```powershell
npm run dev
```

Frontend: http://localhost:5173 (hot reload)  
Backend: http://localhost:3000 (hot reload)

### Production

```powershell
npm run deploy
```

Production: http://localhost:8080 (PM2-managed)

### Commands

- `npm run dev` - Start development with hot reload
- `npm run deploy` - Build and deploy to production
- `npm run start:main` - Start production process
- `npx pm2 ls` - View running processes
- `npx pm2 logs main` - View production logs

## Architecture

- **Staging**: Runs directly from `frontend/` and `backend/` with hot reload
- **Production**: Runs from snapshot at `deploy/current/` via PM2
- **Auto-start**: Windows Task Scheduler resurrects PM2 on login

## Related Documentation

- [PM2 Knowledge Base](../pm2/README.md)
- [Repository Structure](../codebase/structure.md)
