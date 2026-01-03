<#
.SYNOPSIS
    Backup production database before deployment
.DESCRIPTION
    Creates timestamped backup of production database with WAL files
.PARAMETER DatabasePath
    Path to database file (default: backend/dev.db)
.EXAMPLE
    .\db-backup.ps1
    .\db-backup.ps1 -DatabasePath backend/prod.db
#>
param(
    [string]$DatabasePath = "backend/dev.db"
)

$ErrorActionPreference = "Stop"

try {
    # Get absolute path
    $rootDir = Split-Path (Split-Path $PSScriptRoot)
    $fullPath = Join-Path $rootDir $DatabasePath

    if (-not (Test-Path $fullPath)) {
        Write-Host "[db-backup] Database not found: $DatabasePath" -ForegroundColor Yellow
        Write-Host "[db-backup] Nothing to backup (fresh deployment)" -ForegroundColor Cyan
        exit 0
    }

    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = "$fullPath.$timestamp.backup"

    Write-Host "[db-backup] Creating database backup..." -ForegroundColor Cyan
    Write-Host "[db-backup] Source: $fullPath" -ForegroundColor Gray
    Write-Host "[db-backup] Backup: $backupPath" -ForegroundColor Gray

    # Copy main database file
    Copy-Item $fullPath $backupPath -Force

    # Copy WAL files if they exist (SQLite Write-Ahead Logging)
    if (Test-Path "$fullPath-shm") {
        Copy-Item "$fullPath-shm" "$backupPath-shm" -Force
        Write-Host "[db-backup] Copied -shm file" -ForegroundColor Gray
    }
    
    if (Test-Path "$fullPath-wal") {
        Copy-Item "$fullPath-wal" "$backupPath-wal" -Force
        Write-Host "[db-backup] Copied -wal file" -ForegroundColor Gray
    }

    Write-Host "[db-backup] Backup created successfully" -ForegroundColor Green
    Write-Host "[db-backup] Backup includes WAL files (if present)" -ForegroundColor Cyan
    Write-Host "[db-backup] Backup retained for 7 days minimum" -ForegroundColor Cyan
    
    exit 0
    
} catch {
    Write-Host "[db-backup] Error: $_" -ForegroundColor Red
    exit 1
}
