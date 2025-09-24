# Test script for Water Meter Validation API
# Đảm bảo backend đang chạy trên localhost:8080

$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

Write-Host "=== Test Water Meter Validation API ===" -ForegroundColor Green

# Test Case 1: Tạo hóa đơn khi có căn hộ chưa ghi chỉ số nước (không skip validation)
Write-Host "`nTest Case 1: Tạo hóa đơn với validation chỉ số nước" -ForegroundColor Yellow

$body1 = @{
    year = 2024
    month = 12
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/api/admin/yearly-billing/generate-monthly-invoices" -Method POST -Headers $headers -Body $body1
    Write-Host "Response: " -ForegroundColor Cyan
    $response1 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error Response: " -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# Test Case 2: Tạo hóa đơn khi bỏ qua kiểm tra chỉ số nước
Write-Host "`nTest Case 2: Tạo hóa đơn bỏ qua validation chỉ số nước" -ForegroundColor Yellow

$body2 = @{
    year = 2024
    month = 12
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/admin/yearly-billing/generate-monthly-invoices?skipWaterValidation=true" -Method POST -Headers $headers -Body $body2
    Write-Host "Response: " -ForegroundColor Cyan
    $response2 | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error Response: " -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=== Test completed ===" -ForegroundColor Green
