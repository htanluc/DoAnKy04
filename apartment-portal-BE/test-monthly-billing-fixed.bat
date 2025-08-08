@echo off
echo Testing Monthly Billing API - Fixed Version
echo ==========================================

echo.
echo 1. Testing Monthly Billing API (InvoiceController) - Should create for 1 month only
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate-all?billingPeriod=2025-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Testing Yearly Billing API - Generate for 1 month only (CORRECT API)
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/1" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere" ^
  -d "{\"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"

echo.
echo.
echo 3. Check invoice statistics for 2025 (to see what was created)
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/yearly-billing/invoice-stats/2025" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Check all invoices to see billing periods
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo NOTE: If you see invoices for multiple months, you might be calling the wrong API.
echo Use /api/admin/yearly-billing/generate-month/{year}/{month} for single month only.
pause 