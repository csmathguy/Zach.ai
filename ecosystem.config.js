module.exports = {
  apps: [
    {
      name: 'staging-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      env: { PORT: 5173 },
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'staging-backend',
      script: 'npm',
      args: 'run dev',
      cwd: './backend',
      env: { NODE_ENV: 'development', PORT: 3000 },
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'main',
      script: './dist/server.js',
      cwd: './deploy/current/backend',
      env_production: { NODE_ENV: 'production', PORT: 8080 },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
    },
  ],
};
