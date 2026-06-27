@echo off
REM 투네이션 알림창 -> 자동발급 수신기 중계 브리지 시작 (로컬 전용)
REM 먼저 start_auto_issuer.cmd (run.js --webhook) 가 떠 있어야 합니다.
REM 설정: private/donation-auto-issuer.config.json 의 toonationAlertboxKey / webhookSecret
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
    node "%~dp0toonation-bridge.js"
) else (
    echo Node.js 가 필요합니다. https://nodejs.org 에서 설치 후 다시 실행하세요.
    pause
)
