<#
.SYNOPSIS
    Run database migrations
.DESCRIPTION
    Apply database migrations for development or production environments.
    - Development: Interactive mode, creates new migrations
    - Production: Deploy mode, applies pending migrations only (preserves data)
.PARAMETER Environment
    Target environment: development (default) or production
.PARAMETER Name
    Migration name (development only, optional for apply-only)
.EXAMPLE
    # Development: Apply existing migrations
    .\db-migrate.ps1
    
    # Development: Create new migration
    .\db-migrate.ps1 -Name add_user_profile
    
    # Production: Apply pending migrations (safe, preserves data)
    .\db-migrate.ps1 -Environment production
#>
param(
    [ValidateSet('development', 'production')]
    [string]$Environment = 'development',
    
    [string]$Name,

    [string]$DatabasePath
)

$ErrorActionPreference = "Stop"

# Navigate to backend directory
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backendPath = Join-Path $repoRoot "backend"
Push-Location $backendPath

function Resolve-FullPath {
    param([string]$PathToResolve)
    if (-not $PathToResolve) { return $null }
    if ([System.IO.Path]::IsPathRooted($PathToResolve)) {
        return [System.IO.Path]::GetFullPath($PathToResolve)
    }
    return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $PathToResolve))
}

try {
    if ($Environment -eq 'production') {
        Write-Host "[DB-MIGRATE] Running PRODUCTION migrations..." -ForegroundColor Cyan
        Write-Host "[INFO] This will NOT clear existing data" -ForegroundColor Yellow
        Write-Host "[INFO] Only pending migrations will be applied" -ForegroundColor Yellow
        Write-Host ""
        
        $databaseEnvPath = $null
        if ($DatabasePath) {
            $fullDbPath = Resolve-FullPath -PathToResolve $DatabasePath
            $databaseEnvPath = "file:$fullDbPath"
            Write-Host "[INFO] Target database path: $fullDbPath" -ForegroundColor Cyan
            if (Test-Path $fullDbPath) {
                Write-Host "[INFO] Database exists - applying pending migrations only..." -ForegroundColor Yellow
            } else {
                $dbDir = Split-Path $fullDbPath -Parent
                if ($dbDir -and -not (Test-Path $dbDir)) {
                    New-Item -ItemType Directory -Force -Path $dbDir | Out-Null
                }
                Write-Host "[INFO] Database not found - it will be created during migration." -ForegroundColor Yellow
            }
            $env:DATABASE_URL = $databaseEnvPath
        } else {
            $devDbPath = Join-Path $backendPath "dev.db"
            if (-not (Test-Path $devDbPath)) {
                Write-Host "[INFO] Database not found - initializing with schema..." -ForegroundColor Yellow
            } else {
                Write-Host "[INFO] Database exists - applying pending migrations only..." -ForegroundColor Yellow
            }
        }

        # Run production migrations (safe, preserves data)
        npx prisma migrate deploy
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Migration failed!" -ForegroundColor Red
            exit 1
        }
        if ($databaseEnvPath) {
            Write-Host "[SUCCESS] Migrations applied to $databaseEnvPath" -ForegroundColor Green
        }

        Write-Host ""
        Write-Host "[SUCCESS] Production migrations complete" -ForegroundColor Green
        Write-Host "[SUCCESS] Existing data preserved" -ForegroundColor Green
        
    } else {
        # Development mode
        if ($Name) {
            Write-Host "[DB-MIGRATE] Creating new migration: $Name" -ForegroundColor Cyan
            npx prisma migrate dev --name $Name
        } else {
            Write-Host "[DB-MIGRATE] Running development migrations..." -ForegroundColor Cyan
            npx prisma migrate dev
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Migration failed!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "[SUCCESS] Development migrations complete" -ForegroundColor Green
    }
    
} catch {
    Write-Host "[ERROR] Migration error: $_" -ForegroundColor Red
    exit 1
} finally {
    if ($DatabasePath -and (Test-Path env:DATABASE_URL)) {
        Remove-Item env:DATABASE_URL
    }
    Pop-Location
}
