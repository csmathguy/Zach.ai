# Deploy built artifacts to snapshot directory and reload PM2
param()

Push-Location (Split-Path $PSScriptRoot)
try {
  Write-Host "[deploy] Building frontend and backend..." -ForegroundColor Cyan
  npm run setup
  npm run build

  $deployRoot = "deploy/current"
  $frontendSrc = "frontend/dist"
  $backendSrc = "backend/dist"
  $frontendDest = "$deployRoot/frontend/dist"
  $backendDest = "$deployRoot/backend/dist"

  Write-Host "[deploy] Creating snapshot directories..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $frontendDest | Out-Null
  New-Item -ItemType Directory -Force -Path $backendDest | Out-Null

  Write-Host "[deploy] Copying frontend artifacts..." -ForegroundColor Cyan
  Copy-Item -Path "$frontendSrc/*" -Destination $frontendDest -Recurse -Force

  Write-Host "[deploy] Copying backend artifacts..." -ForegroundColor Cyan
  Copy-Item -Path "$backendSrc/*" -Destination $backendDest -Recurse -Force

  # Copy package.json to snapshot, then run npm install there
  Write-Host "[deploy] Copying backend package.json..." -ForegroundColor Cyan
  Copy-Item -Path "backend/package.json" -Destination "$deployRoot/backend/" -Force
  
  Write-Host "[deploy] Installing production dependencies in snapshot..." -ForegroundColor Cyan
  Push-Location "$deployRoot/backend"
  npm install --production --no-save
  Pop-Location

  Write-Host "[deploy] Snapshot created at: $deployRoot" -ForegroundColor Green
  Write-Host "[deploy] Reloading PM2 process..." -ForegroundColor Cyan

  if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 reload main
    pm2 save
  } else {
    npx pm2 reload main
    npx pm2 save
  }

  Write-Host "[deploy] Deployment complete! Main is now serving from snapshot." -ForegroundColor Green
} finally { Pop-Location }
