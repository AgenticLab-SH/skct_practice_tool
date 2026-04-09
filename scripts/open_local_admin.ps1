$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$logsDir = Join-Path $projectRoot "logs"
$tmpDir = Join-Path $projectRoot "tmp"
$statePath = Join-Path $tmpDir "local_admin_launcher_state.json"

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Test-ProcessAlive {
    param([int]$ProcessId)
    try {
        Get-Process -Id $ProcessId -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-LocalUrl {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
    }
    catch {
        return $false
    }
}

function Get-FreePort {
    param([int]$StartPort)
    for ($port = $StartPort; $port -lt ($StartPort + 25); $port++) {
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
            $listener.Start()
            $listener.Stop()
            return $port
        }
        catch {
            continue
        }
    }
    throw "사용 가능한 로컬 포트를 찾지 못했습니다."
}

function Get-PythonExecutable {
    foreach ($name in @("py", "python")) {
        $command = Get-Command $name -ErrorAction SilentlyContinue
        if ($command) {
            return $command.Source
        }
    }
    throw "Python 실행 파일을 찾지 못했습니다. Python을 설치하거나 PATH를 확인해주세요."
}

function Start-BackgroundProcess {
    param(
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkingDirectory,
        [string]$StdOutPath,
        [string]$StdErrPath
    )

    return Start-Process `
        -FilePath $FilePath `
        -ArgumentList $ArgumentList `
        -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $StdOutPath `
        -RedirectStandardError $StdErrPath `
        -PassThru `
        -WindowStyle Hidden
}

$existingState = $null
if (Test-Path -LiteralPath $statePath) {
    try {
        $existingState = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    }
    catch {
        $existingState = $null
    }
}

$adminUrl = $null
$serverPid = $null
$bridgePid = $null
$serverReused = $false
$bridgeReused = $false

if ($existingState -and $existingState.serverPid -and $existingState.adminUrl) {
    if ((Test-ProcessAlive -ProcessId ([int]$existingState.serverPid)) -and (Test-LocalUrl -Url $existingState.adminUrl)) {
        $adminUrl = [string]$existingState.adminUrl
        $serverPid = [int]$existingState.serverPid
        $serverReused = $true
    }
}

$pythonExe = Get-PythonExecutable

if (-not $adminUrl) {
    $port = Get-FreePort -StartPort 8135
    $serverOut = Join-Path $logsDir ("admin_http_{0}.log" -f $port)
    $serverErr = Join-Path $logsDir ("admin_http_{0}.err.log" -f $port)
    $serverProc = Start-BackgroundProcess `
        -FilePath $pythonExe `
        -ArgumentList @("-m", "http.server", $port, "--bind", "127.0.0.1") `
        -WorkingDirectory $projectRoot `
        -StdOutPath $serverOut `
        -StdErrPath $serverErr

    $adminUrl = "http://127.0.0.1:$port/admin.html"
    $serverPid = $serverProc.Id

    Start-Sleep -Milliseconds 900
    if (-not (Test-LocalUrl -Url $adminUrl)) {
        throw "로컬 관리자 서버를 시작했지만 응답을 확인하지 못했습니다. 로그: $serverOut"
    }
}

if ($existingState -and $existingState.bridgePid) {
    if (Test-ProcessAlive -ProcessId ([int]$existingState.bridgePid)) {
        $bridgePid = [int]$existingState.bridgePid
        $bridgeReused = $true
    }
}

if (-not $bridgePid) {
    $bridgeOut = Join-Path $logsDir "local_admin_key_bridge.log"
    $bridgeErr = Join-Path $logsDir "local_admin_key_bridge.err.log"
    $bridgeProc = Start-BackgroundProcess `
        -FilePath $pythonExe `
        -ArgumentList @("scripts/local_admin_key_bridge.py") `
        -WorkingDirectory $projectRoot `
        -StdOutPath $bridgeOut `
        -StdErrPath $bridgeErr
    $bridgePid = $bridgeProc.Id
}

$state = [ordered]@{
    createdAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
    adminUrl = $adminUrl
    serverPid = $serverPid
    bridgePid = $bridgePid
}
$state | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8

Start-Process $adminUrl

Write-Host ("관리자 페이지: {0}" -f $adminUrl)
Write-Host ("정적 서버 PID: {0}{1}" -f $serverPid, $(if ($serverReused) { " (재사용)" } else { "" }))
Write-Host ("키 브리지 PID: {0}{1}" -f $bridgePid, $(if ($bridgeReused) { " (재사용)" } else { "" }))
Write-Host ("중지 스크립트: {0}" -f (Join-Path $projectRoot "scripts\stop_local_admin.ps1"))
