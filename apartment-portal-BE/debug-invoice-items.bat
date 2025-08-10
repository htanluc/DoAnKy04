@echo off
echo Debugging Invoice Items Issue
echo =============================
echo.

echo 1. Checking if there are any invoices...
echo ----------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 2. Checking first invoice details...
echo -----------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/1/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 3. Testing recalculate fees for existing invoices...
echo ---------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/recalculate-fees?billingPeriod=2024-11" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Checking invoice details again after recalculate...
echo -----------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/1/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Creating new invoice for January 2024...
echo -------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 6. Checking latest invoice details...
echo -------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 7. Checking latest invoice items...
echo -----------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/10/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Debug completed!
echo.
echo Expected issues:
echo - ServiceFeeMonthlyFeeService should always add service fee
echo - WaterMeterMonthlyFeeService only adds if water readings exist
echo - VehicleMonthlyFeeService only adds if vehicles exist
echo - Check if fee config exists for the month
pause 