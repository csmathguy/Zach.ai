<#
.SYNOPSIS
    Launch Prisma Studio (database GUI)
.DESCRIPTION
    Opens Prisma Studio in the default browser for visual database management.
    Runs on http://localhost:5555 by default.
.PARAMETER Port
    Port to run Prisma Studio on (default: 5555)
.EXAMPLE
    .\db-studio.ps1
    .\db-studio.ps1 -Port 5556
#>
param(
    [int]$Port = 5555
)

$ErrorActionPreference = "Stop"

Write-Host "[DB-STUDIO] Launching Prisma Studio on port $Port..." -ForegroundColor Cyan
Write-Host "[INFO] Studio will open in your default browser" -ForegroundColor Yellow
Write-Host "[INFO] Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Navigate to backend directory
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backendPath = Join-Path $repoRoot "backend"
Push-Location $backendPath

try {
    # Launch Prisma Studio
    npx prisma studio --port $Port
    
} catch {
    Write-Host "[ERROR] Failed to launch Prisma Studio: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
