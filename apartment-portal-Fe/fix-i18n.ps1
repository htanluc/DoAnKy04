# Script tự động sửa hệ thống đa ngôn ngữ
# Chạy script này để sửa tất cả các component còn lại

Write-Host "🔧 Bắt đầu sửa hệ thống đa ngôn ngữ..." -ForegroundColor Green

# Danh sách các file cần sửa
$filesToFix = @(
    "app/admin-dashboard/feedbacks/page.tsx",
    "app/admin-dashboard/support-requests/page.tsx",
    "app/admin-dashboard/reports/page.tsx",
    "app/admin-dashboard/history/page.tsx",
    "app/admin-dashboard/facility-bookings/page.tsx",
    "app/admin-dashboard/water-meter/page.tsx",
    "app/admin-dashboard/yearly-billing/page.tsx",
    "app/admin-dashboard/billing-config/page.tsx"
)

Write-Host "📁 Tìm thấy $($filesToFix.Count) file cần sửa" -ForegroundColor Yellow

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "🔍 Đang sửa: $file" -ForegroundColor Cyan
        
        # Đọc nội dung file
        $content = Get-Content $file -Raw
        
        # Các pattern cần sửa
        $patterns = @(
            @{
                Find = "t\('([^']+)'\)"
                Replace = "t('`$1', 'Fallback text')"
                Description = "Thêm fallback text cho t() calls"
            },
            @{
                Find = "t\(`"([^`"]+)`"\)"
                Replace = "t(`"`$1`", `"Fallback text`")"
                Description = "Thêm fallback text cho t() calls với double quotes"
            }
        )
        
        foreach ($pattern in $patterns) {
            if ($content -match $pattern.Find) {
                $content = $content -replace $pattern.Find, $pattern.Replace
                Write-Host "  ✅ $($pattern.Description)" -ForegroundColor Green
            }
        }
        
        # Lưu file đã sửa
        Set-Content $file $content -Encoding UTF8
        Write-Host "  💾 Đã lưu file" -ForegroundColor Green
    } else {
        Write-Host "❌ Không tìm thấy file: $file" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Hoàn thành sửa hệ thống đa ngôn ngữ!" -ForegroundColor Green
Write-Host "`n📋 Các bước tiếp theo:" -ForegroundColor Yellow
Write-Host "1. Kiểm tra các component đã sửa" -ForegroundColor White
Write-Host "2. Test chuyển đổi ngôn ngữ" -ForegroundColor White
Write-Host "3. Kiểm tra fallback text có hiển thị đúng không" -ForegroundColor White
Write-Host "4. Cập nhật fallback text cho phù hợp" -ForegroundColor White

Write-Host "`n📚 Xem hướng dẫn chi tiết tại: I18N_USAGE_GUIDE.md" -ForegroundColor Cyan
