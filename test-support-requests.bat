@echo off
echo Testing Support Requests API...
echo.

echo 1. Getting all support requests...
curl -X GET "http://localhost:8080/api/admin/support-requests" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 2. Getting users to check user data...
curl -X GET "http://localhost:8080/api/admin/users" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 3. Getting apartment residents to check resident data...
curl -X GET "http://localhost:8080/api/apartment-residents" ^
  -H "Content-Type: application/json"
echo.
echo.

echo Test completed!
pause 