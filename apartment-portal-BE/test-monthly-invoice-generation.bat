@echo off
echo Testing Monthly Invoice Generation (Single Month Only)
echo ====================================================

echo.
echo 1. Generate invoices for ALL apartments for month 2024-01 ONLY
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2024/1" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -d "{\"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"

echo.
echo.
echo 2. Check invoices for month 2024-01 only
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices?billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 3. Generate invoices for ALL apartments for month 2024-02 ONLY
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2024/2" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -d "{\"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"

echo.
echo.
echo 4. Check invoices for month 2024-02 only
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices?billingPeriod=2024-02" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Check total invoices for year 2024 (should only have 2 months)
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/yearly-billing/invoice-stats/2024" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo This test verifies that:
echo - Only the specified month gets invoices created
echo - Other months are not affected
echo - Each month is created independently
echo.
echo CORRECT API for single month: /api/admin/yearly-billing/generate-month/{year}/{month}
echo WRONG API (creates 12 months): /api/admin/yearly-billing/generate-once
pause 