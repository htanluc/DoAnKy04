@echo off
echo Testing Water Fee Calculation...
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

echo 3. Getting water meter readings for apartment 51...
curl -X GET "http://localhost:8080/api/admin/water-meter-readings?apartmentId=51" ^
  -H "Content-Type: application/json"
echo.
echo.

echo 4. Testing water fee generation directly...
curl -X POST "http://localhost:8080/api/admin/water-meter/generate-fee?billingPeriod=2025-08&apartmentId=51" ^
  -H "Content-Type: application/json"
echo.
echo.

echo Test completed!
pause 