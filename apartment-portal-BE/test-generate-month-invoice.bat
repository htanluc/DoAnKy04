@echo off
echo Testing Generate Invoice for Specific Month
echo ==========================================
echo.

echo 1. Testing create invoice for all apartments for January 2024...
echo ----------------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Testing create invoice for all apartments for February 2024...
echo -----------------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=2" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 3. Testing invalid month (should fail)...
echo -----------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=13" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 4. Testing invalid year (should fail)...
echo ----------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2019&month=1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 5. Checking all invoices created...
echo -----------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 6. Checking invoices for specific apartments...
echo ----------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55,57" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Expected results:
echo - Only invoices for specified month should be created
echo - No invoices for other months should be affected
echo - Validation should work for invalid month/year
echo - Each apartment should have invoice for the specified month only
pause 