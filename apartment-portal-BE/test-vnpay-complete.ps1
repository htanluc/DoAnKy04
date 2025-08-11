# Script test toàn bộ hệ thống VNPay
# Chạy script này sau khi đã sửa code

Write-Host "=== TEST TOÀN BỘ HỆ THỐNG VNPAY ===" -ForegroundColor Green
Write-Host ""

# Kiểm tra Java
Write-Host "1. Kiểm tra Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Java đã được cài đặt" -ForegroundColor Green
        $javaVersion | Select-Object -First 1
    } else {
        Write-Host "❌ Java chưa được cài đặt hoặc không có trong PATH" -ForegroundColor Red
        Write-Host "Vui lòng cài đặt Java và thêm vào PATH" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Không thể kiểm tra Java: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Kiểm tra Maven
Write-Host "2. Kiểm tra Maven installation..." -ForegroundColor Yellow
try {
    $mavenVersion = mvn -version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Maven đã được cài đặt" -ForegroundColor Green
        $mavenVersion | Select-Object -First 1
    } else {
        Write-Host "❌ Maven chưa được cài đặt hoặc không có trong PATH" -ForegroundColor Red
        Write-Host "Vui lòng cài đặt Maven và thêm vào PATH" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Không thể kiểm tra Maven: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Compile và test VNPayTest.java
Write-Host "3. Compile và test VNPayTest.java..." -ForegroundColor Yellow
try {
    # Compile
    Write-Host "   Compiling VNPayTest.java..." -ForegroundColor Cyan
    javac -cp "src/main/java" src/main/java/com/mytech/apartment/portal/services/gateways/VNPayTest.java
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Compile thành công" -ForegroundColor Green
        
        # Run test
        Write-Host "   Running test..." -ForegroundColor Cyan
        java -cp "src/main/java" com.mytech.apartment.portal.services.gateways.VNPayTest
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Test chạy thành công" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Test chạy thất bại" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ Compile thất bại" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Lỗi khi compile/run: $_" -ForegroundColor Red
}

Write-Host ""

# Kiểm tra cấu hình
Write-Host "4. Kiểm tra cấu hình VNPay..." -ForegroundColor Yellow
Write-Host "   Kiểm tra file application.properties:" -ForegroundColor Cyan

$configFile = "src/main/resources/application.properties"
if (Test-Path $configFile) {
    Write-Host "   ✅ File cấu hình tồn tại" -ForegroundColor Green
    
    # Đọc và hiển thị cấu hình VNPay
    $content = Get-Content $configFile
    $vnpayConfig = $content | Where-Object { $_ -match "payment\.vnpay" }
    
    Write-Host "   Cấu hình VNPay hiện tại:" -ForegroundColor Cyan
    foreach ($line in $vnpayConfig) {
        Write-Host "     $line" -ForegroundColor White
    }
} else {
    Write-Host "   ❌ Không tìm thấy file cấu hình" -ForegroundColor Red
}

Write-Host ""

# Phân tích payload VNPay hiện tại
Write-Host "5. Phân tích payload VNPay hiện tại..." -ForegroundColor Yellow
Write-Host "   Payload bạn đang gửi:" -ForegroundColor Cyan
Write-Host "   vnp_Amount: 88700000" -ForegroundColor White
Write-Host "   vnp_Command: pay" -ForegroundColor White
Write-Host "   vnp_CreateDate: 20250811092801" -ForegroundColor White
Write-Host "   vnp_CurrCode: VND" -ForegroundColor White
Write-Host "   vnp_ExpireDate: 20250811094301" -ForegroundColor White
Write-Host "   vnp_IpAddr: 127.0.0.1" -ForegroundColor White
Write-Host "   vnp_Locale: vn" -ForegroundColor White
Write-Host "   vnp_OrderInfo: Thanh toan hoa don 2024-11" -ForegroundColor White
Write-Host "   vnp_OrderType: topup" -ForegroundColor White
Write-Host "   vnp_ReturnUrl: http://localhost:3001/payment/callback/vnpay-result" -ForegroundColor White
Write-Host "   vnp_TmnCode: CTTVNP01" -ForegroundColor White
Write-Host "   vnp_TxnRef: 1_1754879281219" -ForegroundColor White
Write-Host "   vnp_Version: 2.1.1" -ForegroundColor White

Write-Host ""
Write-Host "   🔍 Phân tích vấn đề:" -ForegroundColor Yellow

# Kiểm tra thứ tự tham số
Write-Host "   ❌ Vấn đề 1: Thứ tự tham số không đúng theo alphabet" -ForegroundColor Red
Write-Host "      VNPay yêu cầu: vnp_Amount, vnp_Command, vnp_CreateDate, vnp_CurrCode, vnp_ExpireDate, vnp_IpAddr, vnp_Locale, vnp_OrderInfo, vnp_OrderType, vnp_ReturnUrl, vnp_TmnCode, vnp_TxnRef, vnp_Version" -ForegroundColor White

# Kiểm tra IP Address
Write-Host "   ❌ Vấn đề 2: IP Address 127.0.0.1 (localhost) có thể bị từ chối" -ForegroundColor Red
Write-Host "      Giải pháp: Sử dụng IP thực tế hoặc 0.0.0.0" -ForegroundColor White

# Kiểm tra thời gian
Write-Host "   ⚠️  Vấn đề 3: Thời gian hết hạn chỉ 15 phút có thể quá ngắn" -ForegroundColor Yellow
Write-Host "      Giải pháp: Tăng thời gian hết hạn lên 30-60 phút" -ForegroundColor White

# Kiểm tra OrderInfo
Write-Host "   ⚠️  Vấn đề 4: OrderInfo có dấu tiếng Việt" -ForegroundColor Yellow
Write-Host "      Giải pháp: Loại bỏ dấu tiếng Việt theo yêu cầu VNPay" -ForegroundColor White

Write-Host ""

# Hướng dẫn test
Write-Host "6. Hướng dẫn test tiếp theo:" -ForegroundColor Yellow
Write-Host "   a) Restart ứng dụng Spring Boot:" -ForegroundColor Cyan
Write-Host "      mvn spring-boot:run" -ForegroundColor White
Write-Host ""
Write-Host "   b) Tạo thanh toán test với số tiền nhỏ (10,000 VND)" -ForegroundColor Cyan
Write-Host ""
Write-Host "   c) Kiểm tra logs trong console để đảm bảo:" -ForegroundColor Cyan
Write-Host "      - Hash data string được tạo đúng" -ForegroundColor White
Write-Host "      - Secure hash được tạo thành công" -ForegroundColor White
Write-Host "      - URL thanh toán được tạo" -ForegroundColor White
Write-Host ""
Write-Host "   d) Nếu vẫn gặp lỗi 'không xác định', hãy:" -ForegroundColor Cyan
Write-Host "      - Kiểm tra TMN Code và Hash Secret" -ForegroundColor White
Write-Host "      - Đảm bảo sử dụng đúng sandbox endpoint" -ForegroundColor White
Write-Host "      - Kiểm tra network connectivity" -ForegroundColor White
Write-Host "      - Sử dụng IP thực tế thay vì localhost" -ForegroundColor White

Write-Host ""
Write-Host "7. Sửa lỗi payload VNPay:" -ForegroundColor Yellow
Write-Host "   a) Sửa thứ tự tham số theo alphabet trong VNPayGateway.java" -ForegroundColor Cyan
Write-Host "   b) Sửa IP Address từ 127.0.0.1 thành IP thực tế" -ForegroundColor Cyan
Write-Host "   c) Tăng thời gian hết hạn lên 30-60 phút" -ForegroundColor Cyan
Write-Host "   d) Loại bỏ dấu tiếng Việt trong OrderInfo" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== HOÀN THÀNH TEST ===" -ForegroundColor Green
Write-Host "Hãy kiểm tra kết quả và cho biết nếu cần hỗ trợ thêm!" -ForegroundColor Cyan
