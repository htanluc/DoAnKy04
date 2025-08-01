@echo off
echo ========================================
echo TEST MONTHLY BILLING - TẠO HÓA ĐƠN THEO THÁNG
echo ========================================

echo.
echo 1. Tạo hóa đơn cho tất cả căn hộ tháng 7/2025...
echo.

REM Tạo hóa đơn cho tháng 7/2025
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/7" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json" ^
     -d "{\"year\": 2025, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
echo.

REM Đợi 2 giây trước khi gọi API tiếp theo
echo Đợi 2 giây...
timeout /t 2 /nobreak >nul

echo.
echo 2. Tạo hóa đơn cho tất cả căn hộ tháng 8/2025...
echo.

REM Tạo hóa đơn cho tháng 8/2025
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/8" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json" ^
     -d "{\"year\": 2025, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
echo.

REM Đợi 2 giây trước khi gọi API tiếp theo
echo Đợi 2 giây...
timeout /t 2 /nobreak >nul

echo.
echo 3. Kiểm tra thống kê hóa đơn tháng 7/2025...
echo.

REM Kiểm tra thống kê hóa đơn tháng 7
curl -X GET "http://localhost:8080/api/admin/yearly-billing/invoice-stats/2025" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

REM Đợi 2 giây trước khi gọi API tiếp theo
echo Đợi 2 giây...
timeout /t 2 /nobreak >nul

echo.
echo 4. Kiểm tra cấu hình phí tháng 7/2025...
echo.

REM Kiểm tra cấu hình phí tháng 7
curl -X GET "http://localhost:8080/api/admin/yearly-billing/config/2025/7" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
pause 