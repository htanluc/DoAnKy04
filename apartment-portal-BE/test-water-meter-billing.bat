@echo off
echo Testing water meter billing for apartment 56...

echo.
echo 1. Testing invoice generation for August 2025...
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2025&month=8" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 2. Getting latest invoice for apartment 56...
curl -X GET "http://localhost:8080/api/admin/apartments/56/latest-invoice" ^
  -H "Accept: application/json"

echo.
echo.
echo 3. Getting water meter readings for apartment 56...
curl -X GET "http://localhost:8080/api/admin/apartments/56/water-readings" ^
  -H "Accept: application/json"

echo.
echo.
echo 4. Manual water meter fee generation for apartment 56, August 2025...
curl -X POST "http://localhost:8080/api/admin/invoices/debug-water-fee?apartmentId=56&billingPeriod=2025-08" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 5. Getting updated invoice details...
curl -X GET "http://localhost:8080/api/admin/apartments/56/latest-invoice" ^
  -H "Accept: application/json"

echo.
echo Test completed!