@echo off
echo ========================================
echo TEST TẠO HÓA ĐƠN ĐỒNG LOẠT ĐẦY ĐỦ
echo ========================================
echo.

echo 🚀 Bắt đầu test tạo hóa đơn đồng loạt với đầy đủ các loại phí...
echo.

echo 📋 Test tạo hóa đơn cho tháng 12/2024 với đầy đủ các loại phí:
echo    - Phí dịch vụ (dựa trên diện tích)
echo    - Phí nước (dựa trên chỉ số đồng hồ)
echo    - Phí gửi xe (dựa trên loại xe)
echo.

curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month-complete?year=2024&month=12" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -v

echo.
echo ========================================
echo KẾT QUẢ TEST
echo ========================================
echo.

echo 📊 Kiểm tra hóa đơn đã tạo:
curl -X GET "http://localhost:8080/api/admin/invoices?billingPeriod=2024-12" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -s | jq .

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