Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESTARTING SPRING BOOT BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping any running Spring Boot processes..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting Spring Boot backend..." -ForegroundColor Green
Write-Host ""

Set-Location $PSScriptRoot
.\gradlew.bat bootRun

Write-Host ""
Write-Host "Backend started successfully!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
