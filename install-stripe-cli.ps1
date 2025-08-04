# Script cài đặt Stripe CLI
Write-Host "Đang tải Stripe CLI..." -ForegroundColor Green

# Tạo thư mục temp nếu chưa có
$tempDir = "$env:TEMP\stripe-cli"
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force
}

# Tải Stripe CLI
$stripeUrl = "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_windows_x86_64.zip"
$zipPath = "$tempDir\stripe-cli.zip"
$exePath = "$tempDir\stripe.exe"

Write-Host "Tải từ: $stripeUrl" -ForegroundColor Yellow
Invoke-WebRequest -Uri $stripeUrl -OutFile $zipPath

# Giải nén
Write-Host "Đang giải nén..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

# Copy vào thư mục hiện tại
Write-Host "Đang copy Stripe CLI..." -ForegroundColor Yellow
Copy-Item -Path $exePath -Destination ".\stripe.exe" -Force

Write-Host "Stripe CLI đã được cài đặt thành công!" -ForegroundColor Green
Write-Host "Chạy lệnh: .\stripe.exe login" -ForegroundColor Cyan 