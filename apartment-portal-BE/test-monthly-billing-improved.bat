@echo off
echo Testing Monthly Billing with Improved Total Calculation
echo ======================================================

REM Test tạo hóa đơn đồng loạt cho tháng hiện tại
echo.
echo 1. Testing generateMonthlyInvoicesForAllApartments...
curl -X POST "http://localhost:8080/api/yearly-billing/generate-monthly-invoices" ^
  -H "Content-Type: application/json" ^
  -d "{\"year\": 2024, \"month\": 12}" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 2. Testing validateAndFixInvoiceTotals...
curl -X POST "http://localhost:8080/api/yearly-billing/validate-fix-totals" ^
  -H "Content-Type: application/json" ^
  -d "{\"year\": 2024, \"month\": 12}" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 3. Testing get invoices for period...
curl -X GET "http://localhost:8080/api/invoices?billingPeriod=2024-12" ^
  -H "Content-Type: application/json" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo Test completed!
pause 