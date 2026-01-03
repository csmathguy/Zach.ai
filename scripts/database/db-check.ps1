<#
.SYNOPSIS
    Check if database exists and is accessible
.DESCRIPTION
    Health check script for deployment validation. Used by main-deploy.ps1
    to determine if database needs initialization or just migration.
.EXAMPLE
    .\db-check.ps1
    if ($LASTEXITCODE -eq 0) { Write-Host "Database is healthy" }
#>
param()

$ErrorActionPreference = "Stop"

# Navigate to backend directory
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backendPath = Join-Path $repoRoot "backend"
Push-Location $backendPath

try {
    # Check if database file exists (backend/dev.db as per schema config)
    if (-not (Test-Path "dev.db")) {
        Write-Host "[DB-CHECK] Database does not exist" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "[DB-CHECK] Database file found: dev.db" -ForegroundColor Cyan
    
    # Check if file is accessible (can be opened)
    $fileInfo = Get-Item "dev.db"
    if ($fileInfo.Length -gt 0) {
        Write-Host "[SUCCESS] Database is healthy (${fileInfo.Length} bytes)" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "[ERROR] Database file is empty" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Database check failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
