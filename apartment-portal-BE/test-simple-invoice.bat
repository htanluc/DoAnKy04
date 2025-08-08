@echo off
echo Testing Simple Invoice Creation with Items
echo =========================================
echo.

echo 1. Creating invoice for January 2024...
echo --------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Waiting 2 seconds for processing...
echo --------------------------------------
timeout /t 2 /nobreak > nul

echo.
echo.
echo 3. Checking latest invoice...
echo -----------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Checking invoice items for latest invoice...
echo ----------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/1/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Check the console output for DEBUG messages from MonthlyFeeServices
pause 