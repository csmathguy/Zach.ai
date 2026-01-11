# Deploy built artifacts to snapshot directory and reload PM2
# TODO: Add optional coverage generation before deploy
#   - Add -GenerateCoverage switch parameter
#   - Call generate-coverage.ps1 -Project all before build
#   - Ensure coverage files are included in frontend build
param(
  [switch]$SeedAdmin
)

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

  # Copy Prisma schema and database
  Write-Host "[deploy] Copying database files..." -ForegroundColor Cyan
  $prismaDest = "$deployRoot/backend/prisma"
  New-Item -ItemType Directory -Force -Path $prismaDest | Out-Null
  
  # Copy schema (required for Prisma Client)
  if (Test-Path "backend/prisma/schema.prisma") {
    Copy-Item -Path "backend/prisma/schema.prisma" -Destination $prismaDest -Force
  }

  # Copy migrations directory (required for prisma migrate deploy)
  if (Test-Path "backend/prisma/migrations") {
    Copy-Item -Path "backend/prisma/migrations" -Destination $prismaDest -Recurse -Force
  }

  # Copy package.json to snapshot, then run npm install there
  Write-Host "[deploy] Copying backend package.json..." -ForegroundColor Cyan
  Copy-Item -Path "backend/package.json" -Destination "$deployRoot/backend/" -Force
  
  Write-Host "[deploy] Installing production dependencies in snapshot..." -ForegroundColor Cyan
  Push-Location "$deployRoot/backend"
  npm install --production --no-save
  Pop-Location

  # Database setup AFTER snapshot is ready
  Write-Host "[deploy] Setting up production database..." -ForegroundColor Cyan
  
  # Get absolute path to deployment directory
  $deployFullPath = Resolve-Path $deployRoot | Select-Object -ExpandProperty Path
  $prodDbPath = "$deployFullPath\backend\prod.db"
  
  # Backup existing production database if present in deployment
  if (Test-Path $prodDbPath) {
    Write-Host "[deploy] Creating database backup..." -ForegroundColor Yellow
    & "$PSScriptRoot/database/db-backup.ps1" -DatabasePath $prodDbPath
  }
  
  # Run migrations using shared db-migrate script
  $dbMigrateScript = Join-Path $PSScriptRoot "database/db-migrate.ps1"
  Write-Host "[deploy] Applying migrations via $dbMigrateScript ..." -ForegroundColor Cyan
  & $dbMigrateScript -Environment production -DatabasePath $prodDbPath
  if ($LASTEXITCODE -ne 0) { throw "Database migration failed" }
  Write-Host "[deploy] Production database ready at $deployRoot/backend/prod.db" -ForegroundColor Green

  if ($SeedAdmin) {
    Write-Host "[deploy] Seeding admin user..." -ForegroundColor Cyan
    Push-Location backend
    try {
      $env:DATABASE_URL = "file:$prodDbPath"
      npx prisma db seed
      if ($LASTEXITCODE -ne 0) { throw "Database seeding failed" }
    } finally {
      Remove-Item env:DATABASE_URL -ErrorAction SilentlyContinue
      Pop-Location
    }
  } else {
    Write-Host "[deploy] Skipping admin seed (pass -SeedAdmin to enable)." -ForegroundColor Yellow
  }

  Write-Host "[deploy] Snapshot created at: $deployRoot" -ForegroundColor Green
  Write-Host "[deploy] Starting/reloading PM2 process..." -ForegroundColor Cyan

  if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 startOrReload ecosystem.config.js --only main --env production --update-env
    pm2 save
  } else {
    npx pm2 startOrReload ecosystem.config.js --only main --env production --update-env
    npx pm2 save
  }

  Write-Host "[deploy] Deployment complete! Main is now serving from snapshot." -ForegroundColor Green
} finally { Pop-Location }
