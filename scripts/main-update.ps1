# Pulls latest changes, rebuilds, and reloads main
param()

Push-Location (Split-Path $PSScriptRoot)
try {
  git pull
  npm run setup
  npm run build
  if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 reload main
  } else {
    npx pm2 reload main
  }
} finally { Pop-Location }
