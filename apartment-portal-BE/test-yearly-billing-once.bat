@echo off
echo ========================================
echo TEST YEARLY BILLING - TẠO HÓA ĐƠN MỘT LẦN
echo ========================================

echo.
echo 1. Tạo hóa đơn đồng loạt một lần cho năm 2025...
echo.

REM Tạo hóa đơn đồng loạt một lần
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-once" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json" ^
     -d "{\"year\": 2025, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
echo.

echo.
echo 2. Kiểm tra thống kê hóa đơn đã tạo...
echo.

REM Kiểm tra thống kê hóa đơn
curl -X GET "http://localhost:8080/api/admin/yearly-billing/invoice-stats/2025" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo 3. Kiểm tra số lượng hóa đơn...
echo.

REM Kiểm tra số lượng hóa đơn
curl -X GET "http://localhost:8080/api/admin/invoices" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
pause 