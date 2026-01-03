<#
.SYNOPSIS
    Promote, reject, or defer an Architecture Decision Record (ADR)

.DESCRIPTION
    Automates ADR lifecycle management:
    - Approved: Assigns next global KB number, copies to knowledge base
    - Rejected: Deletes the ADR file
    - Deferred: Creates new work item for future implementation

.PARAMETER FilePath
    Path to the ADR file (e.g., "work-items/O2-thought-capture/architecture/adr-validation.md")

.PARAMETER Status
    Decision status: Approved, Rejected, or Deferred

.PARAMETER DeferredFeatureName
    (Optional) Feature name for deferred ADR (e.g., "rate-limiting")
    Only used when Status is "Deferred"

.EXAMPLE
    .\scripts\adr-promote.ps1 -FilePath "work-items/O2-thought-capture/architecture/adr-001-validation.md" -Status Approved

.EXAMPLE
    .\scripts\adr-promote.ps1 -FilePath "work-items/O2-thought-capture/architecture/adr-002-rate-limiting.md" -Status Deferred -DeferredFeatureName "rate-limiting"

.EXAMPLE
    .\scripts\adr-promote.ps1 -FilePath "work-items/O2-thought-capture/architecture/adr-005-bad-idea.md" -Status Rejected
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,

    [Parameter(Mandatory=$true)]
    [ValidateSet('Approved', 'Rejected', 'Deferred')]
    [string]$Status,

    [Parameter(Mandatory=$false)]
    [string]$DeferredFeatureName
)

$ErrorActionPreference = "Stop"

# Resolve paths
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ADRPath = Join-Path $RepoRoot $FilePath
$KBDir = Join-Path $RepoRoot "knowledge-base\codebase\architecture-decisions"

