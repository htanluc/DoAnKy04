@echo off
echo ========================================
echo TEST NHANH TẠO HÓA ĐƠN ĐỒNG LOẠT ĐẦY ĐỦ
echo ========================================
echo.

echo 🚀 Test tạo hóa đơn đồng loạt cho tháng 12/2024...
echo.

curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month-complete?year=2024&month=12" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -s

echo.
echo ✅ Hoàn thành test!
pause 