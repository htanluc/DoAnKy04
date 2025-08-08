# Script test Enhanced UI cho Apartment User Portal
Write-Host "🧪 Test Enhanced UI cho Trải Nghiệm Căn Hộ" -ForegroundColor Green

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

Write-Host "🔍 Đang kiểm tra các file Enhanced UI..." -ForegroundColor Yellow

# Kiểm tra các file đã tạo
$filesToCheck = @(
    "src/components/layout/enhanced-sidebar.tsx",
    "src/components/layout/enhanced-header.tsx", 
    "src/components/layout/enhanced-layout.tsx",
    "src/app/dashboard/layout.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/globals.css"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - Không tìm thấy!" -ForegroundColor Red
    }
}

Write-Host "" -ForegroundColor White
Write-Host "🚀 Đang khởi động development server..." -ForegroundColor Yellow
Write-Host "📱 Mở trình duyệt tại: http://localhost:3001" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🧪 Test Checklist:" -ForegroundColor Yellow
Write-Host "   • Kiểm tra background themes cho từng trang" -ForegroundColor White
Write-Host "   • Test responsive design trên mobile" -ForegroundColor White
Write-Host "   • Verify sidebar và header animations" -ForegroundColor White
Write-Host "   • Test navigation giữa các trang" -ForegroundColor White
Write-Host "   • Kiểm tra accessibility (ARIA labels)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🎯 Chạy 'npm run dev' để khởi động server" -ForegroundColor Cyan
