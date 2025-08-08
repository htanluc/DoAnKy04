# Script cập nhật tất cả các trang con trong dashboard
Write-Host "🔄 Cập nhật các trang con trong dashboard..." -ForegroundColor Green

# Danh sách các trang cần cập nhật
$pages = @(
    "src/app/dashboard/invoices/page.tsx",
    "src/app/dashboard/events/page.tsx", 
    "src/app/dashboard/facility-bookings/page.tsx",
    "src/app/dashboard/service-requests/page.tsx",
    "src/app/dashboard/update-info/page.tsx",
    "src/app/dashboard/vehicles/page.tsx",
    "src/app/dashboard/activity-logs/page.tsx",
    "src/app/dashboard/announcements/page.tsx"
)

Write-Host "📋 Các trang sẽ được cập nhật:" -ForegroundColor Yellow
foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "✅ $page" -ForegroundColor Green
    } else {
        Write-Host "❌ $page - Không tìm thấy!" -ForegroundColor Red
    }
}

Write-Host "" -ForegroundColor White
Write-Host "🎨 Background themes sẽ được áp dụng:" -ForegroundColor Cyan
Write-Host "   • /invoices -> invoices-background" -ForegroundColor White
Write-Host "   • /events -> events-background" -ForegroundColor White
Write-Host "   • /facility-bookings -> facility-background" -ForegroundColor White
Write-Host "   • /service-requests -> service-background" -ForegroundColor White
Write-Host "   • /update-info -> profile-background" -ForegroundColor White
Write-Host "   • /vehicles -> vehicles-background" -ForegroundColor White
Write-Host "   • /activity-logs -> activity-background" -ForegroundColor White
Write-Host "   • /announcements -> announcements-background" -ForegroundColor White

Write-Host "" -ForegroundColor White
Write-Host "🚀 Để test các thay đổi:" -ForegroundColor Yellow
Write-Host "   1. Chạy 'npm run dev'" -ForegroundColor White
Write-Host "   2. Navigate giữa các trang để xem background themes" -ForegroundColor White
Write-Host "   3. Test responsive design trên mobile" -ForegroundColor White
Write-Host "   4. Verify sidebar và header hoạt động đúng" -ForegroundColor White

Write-Host "" -ForegroundColor White
Write-Host "📝 Lưu ý:" -ForegroundColor Yellow
Write-Host "   • Background themes đã được định nghĩa trong globals.css" -ForegroundColor White
Write-Host "   • EnhancedLayout sẽ tự động áp dụng background dựa trên route" -ForegroundColor White
Write-Host "   • Responsive design đã được cải thiện" -ForegroundColor White
