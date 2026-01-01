# Starts staging (dev) for frontend and backend using PM2
param()

Push-Location (Split-Path $PSScriptRoot)
try {
  npm run setup
  
  # Start staging processes via PM2
  if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 start ecosystem.config.js --only "staging-frontend,staging-backend"
  } else {
    npx pm2 start ecosystem.config.js --only "staging-frontend,staging-backend"
  }
} finally { Pop-Location }
