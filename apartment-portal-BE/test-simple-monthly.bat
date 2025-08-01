@echo off
echo ========================================
echo TEST ĐƠN GIẢN - TẠO HÓA ĐƠN THEO THÁNG
echo ========================================

echo.
echo Tạo hóa đơn cho tất cả căn hộ tháng 7/2025...
echo.

REM Tạo hóa đơn cho tháng 7/2025
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/7" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json" ^
     -d "{\"year\": 2025, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
pause 