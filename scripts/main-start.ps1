# Starts main (production) using PM2 and saves process list
param()

Push-Location (Split-Path $PSScriptRoot)
try {
  # Ensure subproject deps are installed
  npm run setup
  # Build frontend and backend
  npm run build
  # Use pm2 if available, else fallback to npx pm2
  if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 start ecosystem.config.js --only "main" --env production
    pm2 save
  } else {
    npx pm2 start ecosystem.config.js --only "main" --env production
    npx pm2 save
  }
} finally { Pop-Location }
