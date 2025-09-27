# Script để test kết nối database và kiểm tra hóa đơn #3505
Write-Host "=== TEST KẾT NỐI DATABASE ===" -ForegroundColor Green

# Kiểm tra xem có thể kết nối đến database không
try {
    # Test kết nối đến MySQL
    $connectionString = "Server=localhost;Database=apartment_portal;Uid=root;Pwd=123456;"
    $connection = New-Object System.Data.Odbc.OdbcConnection($connectionString)
    $connection.Open()
    
    Write-Host "✅ Kết nối database thành công!" -ForegroundColor Green
    
    # Kiểm tra hóa đơn #3505
    $query = "SELECT id, apartment_id, billing_period, total_amount, status FROM invoices WHERE id = 3505"
    $command = New-Object System.Data.Odbc.OdbcCommand($query, $connection)
    $reader = $command.ExecuteReader()
    
    if ($reader.Read()) {
        Write-Host "`nHóa đơn #3505:" -ForegroundColor Cyan
        Write-Host "  - ID: $($reader['id'])" -ForegroundColor White
        Write-Host "  - Căn hộ: $($reader['apartment_id'])" -ForegroundColor White
        Write-Host "  - Kỳ: $($reader['billing_period'])" -ForegroundColor White
        Write-Host "  - Tổng tiền: $($reader['total_amount'].ToString('N0')) VND" -ForegroundColor White
        Write-Host "  - Trạng thái: $($reader['status'])" -ForegroundColor White
    } else {
        Write-Host "❌ Không tìm thấy hóa đơn #3505" -ForegroundColor Red
    }
    
    $reader.Close()
    
    # Kiểm tra các khoản phí chi tiết
    $query = "SELECT fee_type, description, amount FROM invoice_items WHERE invoice_id = 3505"
    $command = New-Object System.Data.Odbc.OdbcCommand($query, $connection)
    $reader = $command.ExecuteReader()
    
    Write-Host "`nChi tiết các khoản phí:" -ForegroundColor Cyan
    $totalFromItems = 0
    while ($reader.Read()) {
        $amount = [double]$reader['amount']
        $totalFromItems += $amount
        Write-Host "  - $($reader['fee_type']): $($amount.ToString('N0')) VND - $($reader['description'])" -ForegroundColor White
    }
    $reader.Close()
    
    Write-Host "`nTổng từ các khoản phí chi tiết: $($totalFromItems.ToString('N0')) VND" -ForegroundColor Yellow
    
    $connection.Close()
    
} catch {
    Write-Host "❌ Lỗi kết nối database: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== HOÀN THÀNH TEST ===" -ForegroundColor Green
