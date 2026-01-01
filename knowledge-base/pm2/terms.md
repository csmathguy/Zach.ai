# Key Terms

- Process: A running app instance supervised by PM2.
- Ecosystem file: Declarative config (ecosystem.config.js) defining apps, envs, logs.
- Fork mode: Single process execution (default).
- Cluster mode: Multiple instances; PM2 manages workers; enables scaling and graceful reload.
- Reload: Zero-downtime replace of process(es); app should support signals.
- Restart: Stop then start; may cause brief downtime.
- Save/Resurrect: Persist and restore the process list across restarts.
- Startup: Init scripts to auto-launch PM2; on Windows, use Task Scheduler or community installer.
- Monit: Terminal dashboard for CPU/memory and status.
- Logrotate: Rotate logs via `pm2-logrotate` module or native logrotate.
