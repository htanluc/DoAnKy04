@echo off
echo Debugging Invoice Items Issue
echo =============================
echo.

echo 1. Creating new invoice for August 2025...
echo -----------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2025&month=8" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Waiting 5 seconds for processing...
echo --------------------------------------
timeout /t 5 /nobreak > nul

echo.
echo.
echo 3. Checking all invoices...
echo ---------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Testing recalculate fees for August 2025...
echo ----------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/recalculate-fees?billingPeriod=2025-08" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Waiting 3 seconds for processing...
echo --------------------------------------
timeout /t 3 /nobreak > nul

echo.
echo.
echo 6. Checking latest invoice items...
echo -----------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/50/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Check console for DEBUG messages:
echo - Number of MonthlyFeeServices injected
echo - ServiceFeeMonthlyFeeService debug messages
echo - WaterMeterMonthlyFeeService debug messages  
echo - VehicleMonthlyFeeService debug messages
echo - addInvoiceItem debug messages
pause 