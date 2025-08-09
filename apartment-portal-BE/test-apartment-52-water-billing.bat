@echo off
echo ========================================
echo Testing Water Billing for Apartment 52
echo ========================================

echo.
echo 1. Check water meter reading for apartment 52:
curl -X GET "http://localhost:8080/api/apartments/52/water-readings" || echo "Failed to get water readings"

echo.
echo 2. Check latest invoice for apartment 52:
curl -X GET "http://localhost:8080/api/admin/apartments/52/latest-invoice" || echo "Failed to get latest invoice"

echo.
echo 3. Generate new invoice for apartment 52 (month 2025-08):
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month" ^
  -H "Content-Type: application/json" ^
  -d "{\"month\":\"2025-08\",\"apartmentIds\":[52]}" || echo "Failed to generate invoice"

echo.
echo 4. Check latest invoice again:
curl -X GET "http://localhost:8080/api/admin/apartments/52/latest-invoice" || echo "Failed to get updated invoice"

echo.
echo ========================================
echo Test completed!
echo ========================================
pause