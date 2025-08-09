@echo off
echo Testing Recalculate Fees for Invoice #49
echo ======================================
echo.

echo 1. Checking invoice #49 details...
echo ----------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/49/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 2. Testing recalculate fees for August 2025...
echo ---------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/recalculate-fees?billingPeriod=2025-08" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 3. Waiting 2 seconds for processing...
echo --------------------------------------
timeout /t 2 /nobreak > nul

echo.
echo.
echo 4. Checking invoice #49 details again...
echo ---------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/49/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Creating new invoice for August 2025...
echo -----------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2025&month=8" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 6. Waiting 3 seconds for processing...
echo --------------------------------------
timeout /t 3 /nobreak > nul

echo.
echo.
echo 7. Checking latest invoice...
echo -----------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Check console for DEBUG messages about MonthlyFeeServices
pause 