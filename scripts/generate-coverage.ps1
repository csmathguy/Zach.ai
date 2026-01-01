# Generate Coverage Script
# Runs Jest coverage for specified project and copies JSON to frontend/public/coverage/
# Usage: .\generate-coverage.ps1 -Project frontend|backend

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("frontend", "backend", "all")]
    [string]$Project
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path $PSScriptRoot -Parent

Write-Host "===== Generate Coverage Script =====" -ForegroundColor Cyan
Write-Host "Project: $Project" -ForegroundColor Yellow
Write-Host ""

function Generate-ProjectCoverage {
    param([string]$ProjectName)
    
    Write-Host "[$ProjectName] Running Jest coverage..." -ForegroundColor Blue
    
    # Run coverage
    Push-Location (Join-Path $rootDir $ProjectName)
    try {
        npm run test:coverage
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "[$ProjectName] Tests failed, but continuing to copy coverage files..."
        }
    }
    finally {
        Pop-Location
    }
    
    # Define paths
    $sourcePath = Join-Path $rootDir "$ProjectName\coverage\coverage-summary.json"
    $targetDir = Join-Path $rootDir "frontend\public\coverage"
    $targetPath = Join-Path $targetDir "$ProjectName-coverage-summary.json"
    
    # Check if coverage file was generated
    if (-not (Test-Path $sourcePath)) {
        Write-Warning "[$ProjectName] Coverage file not found: $sourcePath"
        return $false
    }
    
    # Create target directory if it doesn't exist
    if (-not (Test-Path $targetDir)) {
        Write-Host "[$ProjectName] Creating directory: $targetDir" -ForegroundColor Green
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    # Copy coverage file
    Write-Host "[$ProjectName] Copying coverage file..." -ForegroundColor Green
    Copy-Item -Path $sourcePath -Destination $targetPath -Force
    
    Write-Host "[$ProjectName] ✅ Coverage file copied to: $targetPath" -ForegroundColor Green
    return $true
}

# Generate coverage based on project parameter
$success = $true

if ($Project -eq "all") {
    Write-Host "Generating coverage for all projects..." -ForegroundColor Yellow
    Write-Host ""
    
    $frontendSuccess = Generate-ProjectCoverage "frontend"
    Write-Host ""
    $backendSuccess = Generate-ProjectCoverage "backend"
    
    $success = $frontendSuccess -and $backendSuccess
}
else {
    $success = Generate-ProjectCoverage $Project
}

Write-Host ""
if ($success) {
    Write-Host "===== Coverage Generation Complete =====" -ForegroundColor Green
    Write-Host ""
    Write-Host "Coverage files are now available at:" -ForegroundColor Cyan
    Write-Host "  /coverage/${Project}-coverage-summary.json" -ForegroundColor White
    Write-Host ""
    Write-Host "Navigate to /codebase-analysis to view the dashboard" -ForegroundColor Cyan
}
else {
    Write-Host "===== Coverage Generation Failed =====" -ForegroundColor Red
    Write-Host "Check the errors above and try again" -ForegroundColor Yellow
    exit 1
}
