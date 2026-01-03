# Deploy built artifacts to snapshot directory and reload PM2
# TODO: Add optional coverage generation before deploy
#   - Add -GenerateCoverage switch parameter
#   - Call generate-coverage.ps1 -Project all before build
#   - Ensure coverage files are included in frontend build
param()

Push-Location (Split-Path $PSScriptRoot)
try {
  Write-Host "[deploy] Building frontend and backend..." -ForegroundColor Cyan
  npm run setup
  npm run build

  # Database setup BEFORE creating snapshot
  Write-Host "[deploy] Setting up production database..." -ForegroundColor Cyan
  
  # Backup existing database if present
  if (Test-Path "backend/dev.db") {
    Write-Host "[deploy] Creating database backup..." -ForegroundColor Yellow
    & "$PSScriptRoot/database/db-backup.ps1" -DatabasePath "backend/dev.db"
  }
  
  # Check if database exists
  & "$PSScriptRoot/database/db-check.ps1"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[deploy] Database not found, initializing..." -ForegroundColor Yellow
    & "$PSScriptRoot/database/db-init.ps1" -Environment production
  } else {
    Write-Host "[deploy] Database exists, running migrations..." -ForegroundColor Yellow
    & "$PSScriptRoot/database/db-migrate.ps1" -Environment production
  }
  
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[deploy] Database operation failed!" -ForegroundColor Red
    exit 1
  }
  
  Write-Host "[deploy] Database ready" -ForegroundColor Green

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

  # Copy Prisma schema and database
  Write-Host "[deploy] Copying database files..." -ForegroundColor Cyan
  $prismaDest = "$deployRoot/backend/prisma"
  New-Item -ItemType Directory -Force -Path $prismaDest | Out-Null
  
  # Copy schema (required for Prisma Client)
  if (Test-Path "backend/prisma/schema.prisma") {
    Copy-Item -Path "backend/prisma/schema.prisma" -Destination $prismaDest -Force
  }
  
  # Copy database files (dev.db + WAL files)
  if (Test-Path "backend/dev.db") {
    Copy-Item -Path "backend/dev.db*" -Destination "$deployRoot/backend/" -Force
    Write-Host "[deploy] Database copied to snapshot" -ForegroundColor Green
  } else {
    Write-Host "[deploy] WARNING: No database found at backend/dev.db" -ForegroundColor Yellow
  }

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
