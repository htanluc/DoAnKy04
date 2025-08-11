# PowerShell script để test VNPay Integration
Write-Host "Testing VNPay Integration..." -ForegroundColor Green
Write-Host ""

# Kiểm tra Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "Java version: $javaVersion" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Java không được cài đặt hoặc không có trong PATH" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Java và thêm vào PATH" -ForegroundColor Red
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

Write-Host ""
Write-Host "Compiling VNPayTest.java..." -ForegroundColor Yellow

# Compile
try {
    javac -cp ".;lib/*" "src/main/java/com/mytech/apartment/portal/services/gateways/VNPayTest.java"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Compilation failed!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
} catch {
    Write-Host "❌ Compilation error: $_" -ForegroundColor Red
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

Write-Host ""
Write-Host "Running VNPayTest..." -ForegroundColor Yellow

# Run test
try {
    java -cp ".;src/main/java" "com.mytech.apartment.portal.services.gateways.VNPayTest"
} catch {
    Write-Host "❌ Runtime error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed." -ForegroundColor Green
Read-Host "Nhấn Enter để thoát"
