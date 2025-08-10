@echo off
echo Testing apartment 52 water billing...

echo.
echo 1. Generating NEW invoice for apartment 52 (2025-08):
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month" ^
  -H "Content-Type: application/json" ^
  -d "{\"month\":\"2025-08\",\"apartmentIds\":[52]}"

echo.
echo DONE! Check the server log for water fee calculation messages.
echo Look for: "Apartment 52 - Consumption: 2909.00"