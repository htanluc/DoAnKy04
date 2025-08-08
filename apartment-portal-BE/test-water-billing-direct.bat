@echo off
echo ========================================
echo DIRECT WATER BILLING TEST
echo ========================================

echo.
echo 1. Generating invoice for apartment 52 (2025-08):
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month" ^
  -H "Content-Type: application/json" ^
  -d "{\"month\":\"2025-08\",\"year\":2025,\"apartmentIds\":[52]}"

echo.
echo 2. Check server logs for these messages:
echo    - "DEBUG: Số lượng MonthlyFeeService được inject: X"
echo    - "DEBUG: - WaterMeterMonthlyFeeService"
echo    - "DEBUG: Đang chạy WaterMeterMonthlyFeeService"
echo    - "Apartment 52 - Consumption: 2909.00"
echo    - "WATER_FEE"

echo.
echo ========================================
echo If no "WaterMeterMonthlyFeeService" in logs = Spring injection failed!
echo If exception in logs = Logic error!
echo ========================================