@echo off
echo Testing Invoice Generation with Vehicle Fees...
echo.

echo 1. Creating invoice for apartment 1, period 2024-12...
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=1&billingPeriod=2024-12" ^
  -H "Content-Type: application/json" ^
  -d "{}"
echo.
echo.

echo 2. Getting invoice details for apartment 1...
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=1" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 3. Getting all invoices to check vehicle fees...
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 4. Testing vehicle data...
curl -X GET "http://localhost:8080/api/admin/vehicles" ^
  -H "Content-Type: application/json"
echo.
echo.

echo Test completed!
pause 