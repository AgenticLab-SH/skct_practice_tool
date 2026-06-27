@echo off
REM 후원 자동 사용권 발급 - 웹훅 수신기 시작 (로컬 전용)
REM 개인키는 로컬 파일에서만 읽으며, private/donation-auto-issuer.config.json 설정이 필요합니다.
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
    node "%~dp0run.js" --webhook
) else (
    echo Node.js 가 필요합니다. https://nodejs.org 에서 설치 후 다시 실행하세요.
    pause
)
