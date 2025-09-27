# Script để test sửa tổng tiền hóa đơn
Write-Host "=== TEST SỬA TỔNG TIỀN HÓA ĐƠN ===" -ForegroundColor Green

# Test sửa hóa đơn #3505
Write-Host "`n1. Test sửa hóa đơn #3505..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://172.16.1.45:8080/api/public/invoices/3505/fix-total" -Method POST -ContentType "application/json" -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Thành công!" -ForegroundColor Green
        Write-Host "Hóa đơn #$($result.invoiceId):" -ForegroundColor Cyan
        Write-Host "  - Tổng cũ: $($result.oldTotal.ToString('N0')) VND" -ForegroundColor White
        Write-Host "  - Tổng mới: $($result.newTotal.ToString('N0')) VND" -ForegroundColor White
        Write-Host "  - Chênh lệch: $($result.difference.ToString('N0')) VND" -ForegroundColor White
        Write-Host "  - Thông báo: $($result.message)" -ForegroundColor White
    } else {
        Write-Host "❌ Thất bại: $($result.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Lỗi kết nối: $($_.Exception.Message)" -ForegroundColor Red
}

# Test sửa tất cả hóa đơn
Write-Host "`n2. Test sửa tất cả hóa đơn..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://172.16.1.45:8080/api/public/invoices/fix-all-totals" -Method POST -ContentType "application/json" -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ Thành công!" -ForegroundColor Green
        Write-Host "Kết quả sửa tất cả hóa đơn:" -ForegroundColor Cyan
        Write-Host "  - Tổng hóa đơn: $($result.totalInvoices)" -ForegroundColor White
        Write-Host "  - Đã sửa: $($result.fixedCount)" -ForegroundColor White
        Write-Host "  - Bỏ qua: $($result.skippedCount)" -ForegroundColor White
        Write-Host "  - Tổng chênh lệch: $($result.totalDifference.ToString('N0')) VND" -ForegroundColor White
        Write-Host "  - Thông báo: $($result.message)" -ForegroundColor White
        
        # Hiển thị danh sách hóa đơn đã sửa
        if ($result.fixedInvoices -and $result.fixedInvoices.Count -gt 0) {
            Write-Host "`nDanh sách hóa đơn đã sửa:" -ForegroundColor Cyan
            foreach ($invoice in $result.fixedInvoices) {
                Write-Host "  - Hóa đơn #$($invoice.invoiceId) (Căn hộ $($invoice.apartmentId), Kỳ $($invoice.billingPeriod)): $($invoice.oldTotal.ToString('N0')) → $($invoice.newTotal.ToString('N0')) VND (chênh lệch: $($invoice.difference.ToString('N0')) VND)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "❌ Thất bại: $($result.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Lỗi kết nối: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== HOÀN THÀNH TEST ===" -ForegroundColor Green
