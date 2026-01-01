# Windows Guide

Install

- `npm install -g pm2`

Run apps

- Frontend dev (example): `pm2 start npm --name zach-staging-frontend -- run start`
- Backend (example): `pm2 start ./backend/dist/server.js --name zach-staging-backend`
- Main (example): `pm2 start ./backend/dist/server.js --name zach-main --env production`

Persist on login

- Save: `pm2 save`
- Resurrect: `pm2 resurrect`
- Task Scheduler: create a task "PM2 Resurrect" to run `pm2 resurrect` at user logon.
- Alternative: community installer → https://github.com/jessety/pm2-installer

Logs & monitoring

- View: `pm2 logs`, `pm2 logs <name>`; dashboard: `pm2 monit`
- Log files: `%USERPROFILE%\.pm2\logs\*.log`

Update flow

- Update code: `git pull`
- Rebuild frontend/backend as required
- Reload main: `pm2 reload zach-main`

Tips

- Add PowerShell helpers to start/stop groups of apps.
- Keep ports consistent and documented; use `.env.staging` and `.env.main`.
