@echo off
echo Testing Invoice Creation with Default Items (0 if no data)
echo =======================================================
echo.

echo 1. Creating invoice for January 2024...
echo --------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Waiting 3 seconds for processing...
echo --------------------------------------
timeout /t 3 /nobreak > nul

echo.
echo.
echo 3. Checking all invoices...
echo ---------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Checking invoice items for first invoice...
echo ----------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/1/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Testing recalculate fees for January 2024...
echo ----------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/recalculate-fees?billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 6. Checking invoice items again after recalculate...
echo ---------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/1/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Expected results:
echo - Service Fee: Always present (based on apartment area)
echo - Water Fee: Present with 0 if no water readings
echo - Vehicle Fee: Present with 0 if no vehicles
echo - All invoices should have 3 items (Service, Water, Vehicle)
echo - Check console for DEBUG messages
pause 