# Validate ADR file exists
if (-not (Test-Path $ADRPath)) {
    Write-Host "❌ ERROR: ADR file not found: $ADRPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔄 ADR Promotion Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "File: $FilePath" -ForegroundColor White
Write-Host "Status: $Status" -ForegroundColor White
Write-Host ""

# Function: Get next available ADR number in KB
function Get-NextADRNumber {
    if (-not (Test-Path $KBDir)) {
        Write-Host "⚠️  Knowledge base directory not found, creating it..." -ForegroundColor Yellow
        New-Item -Path $KBDir -ItemType Directory -Force | Out-Null
        return "0001"
    }

    $existingADRs = Get-ChildItem -Path $KBDir -Filter "*.md" | 
        Where-Object { $_.Name -match '^(\d{4})-' } |
        ForEach-Object { [int]$matches[1] } |
        Sort-Object -Descending

    if ($existingADRs.Count -eq 0) {
        return "0001"
    }

    $maxNumber = $existingADRs[0]
    $nextNumber = $maxNumber + 1
    return $nextNumber.ToString("0000")
}

# Function: Extract descriptive title from filename
function Get-DescriptiveTitle {
    param([string]$FileName)
    
    # Remove extension
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    
    # Remove existing ADR prefix/number patterns
    $title = $baseName -replace '^adr-\d{3}-', '' `
                       -replace '^adr-\d{4}-', '' `
                       -replace '^adr-', ''
    
    return $title
}

# Function: Extract ADR title from content (first # heading)
function Get-ADRTitleFromContent {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    if ($content -match '#\s+ADR-\d+:\s+(.+)') {
        return $matches[1].Trim()
    }
    elseif ($content -match '#\s+(.+)') {
        return $matches[1].Trim()
    }
    
    return $null
}

# ============================================================================
# APPROVED: Promote to Knowledge Base with Global Number
# ============================================================================
if ($Status -eq 'Approved') {
    Write-Host "✅ Status: APPROVED" -ForegroundColor Green
    Write-Host "   Promoting to knowledge base..." -ForegroundColor White
    
    # Get next ADR number
    $nextNumber = Get-NextADRNumber
    Write-Host "   Next available ADR number: $nextNumber" -ForegroundColor Cyan
    
    # Extract descriptive title from filename
    $fileName = Split-Path $ADRPath -Leaf
    $descriptiveTitle = Get-DescriptiveTitle -FileName $fileName
    
    # Build new KB filename: NNNN-descriptive-title.md
    $newFileName = "$nextNumber-$descriptiveTitle.md"
    $kbFilePath = Join-Path $KBDir $newFileName
    
    Write-Host "   New KB filename: $newFileName" -ForegroundColor Cyan
    
    # Check for conflicts (shouldn't happen, but safety check)
    if (Test-Path $kbFilePath) {
        Write-Host "   ⚠️  WARNING: File already exists in KB: $newFileName" -ForegroundColor Yellow
        Write-Host "   Existing file will be overwritten." -ForegroundColor Yellow
        $confirmation = Read-Host "   Continue? (y/n)"
        if ($confirmation -ne 'y') {
            Write-Host "   ❌ Aborted by user." -ForegroundColor Red
            exit 1
        }
    }
    
    # Copy file to knowledge base
    Copy-Item -Path $ADRPath -Destination $kbFilePath -Force
    Write-Host "   ✅ Copied to: $kbFilePath" -ForegroundColor Green
    
    # Update ADR status in the KB file
    $kbContent = Get-Content $kbFilePath -Raw
    if ($kbContent -match '\*\*Status\*\*:\s+Proposed') {
        $kbContent = $kbContent -replace '\*\*Status\*\*:\s+Proposed', '**Status**: Accepted'
        Set-Content -Path $kbFilePath -Value $kbContent -NoNewline
        Write-Host "   ✅ Updated status to 'Accepted' in KB file" -ForegroundColor Green
    }
    
    # Update work item ADR with KB reference
    $workItemContent = Get-Content $ADRPath -Raw
    $kbReference = "`n`n---`n`n**Promoted to Knowledge Base**: [$newFileName](../../../knowledge-base/codebase/architecture-decisions/$newFileName)`n"
    
    if ($workItemContent -notmatch 'Promoted to Knowledge Base') {
        $workItemContent += $kbReference
        Set-Content -Path $ADRPath -Value $workItemContent -NoNewline
        Write-Host "   ✅ Added KB reference to work item ADR" -ForegroundColor Green
    }
    
    Write-Host "`n✅ SUCCESS: ADR promoted to knowledge base as $newFileName" -ForegroundColor Green
    Write-Host "   Location: knowledge-base/codebase/architecture-decisions/$newFileName" -ForegroundColor White
}

# ============================================================================
# REJECTED: Delete ADR File
# ============================================================================
elseif ($Status -eq 'Rejected') {
    Write-Host "❌ Status: REJECTED" -ForegroundColor Red
    Write-Host "   This ADR will be deleted." -ForegroundColor White
    
    # Safety confirmation
    Write-Host "`n⚠️  WARNING: This will permanently delete the ADR file." -ForegroundColor Yellow
    $confirmation = Read-Host "   Are you sure? (y/n)"
    
    if ($confirmation -eq 'y') {
        Remove-Item -Path $ADRPath -Force
        Write-Host "   ✅ ADR file deleted: $FilePath" -ForegroundColor Green
        Write-Host "`n✅ SUCCESS: Rejected ADR removed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Deletion cancelled by user." -ForegroundColor Red
        exit 1
    }
}

# ============================================================================
# DEFERRED: Create New Work Item for Future Implementation
# ============================================================================
elseif ($Status -eq 'Deferred') {
    Write-Host "⏳ Status: DEFERRED" -ForegroundColor Yellow
    Write-Host "   Creating new work item for future implementation..." -ForegroundColor White
    
    if (-not $DeferredFeatureName) {
        Write-Host "   ❌ ERROR: -DeferredFeatureName is required for deferred ADRs" -ForegroundColor Red
        Write-Host "   Example: -DeferredFeatureName 'rate-limiting'" -ForegroundColor Yellow
        exit 1
    }
    
    # Create work item directory structure
    $workItemDir = Join-Path $RepoRoot "work-items\feat-$DeferredFeatureName"
    $planDir = Join-Path $workItemDir "plan"
    
    Write-Host "   Creating work item: feat-$DeferredFeatureName" -ForegroundColor Cyan
    
    if (Test-Path $workItemDir) {
        Write-Host "   ⚠️  WARNING: Work item already exists: $workItemDir" -ForegroundColor Yellow
    } else {
        New-Item -Path $workItemDir -ItemType Directory -Force | Out-Null
        New-Item -Path $planDir -ItemType Directory -Force | Out-Null
        Write-Host "   ✅ Created work item directories" -ForegroundColor Green
    }
    
    # Copy ADR to new work item
    $fileName = Split-Path $ADRPath -Leaf
    $deferredADRPath = Join-Path $planDir $fileName
    Copy-Item -Path $ADRPath -Destination $deferredADRPath -Force
    Write-Host "   ✅ Copied ADR to: $deferredADRPath" -ForegroundColor Green
    
    # Update ADR status to Deferred
    $deferredContent = Get-Content $deferredADRPath -Raw
    if ($deferredContent -match '\*\*Status\*\*:\s+Proposed') {
        $deferredContent = $deferredContent -replace '\*\*Status\*\*:\s+Proposed', '**Status**: Deferred'
        Set-Content -Path $deferredADRPath -Value $deferredContent -NoNewline
        Write-Host "   ✅ Updated status to 'Deferred'" -ForegroundColor Green
    }
    
    # Create proposal document
    $adrTitle = Get-ADRTitleFromContent -FilePath $ADRPath
    if (-not $adrTitle) {
        $adrTitle = (Get-DescriptiveTitle -FileName $fileName) -replace '-', ' '
    }
    
    $proposalContent = @"
# Feature Proposal: $DeferredFeatureName

**Status**: Deferred  
**Original Feature**: $(Split-Path (Split-Path $ADRPath -Parent) -Leaf)  
**Date Deferred**: $(Get-Date -Format "yyyy-MM-dd")

---

## Overview

This feature was originally proposed as part of $(Split-Path (Split-Path $ADRPath -Parent) -Leaf) but has been **deferred** for future implementation.

**Decision**: $adrTitle

---

## Rationale for Deferral

- Scoped out of current MVP
- Requires additional design/research
- Not critical for initial release
- Can be implemented independently later

---

## Next Steps

1. Review deferred ADR: [$fileName]($fileName)
2. Create full APR when ready to implement
3. Prioritize in roadmap

---

## References

- **Original ADR**: [$fileName]($fileName)
- **Original Work Item**: $FilePath

"@
    
    $proposalPath = Join-Path $planDir "proposal.md"
    Set-Content -Path $proposalPath -Value $proposalContent -NoNewline
    Write-Host "   ✅ Created proposal: $proposalPath" -ForegroundColor Green
    
    Write-Host "`n✅ SUCCESS: Deferred ADR moved to new work item" -ForegroundColor Green
    Write-Host "   Location: work-items/feat-$DeferredFeatureName/plan/$fileName" -ForegroundColor White
    Write-Host "   Proposal: work-items/feat-$DeferredFeatureName/plan/proposal.md" -ForegroundColor White
}

Write-Host ""
