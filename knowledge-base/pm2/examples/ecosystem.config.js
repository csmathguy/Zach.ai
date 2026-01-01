module.exports = {
  apps: [
    {
      name: 'zach-staging-frontend',
      script: 'npm',
      args: 'run start',
      cwd: './frontend',
      env: {
        PORT: 5173,
      },
      watch: false,
      max_memory_restart: '512M',
      out_file: null,
      error_file: null,
    },
    {
      name: 'zach-staging-backend',
      script: './backend/dist/server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'zach-main',
      script: './dist/server.js',
      cwd: './deploy/current/backend',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      max_memory_restart: '512M',
    },
  ],
};
