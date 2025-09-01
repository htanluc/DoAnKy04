#!/usr/bin/env pwsh

Write-Host "🔄 Testing i18n implementation..." -ForegroundColor Cyan

# Kill existing Next.js process if running
Write-Host "🛑 Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force

# Clear Next.js cache
Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install
}

# Build and start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "📍 Navigate to: http://localhost:3000/admin-dashboard/announcements" -ForegroundColor Magenta
Write-Host "🔧 Test the stats cards i18n by switching language" -ForegroundColor Magenta
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

npm run dev
