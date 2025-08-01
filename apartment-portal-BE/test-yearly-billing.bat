@echo off
echo ========================================
echo TEST YEARLY BILLING - TẠO HÓA ĐƠN ĐỒNG LOẠT
echo ========================================

echo.
echo 1. Tạo cấu hình phí cho năm 2025...
echo.

REM Tạo cấu hình phí trước
curl -X POST "http://localhost:8080/api/admin/yearly-billing/fee-config" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json" ^
     -d "{\"year\": 2025, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
echo.

echo.
echo 2. Tạo hóa đơn đồng loạt cho tất cả căn hộ năm 2025...
echo.

REM Tạo hóa đơn đồng loạt
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json" ^
     -d "{\"year\": 2025, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
echo.

echo.
echo 3. Kiểm tra số lượng hóa đơn đã tạo...
echo.

REM Kiểm tra số lượng hóa đơn
curl -X GET "http://localhost:8080/api/admin/invoices" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo 4. Kiểm tra cấu hình phí...
echo.

REM Kiểm tra cấu hình phí
curl -X GET "http://localhost:8080/api/admin/yearly-billing/config/2025" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
pause 