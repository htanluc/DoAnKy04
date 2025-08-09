@echo off
echo ========================================
echo TEST TÍNH PHÍ GỬI XE CHI TIẾT ĐẦY ĐỦ
echo ========================================
echo.

echo 🚗 Test tính phí gửi xe với chi tiết từng loại xe:
echo    - Luôn hiển thị chi tiết từng loại xe
echo    - Ngay cả khi không có xe nào
echo    - Xe máy: 50000 VND/tháng
echo    - Ô tô 4 chỗ: 200000 VND/tháng  
echo    - Ô tô 7 chỗ: 250000 VND/tháng
echo.

echo 📋 Tạo hóa đơn cho căn hộ 52 (có thể không có xe):
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=52&billingPeriod=2025-08" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -s

echo.
echo.

echo 📊 Kiểm tra chi tiết hóa đơn của căn hộ 52:
curl -X GET "http://localhost:8080/api/admin/invoices/44" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -s | jq .

echo.
echo ========================================
echo HOÀN THÀNH TEST
echo ========================================
pause 