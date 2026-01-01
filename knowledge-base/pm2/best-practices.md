# Best Practices

Process & naming

- Use clear `name` per app; avoid duplicates; use `appendEnvToName` when multi-env on one machine.
- Prefer `reload` for zero-downtime when supported; use `restart` when needed.

Ecosystem config

- Keep a single `ecosystem.config.js` under repo root; define staging vs main via `env_*` blocks.
- Limit `watch` to safe files; exclude `node_modules` and build outputs via `ignore_watch`.
- Set `max_memory_restart` to prevent runaway memory; use human sizes (e.g., `512M`).

Logs

- Centralize logs; enable `merge_logs` for clustered apps; consider `pm2-logrotate`.
- Use timestamps (`--time` or `log_date_format`) and trim noise; flush with `pm2 flush` when needed.

Windows startup

- Favor Task Scheduler calling `pm2 resurrect` at login; keep a script that runs `pm2 save` on changes.
- Optionally evaluate community `pm2-installer` for Windows service.

Security & operations

- Don’t run privileged scripts via PM2; keep environment variables in `.env` files.
- Avoid broad `watch` on sensitive folders; review commands before enabling auto-start.
- Back up `$HOME/.pm2` (logs, pids, dumps) periodically if you rely on history.

Parity & orchestration

- For production parity, use Docker Compose; let Compose manage restart policies; skip PM2 inside.
- Use NGINX/Caddy in front of PM2 apps for proxying/TLS and clean hostnames.
