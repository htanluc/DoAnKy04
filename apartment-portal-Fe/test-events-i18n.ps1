# Test i18n cho Events Page
Write-Host "Testing i18n cho Events Page..." -ForegroundColor Green

# Dừng các process Node.js đang chạy
Write-Host "Dừng các process Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Xóa cache Next.js
Write-Host "Xóa cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Đã xóa cache .next" -ForegroundColor Green
}

# Cài đặt dependencies nếu cần
if (-not (Test-Path "node_modules")) {
    Write-Host "Cài đặt dependencies..." -ForegroundColor Yellow
    npm install
}

# Khởi động development server
Write-Host "Khởi động development server..." -ForegroundColor Yellow
Write-Host "Mở trình duyệt và truy cập: http://localhost:3000/admin-dashboard/events" -ForegroundColor Cyan
Write-Host "Kiểm tra:" -ForegroundColor Cyan
Write-Host "1. Dropdown 'Tất cả trạng thái' có hiển thị đúng tiếng Việt/Anh không" -ForegroundColor White
Write-Host "2. Các status khác: 'Sắp diễn ra', 'Đang diễn ra', 'Đã kết thúc', 'Đã hủy'" -ForegroundColor White
Write-Host "3. Thay đổi ngôn ngữ để kiểm tra i18n" -ForegroundColor White

npm run dev
