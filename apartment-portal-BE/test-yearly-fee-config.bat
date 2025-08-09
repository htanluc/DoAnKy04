@echo off
echo Testing Yearly Fee Config Creation
echo ==================================
echo.

echo 1. Testing create yearly fee config for 2024...
echo ------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/yearly-billing/fee-config" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json" ^
  -d "{\"year\": 2024, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"

echo.
echo.
echo 2. Testing create yearly fee config for current year...
echo -------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-current-year" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json" ^
  -d "{\"year\": 2024, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"

echo.
echo.
echo 3. Checking fee config for January 2024...
echo -------------------------------------------
curl -X GET "http://localhost:8080/api/admin/yearly-billing/config/2024/1" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Checking all fee configs for 2024...
echo ----------------------------------------
curl -X GET "http://localhost:8080/api/admin/yearly-billing/config/2024" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Expected results:
echo - Fee config should be created for all 12 months of 2024
echo - Each month should have the same fee structure
echo - No invoices should be created (only config)
echo - Config can be retrieved for individual months or entire year
pause 