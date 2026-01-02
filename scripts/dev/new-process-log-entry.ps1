<#
.SYNOPSIS
    Creates a new timestamped process log entry for a work item.

.DESCRIPTION
    Generates a new process log entry file with current timestamp in the 
    work item's dev/process-log/ directory. Opens the file in the default 
    editor for immediate editing.

.PARAMETER WorkItem
    The work item identifier (e.g., "O1-database-foundation")

.PARAMETER Description
    Brief description for the entry title (optional)

.PARAMETER Task
    Task identifier (e.g., "Section 2.6") (optional)

.PARAMETER Commit
    Commit hash to reference (optional, defaults to latest)

.EXAMPLE
    .\new-process-log-entry.ps1 -WorkItem "O1-database-foundation"
    Creates a new entry and opens in editor

.EXAMPLE
    .\new-process-log-entry.ps1 -WorkItem "O1-database-foundation" -Description "PrismaThoughtRepository" -Task "Section 2.6"
    Creates entry with pre-filled description and task

.NOTES
    Creates process-log directory if it doesn't exist.
    Automatically gets latest commit hash if not specified.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$WorkItem,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "Brief Description",
    
    [Parameter(Mandatory=$false)]
    [string]$Task = "Section X.X - Task Name",
    
    [Parameter(Mandatory=$false)]
    [string]$Commit = ""
)

$ErrorActionPreference = "Stop"

try {
    # Validate work item exists
    $workItemPath = "work-items\$WorkItem"
    if (-not (Test-Path $workItemPath)) {
        throw "Work item not found: $workItemPath"
    }

    # Create process-log directory if it doesn't exist
    $processLogPath = "$workItemPath\dev\process-log"
    if (-not (Test-Path $processLogPath)) {
        Write-Host "[INFO] Creating process-log directory..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $processLogPath -Force | Out-Null
    }

    # Get latest commit hash if not provided
    if ([string]::IsNullOrWhiteSpace($Commit)) {
        $Commit = git rev-parse --short HEAD
        if ($LASTEXITCODE -ne 0) {
            $Commit = "<hash>"
        }
    }

    # Get commit message
    $commitMessage = git log -1 --pretty=%s $Commit 2>$null
    if ($LASTEXITCODE -ne 0) {
        $commitMessage = "<commit message>"
    }

    # Generate timestamp filename
    $timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
    $filename = "$timestamp.md"
    $filepath = Join-Path $processLogPath $filename

    # Get current date/time for entry
    $currentDateTime = Get-Date -Format "yyyy-MM-dd HH:mm"

    # Load template
    $templatePath = "work-items\_template\dev\process-log\TEMPLATE.md"
    if (-not (Test-Path $templatePath)) {
        throw "Template not found: $templatePath"
    }

    $content = Get-Content $templatePath -Raw

    # Replace placeholders
    $content = $content -replace "\[Brief Description\]", $Description
    $content = $content -replace "YYYY-MM-DD HH:MM", $currentDateTime
    $content = $content -replace "<hash>", $Commit
    $content = $content -replace "<commit message>", $commitMessage
    $content = $content -replace "Section X\.X - \[Task Name\]", $Task

    # Write file
    Set-Content -Path $filepath -Value $content -Encoding UTF8

    Write-Host "[SUCCESS] Created process log entry: $filename" -ForegroundColor Green
    Write-Host "[INFO] Path: $filepath" -ForegroundColor Cyan

    # Open in default editor
    Write-Host "[INFO] Opening in default editor..." -ForegroundColor Yellow
    Start-Process $filepath

    exit 0

} catch {
    Write-Host "[ERROR] Failed to create process log entry: $_" -ForegroundColor Red
    exit 1
}
