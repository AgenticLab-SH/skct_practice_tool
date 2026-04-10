@echo off
setlocal
where py >nul 2>nul
if %errorlevel%==0 (
    py "%~dp0open_local_admin.py"
) else (
    python "%~dp0open_local_admin.py"
)
