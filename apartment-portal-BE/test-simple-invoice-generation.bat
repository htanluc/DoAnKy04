@echo off
echo Testing simple invoice generation for August 2025...

echo.
echo Generating invoices for August 2025 (this should trigger water meter billing)...
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2025&month=8" ^
  -H "Content-Type: application/json"

echo.
echo.
echo Done! Check server logs to see if WaterMeterMonthlyFeeService was executed.
echo If water billing is working, you should see debug messages about water meter fee calculation.

pause