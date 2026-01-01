# PM2 Knowledge Base

Overview

- PM2 (Process Manager 2) is a Node.js process manager for running and supervising apps: start, stop, restart, reload, logs, monitoring.
- Best suited for local always-on services and simple hosting on a personal machine; complements reverse proxies (NGINX/Caddy) and is separate from Docker.
- We use PM2 to run staging and main instances on separate ports and to auto-restart on login.

Key Capabilities

- Process management: `start`, `restart`, `stop`, `delete`, `reload`, `list`, `monit`.
- Ecosystem config: declarative `ecosystem.config.js` with multiple apps and environments.
- Persistence: `pm2 save`/`pm2 resurrect`; startup scripts (Windows uses installer or Task Scheduler).
- Logs: stream with `pm2 logs`, rotate via `pm2-logrotate`.
- Cluster mode: multi-instance processes, graceful reload.

When to use vs Docker/NGINX

- Use PM2 to run Node processes on host; add NGINX/Caddy in front for proxy/TLS.
- Use Docker Compose for reproducible multi-service environments; skip PM2 inside containers unless necessary.

Files

- overview: setup and usage → [setup.md](setup.md)
- windows: local hosting on Windows → [windows.md](windows.md)
- best practices → [best-practices.md](best-practices.md)
- references → [references.md](references.md)
- terms → [terms.md](terms.md)
- examples → [examples/ecosystem.config.js](examples/ecosystem.config.js)
