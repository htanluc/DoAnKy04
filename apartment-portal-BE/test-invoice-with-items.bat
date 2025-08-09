@echo off
echo Testing Invoice Creation with Items
echo ==================================
echo.

echo 1. Creating invoice for all apartments for January 2024...
echo ---------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Checking all invoices created...
echo -----------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 3. Checking invoice details for first invoice...
echo ------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/1/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Checking invoice details for second invoice...
echo -------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/2/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Testing recalculate fees for January 2024...
echo ------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/recalculate-fees?billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 6. Checking invoice details again after recalculate...
echo -----------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/1/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Expected results:
echo - Invoices should be created with totalAmount > 0
echo - Invoice items should be added (Service Fee, Water Fee, Vehicle Fee)
echo - Each item should have proper description and amount
echo - Recalculate should add items if they were missing
pause 