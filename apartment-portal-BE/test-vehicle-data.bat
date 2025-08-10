@echo off
echo Testing Vehicle Data and Monthly Invoice Generation
echo ===================================================

REM Test get all vehicles to see if each resident has motorcycle and car
echo.
echo 1. Testing get all vehicles...
curl -X GET "http://localhost:8080/api/vehicles" ^
  -H "Content-Type: application/json" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 2. Testing generateMonthlyInvoicesForAllApartments with vehicle fees...
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-monthly-invoices" ^
  -H "Content-Type: application/json" ^
  -d "{\"year\": 2024, \"month\": 12, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 3. Testing get invoices to check vehicle fees in invoice items...
curl -X GET "http://localhost:8080/api/invoices" ^
  -H "Content-Type: application/json" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo Test completed!
pause