# Register a Windows Task Scheduler task to run pm2 resurrect at user login
# This ensures zach-main automatically restarts after reboot
param()

$taskName = "PM2-Resurrect-Main"
$pm2Command = "npx pm2 resurrect"
$workingDir = $PSScriptRoot | Split-Path

Write-Host "[setup-auto-start] Registering Task Scheduler task: $taskName" -ForegroundColor Cyan

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
  Write-Host "[setup-auto-start] Task already exists. Unregistering old task..." -ForegroundColor Yellow
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create action to run pm2 resurrect via PowerShell
$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -WindowStyle Hidden -Command `"Set-Location '$workingDir'; $pm2Command`"" `
  -WorkingDirectory $workingDir

# Trigger at user logon
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Settings: run only if network available, don't stop if on battery, etc.
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RunOnlyIfNetworkAvailable

# Register the task
Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Automatically resurrect PM2 processes (main) at user login" `
  -User $env:USERNAME `
  -RunLevel Limited

Write-Host "[setup-auto-start] Task registered successfully!" -ForegroundColor Green
Write-Host "[setup-auto-start] Run 'Get-ScheduledTask -TaskName $taskName' to verify." -ForegroundColor Cyan
