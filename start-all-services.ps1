# Script khởi động tất cả services cho Windows
# Smart Building Management System

Write-Host "🚀 Đang khởi động Smart Building Management System..." -ForegroundColor Green

# Kiểm tra Java
Write-Host "📋 Kiểm tra Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java chưa được cài đặt hoặc chưa được thêm vào PATH" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Java 20 và cấu hình JAVA_HOME" -ForegroundColor Red
    exit 1
}

# Kiểm tra Node.js
Write-Host "📋 Kiểm tra Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js chưa được cài đặt" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js 18+ từ https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Kiểm tra MySQL
Write-Host "📋 Kiểm tra MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL chưa được cài đặt hoặc chưa được thêm vào PATH" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt MySQL 8.0+ và cấu hình PATH" -ForegroundColor Red
    exit 1
}

# Tạo thư mục logs nếu chưa có
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs"
}

# Khởi động Backend
Write-Host "🔧 Đang khởi động Backend API..." -ForegroundColor Cyan
Set-Location "apartment-portal-BE"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🔧 Backend API đang khởi động...' -ForegroundColor Cyan; ./gradlew bootRun" -WindowStyle Normal
Start-Sleep -Seconds 3

# Khởi động Admin Portal
Write-Host "🎨 Đang khởi động Admin Portal..." -ForegroundColor Cyan
Set-Location "../apartment-portal-Fe"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🎨 Admin Portal đang khởi động...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# Khởi động User Portal
Write-Host "👥 Đang khởi động User Portal..." -ForegroundColor Cyan
Set-Location "../apartment-user-portal"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '👥 User Portal đang khởi động...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

# Quay về thư mục gốc
Set-Location ".."

Write-Host "✅ Tất cả services đã được khởi động!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Truy cập các ứng dụng:" -ForegroundColor Yellow
Write-Host "   Backend API:    http://localhost:8080" -ForegroundColor White
Write-Host "   Admin Portal:   http://localhost:3000" -ForegroundColor White
Write-Host "   User Portal:    http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📝 Lưu ý: Vui lòng đợi vài phút để tất cả services khởi động hoàn tất" -ForegroundColor Yellow
Write-Host "🔍 Kiểm tra logs trong các cửa sổ PowerShell để theo dõi quá trình khởi động" -ForegroundColor Yellow

# Mở trình duyệt sau 30 giây
Start-Sleep -Seconds 30
Write-Host "🌐 Đang mở trình duyệt..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3001"
