<#
.SYNOPSIS
    Reset database (DEVELOPMENT ONLY - DESTRUCTIVE)
.DESCRIPTION
    Deletes the development database and recreates it from scratch.
    **WARNING**: This DELETES ALL DATA. Only use in development.
.PARAMETER Force
    Skip confirmation prompt
.EXAMPLE
    .\db-reset.ps1
    .\db-reset.ps1 -Force
#>
param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "[DB-RESET] ⚠️  DATABASE RESET - DESTRUCTIVE OPERATION ⚠️" -ForegroundColor Red
Write-Host ""

# Safety check: Ensure we're not in production
if ($env:NODE_ENV -eq 'production') {
    Write-Host "[ERROR] Cannot reset database in production environment!" -ForegroundColor Red
    Write-Host "[ERROR] This operation is only allowed in development" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backendPath = Join-Path $repoRoot "backend"
Push-Location $backendPath

try {
    # Check if database exists
    $dbExists = Test-Path "dev.db"
    
    if (-not $dbExists) {
        Write-Host "[INFO] No database to reset - running initialization instead" -ForegroundColor Yellow
        Pop-Location
        & "$PSScriptRoot/db-init.ps1"
        exit 0
    }
    
    # Confirmation prompt
    if (-not $Force) {
        Write-Host "[WARNING] This will DELETE all data in the database" -ForegroundColor Yellow
        Write-Host "[WARNING] This action cannot be undone" -ForegroundColor Yellow
        Write-Host ""
        $response = Read-Host "Are you sure? Type 'yes' to continue"
        
        if ($response -ne 'yes') {
            Write-Host "[CANCELLED] Database reset cancelled" -ForegroundColor Yellow
            Pop-Location
            exit 0
        }
    }
    
    Write-Host ""
    Write-Host "[DB-RESET] Deleting database files..." -ForegroundColor Cyan
    
    # Delete database files (backend/dev.db and WAL files)
    Remove-Item "dev.db" -Force -ErrorAction SilentlyContinue
    Remove-Item "dev.db-journal" -Force -ErrorAction SilentlyContinue
    Remove-Item "dev.db-shm" -Force -ErrorAction SilentlyContinue
    Remove-Item "dev.db-wal" -Force -ErrorAction SilentlyContinue
    
    Write-Host "[SUCCESS] Database files deleted" -ForegroundColor Green
    
    # Recreate database
    Write-Host "[DB-RESET] Recreating database..." -ForegroundColor Cyan
    npx prisma db push --accept-data-loss
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to recreate database" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] Database reset complete!" -ForegroundColor Green
    Write-Host "[INFO] Database is now empty - run db-seed.ps1 to add test data" -ForegroundColor Cyan
    
} catch {
    Write-Host "[ERROR] Reset failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
