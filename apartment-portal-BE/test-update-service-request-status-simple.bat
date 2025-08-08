@echo off
echo ========================================
echo TEST CẬP NHẬT TRẠNG THÁI ĐƠN GIẢN
echo ========================================
echo.

echo 🔧 Test cập nhật trạng thái service request (không gửi isCompleted):
echo    - Service Request ID: 22
echo    - Trạng thái: COMPLETED
echo    - Ghi chú: "Đã hoàn thành yêu cầu"
echo.

echo 📋 Cập nhật trạng thái service request:
curl -X PUT "http://localhost:8080/api/staff/support-requests/22/status" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ4MTYwMDB9.test-token" ^
  -d "{\"status\":\"COMPLETED\",\"resolutionNotes\":\"Đã hoàn thành yêu cầu\"}" ^
  -s

echo.
echo ========================================
echo HOÀN THÀNH TEST
echo ========================================
pause 