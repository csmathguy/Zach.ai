# Setup

Install (Windows)

- Node/npm installed
- Global install: `npm install -g pm2`

Start apps

- One-off: `pm2 start npm --name zach-staging-frontend -- run start`
- From script: `pm2 start ./backend/dist/server.js --name zach-staging-backend`
- From config: `pm2 start ecosystem.config.js`

Root-level commands (from repo root)

- Setup deps: `npm run setup` (installs frontend and backend)
- Staging dev: `npm run dev` (runs frontend:5173 + backend:3000)
- Main build: `npm run build` (builds both)
- Main start: `npm run start:main` (backend serves built frontend on 8080)
- PM2 start (optional): `pm2 start ecosystem.config.js` then `pm2 save`

Persist across restarts

- Save current process list: `pm2 save`
- Restore manually: `pm2 resurrect`
- Windows startup: prefer Task Scheduler to run `pm2 resurrect` at login; or see pm2 installer (link below).

Common commands

- List: `pm2 list` / Dashboard: `pm2 monit`
- Logs: `pm2 logs` / `pm2 logs <name>`
- Restart: `pm2 restart <name>` / Reload: `pm2 reload <name>`
- Stop/Delete: `pm2 stop <name>` / `pm2 delete <name>`

Ecosystem config

- Generate: `pm2 init simple` → creates `ecosystem.config.js`
- Run specific env: `pm2 start ecosystem.config.js --env production`
- Act on subset: `pm2 start ecosystem.config.js --only api-app`

Links

- Process management: https://pm2.keymetrics.io/docs/usage/process-management/
- Ecosystem file: https://pm2.keymetrics.io/docs/usage/application-declaration/
- Startup/persistence: https://pm2.keymetrics.io/docs/usage/startup/
- Logs: https://pm2.keymetrics.io/docs/usage/log-management/
- PM2 GitHub: https://github.com/Unitech/pm2
