# Script để chạy ứng dụng Spring Boot
Write-Host "🚀 Starting Apartment Portal Application..." -ForegroundColor Green

# Kiểm tra Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java 17 or higher." -ForegroundColor Red
    exit 1
}

# Kiểm tra MySQL connection
Write-Host "🔍 Checking MySQL connection..." -ForegroundColor Yellow

# Chạy ứng dụng bằng Java
Write-Host "🎯 Starting application..." -ForegroundColor Green
java -cp "bin/main;bin/generated-sources/annotations;lib/*" com.mytech.apartment.portal.PortalApplication 