$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $projectRoot "tmp\local_admin_launcher_state.json"

function Stop-IfAlive {
    param([int]$ProcessId)
    try {
        Stop-Process -Id $ProcessId -Force -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

if (-not (Test-Path -LiteralPath $statePath)) {
    Write-Host "실행 중인 로컬 관리자 상태 파일이 없습니다."
    exit 0
}

$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
$serverStopped = $false
$bridgeStopped = $false

if ($state.serverPid) {
    $serverStopped = Stop-IfAlive -ProcessId ([int]$state.serverPid)
}

if ($state.bridgePid) {
    $bridgeStopped = Stop-IfAlive -ProcessId ([int]$state.bridgePid)
}

Remove-Item -LiteralPath $statePath -Force -ErrorAction SilentlyContinue

Write-Host ("정적 서버 중지: {0}" -f $(if ($serverStopped) { "완료" } else { "실행 중 프로세스 없음" }))
Write-Host ("키 브리지 중지: {0}" -f $(if ($bridgeStopped) { "완료" } else { "실행 중 프로세스 없음" }))
