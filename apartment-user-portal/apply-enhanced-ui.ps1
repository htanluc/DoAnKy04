# Script áp dụng Enhanced UI cho Apartment User Portal
Write-Host "🎨 Áp dụng Enhanced UI cho Trải Nghiệm Căn Hộ" -ForegroundColor Green

# Kiểm tra Node.js và npm
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js hoặc npm không được cài đặt!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js từ https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra thư mục dự án
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Không tìm thấy package.json!" -ForegroundColor Red
    Write-Host "Vui lòng chạy script này trong thư mục dự án apartment-user-portal" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Đang cài đặt dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔧 Đang tạo thư mục components/layout..." -ForegroundColor Yellow
if (-not (Test-Path "src/components/layout")) {
    New-Item -ItemType Directory -Path "src/components/layout" -Force
}

Write-Host "✅ Enhanced UI đã được áp dụng thành công!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 Các tính năng mới đã được thêm:" -ForegroundColor Cyan
Write-Host "   • Background themes cho từng trang" -ForegroundColor White
Write-Host "   • Enhanced sidebar với gradient và animation" -ForegroundColor White
Write-Host "   • Enhanced header với thời gian, thời tiết" -ForegroundColor White
Write-Host "   • Responsive design cho mobile" -ForegroundColor White
Write-Host "   • Accessibility improvements" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📖 Xem hướng dẫn chi tiết tại: ENHANCED_UI_GUIDE.md" -ForegroundColor Cyan
Write-Host "📊 Xem phân tích layout tại: LAYOUT_ANALYSIS.md" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🚀 Để sử dụng UI mới:" -ForegroundColor Yellow
Write-Host "   1. Import EnhancedLayout trong layout component" -ForegroundColor White
Write-Host "   2. Thay thế Sidebar và Header cũ" -ForegroundColor White
Write-Host "   3. Background sẽ tự động áp dụng dựa trên route" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🎯 Chạy 'npm run dev' để khởi động server" -ForegroundColor Cyan
