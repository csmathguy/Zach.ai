<#
.SYNOPSIS
    Initialize Prisma database (idempotent)
.DESCRIPTION
    Checks if Prisma is initialized, generates client, and creates/updates database.
    Safe to run multiple times - checks before creating resources.
.PARAMETER Environment
    Target environment (development, production)
.PARAMETER Force
    Force regeneration even if already initialized
.EXAMPLE
    .\db-init.ps1
    .\db-init.ps1 -Environment production
    .\db-init.ps1 -Force
#>
param(
    [ValidateSet('development', 'production')]
    [string]$Environment = 'development',
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "[DATABASE INIT] Starting initialization - Environment: $Environment" -ForegroundColor Cyan
Write-Host ""

# Validate we're in the repo root
if (-not (Test-Path "backend/package.json")) {
    Write-Host "[ERROR] backend/package.json not found. Run from repository root." -ForegroundColor Red
    exit 1
}

# Check if Prisma is installed
Write-Host "[CHECK] Verifying Prisma installation..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path "node_modules/@prisma/client")) {
    Write-Host "[ERROR] Prisma not installed. Run 'npm install' first." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "[SUCCESS] Prisma is installed" -ForegroundColor Green

# Check if schema exists
if (-not (Test-Path "prisma/schema.prisma")) {
    Write-Host "[WARNING] prisma/schema.prisma doesn't exist yet (expected in early development)" -ForegroundColor Yellow
    Write-Host "          This script will work once you create the schema in Day 2" -ForegroundColor Yellow
    Set-Location ..
    Write-Host ""
    Write-Host "[SUCCESS] Prerequisite check passed - ready for Day 2!" -ForegroundColor Green
    exit 0
}

# Generate Prisma Client
Write-Host "[PRISMA] Generating Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "[SUCCESS] Prisma Client generated" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to generate Prisma Client: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Check if database exists
$dbPath = "prisma/dev.db"
$dbExists = Test-Path $dbPath

if ($dbExists -and -not $Force) {
    Write-Host "[SUCCESS] Database already exists: $dbPath" -ForegroundColor Green
    Write-Host "          To recreate, use -Force flag or delete the database manually" -ForegroundColor Yellow
} else {
    # Create or update database
    if ($Environment -eq 'production') {
        Write-Host "[PRISMA] Running production migrations..." -ForegroundColor Yellow
        try {
            npx prisma migrate deploy
            Write-Host "[SUCCESS] Migrations deployed" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] Failed to deploy migrations: $_" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
    } else {
        Write-Host "[PRISMA] Pushing schema to database (development mode)..." -ForegroundColor Yellow
        try {
            npx prisma db push
            Write-Host "[SUCCESS] Database created/updated" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] Failed to create database: $_" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
    }
}

Set-Location ..

Write-Host ""
Write-Host "[SUCCESS] Database initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - Run migrations: npm run db:migrate" -ForegroundColor White
Write-Host "  - Seed data: npm run db:seed" -ForegroundColor White
Write-Host "  - Open Prisma Studio: npm run db:studio" -ForegroundColor White

exit 0
