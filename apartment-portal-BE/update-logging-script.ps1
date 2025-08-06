# PowerShell Script để cập nhật Smart Logging
# Chạy script này để tự động thay thế ActivityLogService bằng SmartActivityLogService

Write-Host "🚀 Bắt đầu cập nhật Smart Logging..." -ForegroundColor Green

# Danh sách các file cần cập nhật
$files = @(
    "src/main/java/com/mytech/apartment/portal/apis/InvoiceController.java",
    "src/main/java/com/mytech/apartment/portal/apis/EventController.java", 
    "src/main/java/com/mytech/apartment/portal/apis/FacilityBookingController.java",
    "src/main/java/com/mytech/apartment/portal/apis/VehicleController.java",
    "src/main/java/com/mytech/apartment/portal/apis/ServiceRequestController.java",
    "src/main/java/com/mytech/apartment/portal/apis/PaymentController.java",
    "src/main/java/com/mytech/apartment/portal/apis/AuthController.java"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Đang cập nhật: $file" -ForegroundColor Yellow
        
        # Đọc nội dung file
        $content = Get-Content $file -Raw
        
        # Thay thế import
        $content = $content -replace "import com\.mytech\.apartment\.portal\.services\.ActivityLogService;", "import com.mytech.apartment.portal.services.SmartActivityLogService;"
        
        # Thay thế field declaration
        $content = $content -replace "private final ActivityLogService activityLogService;", "private final SmartActivityLogService smartActivityLogService;"
        $content = $content -replace "@Autowired`r?`n    private ActivityLogService activityLogService;", "@Autowired`r`n    private SmartActivityLogService smartActivityLogService;"
        
        # Thay thế method calls
        $content = $content -replace "activityLogService\.logActivityForCurrentUser\(", "smartActivityLogService.logSmartActivity("
        
        # Ghi lại file
        Set-Content $file $content -Encoding UTF8
        
        Write-Host "✅ Đã cập nhật: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Không tìm thấy file: $file" -ForegroundColor Red
    }
}

Write-Host "🎉 Hoàn thành cập nhật Smart Logging!" -ForegroundColor Green
Write-Host "📋 Hãy kiểm tra và test lại các controller đã cập nhật" -ForegroundColor Cyan 