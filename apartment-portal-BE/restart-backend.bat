@echo off
echo ========================================
echo    RESTARTING SPRING BOOT BACKEND
echo ========================================
echo.

echo Stopping any running Spring Boot processes...
taskkill /f /im java.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Spring Boot backend...
echo.

cd /d "%~dp0"
call gradlew bootRun

echo.
echo Backend started successfully!
echo.
pause
