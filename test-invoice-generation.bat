@echo off
echo Testing Invoice Generation with Water and Vehicle Fees...
echo.

echo 1. Creating invoice for apartment 51, period 2025-08...
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=51&billingPeriod=2025-08" ^
  -H "Content-Type: application/json" ^
  -d "{}"
echo.
echo.

echo 2. Getting invoice details for apartment 51...
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=51" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 3. Getting specific invoice by ID (if exists)...
curl -X GET "http://localhost:8080/api/admin/invoices/59" ^
  -H "Content-Type: application/json"
echo.
echo.

echo Test completed!
pause 