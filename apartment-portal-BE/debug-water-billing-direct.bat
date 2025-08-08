@echo off
echo ============================================
echo DEBUG: Water Meter Billing for Apartment 56
echo ============================================

echo.
echo 1. Regenerating invoice for August 2025 (should include water billing)...
echo.
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2025&month=8" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json"

echo.
echo.
echo ============================================
echo 2. Manual water fee debug for apartment 56...
echo ============================================
curl -X POST "http://localhost:8080/api/admin/invoices/debug-water-fee?apartmentId=56&billingPeriod=2025-08" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json"

echo.
echo.
echo ============================================
echo 3. Recalculate ALL fees for August 2025...
echo ============================================
curl -X POST "http://localhost:8080/api/admin/invoices/recalculate-fees?billingPeriod=2025-08" ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json"

echo.
echo.
echo ============================================
echo DONE! Check server console for debug messages.
echo Look for:
echo - "WaterMeterMonthlyFeeService - Tim thay X can ho"
echo - "WaterMeterMonthlyFeeService - Can ho 56 phi nuoc X VND"
echo - "Da them phi nuoc cho can ho 56"
echo ============================================

pause