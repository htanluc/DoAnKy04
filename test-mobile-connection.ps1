# Test script để kiểm tra kết nối mobile app
Write-Host "=== KIỂM TRA KẾT NỐI MOBILE APP ===" -ForegroundColor Green

# 1. Kiểm tra backend có đang chạy không
Write-Host "`n1. Kiểm tra backend server..." -ForegroundColor Yellow
$backendStatus = netstat -an | Select-String ":8080.*LISTENING"
if ($backendStatus) {
    Write-Host "✅ Backend đang chạy trên port 8080" -ForegroundColor Green
    Write-Host $backendStatus
} else {
    Write-Host "❌ Backend KHÔNG chạy trên port 8080" -ForegroundColor Red
    exit 1
}

# 2. Test kết nối localhost
Write-Host "`n2. Test kết nối localhost..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"phoneNumber":"test","password":"test"}' -TimeoutSec 10
    Write-Host "✅ Localhost kết nối OK - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Localhost kết nối FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test kết nối từ IP máy
Write-Host "`n3. Test kết nối từ IP máy..." -ForegroundColor Yellow
$ip = "172.16.2.25"
try {
    $response = Invoke-WebRequest -Uri "http://$ip`:8080/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"phoneNumber":"test","password":"test"}' -TimeoutSec 10
    Write-Host "✅ IP $ip kết nối OK - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ IP $ip kết nối FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Kiểm tra firewall
Write-Host "`n4. Kiểm tra firewall..." -ForegroundColor Yellow
$firewallRule = netsh advfirewall firewall show rule name="Spring Boot 8080" dir=in 2>$null
if ($firewallRule) {
    Write-Host "✅ Firewall rule đã tồn tại" -ForegroundColor Green
} else {
    Write-Host "⚠️  Firewall rule CHƯA có - Cần thêm rule cho port 8080" -ForegroundColor Yellow
    Write-Host "   Chạy lệnh sau với quyền Administrator:" -ForegroundColor Cyan
    Write-Host "   netsh advfirewall firewall add rule name=`"Spring Boot 8080`" dir=in action=allow protocol=TCP localport=8080" -ForegroundColor Cyan
}

# 5. Hướng dẫn khắc phục
Write-Host "`n=== HƯỚNG DẪN KHẮC PHỤC ===" -ForegroundColor Green
Write-Host "Nếu mobile app vẫn không kết nối được:" -ForegroundColor White
Write-Host "1. Mở Windows Defender Firewall với Advanced Security" -ForegroundColor White
Write-Host "2. Tạo Inbound Rule mới cho port 8080" -ForegroundColor White
Write-Host "3. Hoặc tạm thời tắt Windows Firewall để test" -ForegroundColor White
Write-Host "4. Đảm bảo thiết bị mobile cùng mạng WiFi với máy tính" -ForegroundColor White
Write-Host "5. Kiểm tra IP của thiết bị mobile có thể ping được IP máy không" -ForegroundColor White

Write-Host "`n=== CẤU HÌNH MOBILE APP ===" -ForegroundColor Green
Write-Host "Trong file apartment-staff-mobile/lib/services/api_service.dart:" -ForegroundColor White
Write-Host "Đảm bảo baseUrl đúng: http://172.16.2.25:8080" -ForegroundColor White
Write-Host "Hoặc chạy với: flutter run --dart-define=API_BASE_URL=http://172.16.2.25:8080" -ForegroundColor White
