@echo off
echo ========================================
echo TEST TẠO HÓA ĐƠN THÁNG VÀ CHI TIẾT
echo ========================================

echo.
echo Đang chạy test kiểm tra tạo hóa đơn tháng...
echo.

mvn test -Dtest=SimpleInvoiceTest#testGenerateInvoiceWithDetails

echo.
echo ========================================
echo HOÀN THÀNH TEST
echo ========================================
pause 