# Script to start all services for Windows
# Smart Building Management System

Write-Host "🚀 Starting Smart Building Management System..." -ForegroundColor Green

# Check Java
Write-Host "📋 Checking Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java is not installed or not added to PATH" -ForegroundColor Red
    Write-Host "Please install Java 20 and configure JAVA_HOME" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "📋 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check MySQL
Write-Host "📋 Checking MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL is not installed or not added to PATH" -ForegroundColor Red
    Write-Host "Please install MySQL 8.0+ and configure PATH" -ForegroundColor Red
    exit 1
}

# Create logs directory if not exists
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs"
}

# Start Backend
Write-Host "🔧 Starting Backend API..." -ForegroundColor Cyan
Set-Location "apartment-portal-BE"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🔧 Backend API is starting...' -ForegroundColor Cyan; ./gradlew bootRun" -WindowStyle Normal
Start-Sleep -Seconds 3

# Start Admin Portal
Write-Host "🎨 Starting Admin Portal..." -ForegroundColor Cyan
Set-Location "../apartment-portal-Fe"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🎨 Admin Portal is starting...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# Start User Portal
Write-Host "👥 Starting User Portal..." -ForegroundColor Cyan
Set-Location "../apartment-user-portal"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '👥 User Portal is starting...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# Return to root directory
Set-Location ".."

Write-Host "✅ All services have been started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access applications:" -ForegroundColor Yellow
Write-Host "   Backend API:    http://localhost:8080" -ForegroundColor White
Write-Host "   Admin Portal:   http://localhost:3000" -ForegroundColor White
Write-Host "   User Portal:    http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📝 Note: Please wait a few minutes for all services to start completely" -ForegroundColor Yellow
Write-Host "🔍 Check logs in PowerShell windows to monitor startup progress" -ForegroundColor Yellow

# Open browser after 30 seconds
Start-Sleep -Seconds 30
Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3001"
