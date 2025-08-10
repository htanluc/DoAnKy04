@echo off
echo ========================================
echo TEST TÍNH PHÍ GỬI XE CHI TIẾT
echo ========================================
echo.

echo 🚗 Test tính phí gửi xe với chi tiết từng loại xe:
echo    - Xe máy: 50000 VND/tháng
echo    - Ô tô 4 chỗ: 200000 VND/tháng  
echo    - Ô tô 7 chỗ: 250000 VND/tháng
echo.

echo 📋 Tạo hóa đơn cho căn hộ 1 tháng 12/2024:
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=1&billingPeriod=2024-12" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -s

echo.
echo.

echo 📊 Kiểm tra chi tiết hóa đơn của căn hộ 1:
curl -X GET "http://localhost:8080/api/admin/invoices/1" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -s | jq .

echo.
echo ========================================
echo HOÀN THÀNH TEST
echo ========================================
pause 