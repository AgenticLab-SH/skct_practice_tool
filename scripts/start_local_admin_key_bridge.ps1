$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$existing = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*local_admin_key_bridge.py*' }
if ($existing) {
    $existing | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
python scripts/local_admin_key_bridge.py 2>&1 | Tee-Object -FilePath logs/app.log -Append
