# PowerShell Version Compatibility Guide

## Overview

This project uses **Windows PowerShell 5.1** (powershell.exe), NOT PowerShell Core 7+ (pwsh.exe).

**Critical**: Syntax differences exist between versions. Always test in PowerShell 5.1.

---

## Version Check

```powershell
# Check current version
$PSVersionTable.PSVersion

# Expected output for our environment:
# Major  Minor  Build  Revision
# -----  -----  -----  --------
# 5      1      xxxxx  xxxx
```

---

## Known Compatibility Issues

### 1. Join-Path Multi-Segment Syntax

**PowerShell Core 7+**: Supports multiple path segments in one call

```powershell
# ✅ Works in Core 7+
$path = Join-Path $PSScriptRoot ".." ".." "backend"
```

**Windows PowerShell 5.1**: Does NOT support multi-segment

```powershell
# ❌ FAILS in 5.1: "positional parameter cannot be found"
$path = Join-Path $PSScriptRoot ".." ".." "backend"

# ✅ Use Split-Path chaining instead
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backendPath = Join-Path $repoRoot "backend"
```

**Pattern to Follow**:

```powershell
# Navigate up directory tree
$scriptDir = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent
$repoRoot = Split-Path $projectRoot -Parent

# Then join downward
$targetPath = Join-Path $repoRoot "target\directory"
```

### 2. Command Invocation

**When already in PowerShell**: Use direct commands

```powershell
# ❌ WRONG: Unnecessary wrapper
powershell -Command "cd backend; npm test"

# ✅ CORRECT: Direct command
cd backend; npm test
```

**When in another shell**: Use full invocation

```bash
# From bash/cmd
powershell -File scripts/deploy.ps1
```

### 3. String Interpolation

**Issue**: Variable expansion in subexpressions

```powershell
# ❌ May not display correctly
Write-Host "Size: ${fileInfo.Length} bytes"

# ✅ Use subexpression syntax
Write-Host "Size: $($fileInfo.Length) bytes"
```

---

## Best Practices for 5.1 Compatibility

### Path Construction

```powershell
# ✅ Always use this pattern for upward navigation
function Get-RepositoryRoot {
    $scriptPath = $PSScriptRoot
    # Navigate up: scripts/database → scripts → repository root
    return Split-Path (Split-Path $scriptPath -Parent) -Parent
}

$repoRoot = Get-RepositoryRoot
$backendPath = Join-Path $repoRoot "backend"
```

### Error Handling

```powershell
# ✅ Consistent error handling pattern
$ErrorActionPreference = "Stop"

Push-Location $targetPath
try {
    # Your code here
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
```

### Parameter Validation

```powershell
# ✅ Use ValidateSet for enums
param(
    [ValidateSet('development', 'production')]
    [string]$Environment = 'development',

    [switch]$Force
)
```

---

## Testing Your Scripts

### Test in PowerShell 5.1

```powershell
# Verify you're in 5.1
$PSVersionTable.PSVersion.Major -eq 5

# Test your script
.\scripts\your-script.ps1

# Check exit code
$LASTEXITCODE
```

### Common Test Cases

1. **Path construction**: Verify paths resolve correctly
2. **Cross-directory navigation**: Test from different starting locations
3. **Error handling**: Test failure scenarios
4. **Exit codes**: Verify 0 = success, 1 = error

---

## Migration from Core 7+ to 5.1

If you have scripts written for PowerShell Core 7+:

### 1. Fix Join-Path

```powershell
# Find all Join-Path with 3+ arguments
Select-String -Path "*.ps1" -Pattern "Join-Path.*\.\..*\.\."

# Replace with Split-Path chaining
```

### 2. Test Thoroughly

- Run in PowerShell 5.1 environment
- Test all path operations
- Verify error handling
- Check exit codes

---

## References

- **PowerShell 5.1 Documentation**: https://docs.microsoft.com/en-us/powershell/scripting/windows-powershell/
- **PowerShell Core 7+ Documentation**: https://docs.microsoft.com/en-us/powershell/
- **Join-Path Cmdlet**: https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/join-path

---

## Related Documentation

- [scripts/database/ README](../../scripts/database/README.md) - Database scripts using 5.1 patterns
- [PM2 Setup Guide](../pm2/windows.md) - Deployment scripts for Windows

---

**Last Updated**: 2026-01-02  
**Verified Environment**: Windows PowerShell 5.1.19041.5247
