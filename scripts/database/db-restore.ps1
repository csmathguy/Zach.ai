<#
.SYNOPSIS
    Restore database from backup
.DESCRIPTION
    Restores database from timestamped backup including WAL files
.PARAMETER BackupPath
    Path to backup file (e.g., backend/dev.db.20260102-143022.backup)
.PARAMETER DatabasePath
    Target database path (default: backend/dev.db)
.EXAMPLE
    .\db-restore.ps1 -BackupPath backend/dev.db.20260102-143022.backup
    .\db-restore.ps1 -BackupPath backend/prod.db.20260102-143022.backup -DatabasePath backend/prod.db
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupPath,
    
    [string]$DatabasePath = "backend/dev.db"
)

$ErrorActionPreference = "Stop"

try {
    # Get absolute paths
    $rootDir = Split-Path (Split-Path $PSScriptRoot)
    $fullBackupPath = Join-Path $rootDir $BackupPath
    $fullDatabasePath = Join-Path $rootDir $DatabasePath

    if (-not (Test-Path $fullBackupPath)) {
        Write-Host "[db-restore] Backup not found: $BackupPath" -ForegroundColor Red
        exit 1
    }

    Write-Host "[db-restore] WARNING: Restoring database from backup..." -ForegroundColor Yellow
    Write-Host "[db-restore] Source: $fullBackupPath" -ForegroundColor Gray
    Write-Host "[db-restore] Target: $fullDatabasePath" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Gray
    Write-Host "[db-restore] This will OVERWRITE the current database" -ForegroundColor Yellow
    
    $confirmation = Read-Host "[db-restore] Type 'YES' to continue"
    
    if ($confirmation -ne "YES") {
        Write-Host "[db-restore] Restore cancelled" -ForegroundColor Cyan
        exit 0
    }

    Write-Host "[db-restore] Restoring database..." -ForegroundColor Cyan

    # Restore main database file
    Copy-Item $fullBackupPath $fullDatabasePath -Force
    Write-Host "[db-restore] Restored main database file" -ForegroundColor Gray

    # Restore WAL files if they exist
    if (Test-Path "$fullBackupPath-shm") {
        Copy-Item "$fullBackupPath-shm" "$fullDatabasePath-shm" -Force
        Write-Host "[db-restore] Restored -shm file" -ForegroundColor Gray
    }
    
    if (Test-Path "$fullBackupPath-wal") {
        Copy-Item "$fullBackupPath-wal" "$fullDatabasePath-wal" -Force
        Write-Host "[db-restore] Restored -wal file" -ForegroundColor Gray
    }

    Write-Host "[db-restore] Database restored successfully" -ForegroundColor Green
    Write-Host "" -ForegroundColor Gray
    Write-Host "[db-restore] IMPORTANT: Restart the application" -ForegroundColor Cyan
    Write-Host "[db-restore]   pm2 restart main" -ForegroundColor Gray
    
    exit 0
    
} catch {
    Write-Host "[db-restore] Error: $_" -ForegroundColor Red
    exit 1
}
