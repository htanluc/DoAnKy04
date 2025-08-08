@echo off
echo ========================================================
echo COMPLETE FIX: Water Billing Issue for Apartment 56
echo ========================================================

echo.
echo PROBLEM ANALYSIS:
echo ✗ Apartment 56 exists but has no water meter reading for 2025-08
echo ✗ Database sample only has apartments 1-50 with 2024 data
echo ✗ Frontend shows 22 m³ but it's not saved in database  
echo ✗ WaterMeterMonthlyFeeService can't find data to calculate fee

echo.
echo SOLUTION STEPS:
echo ========================================================

echo.
echo Step 1: Add water meter reading for apartment 56 (2025-08)
echo.
curl -X POST "http://localhost:8080/fix-water-56"

echo.
echo.
echo Step 2: Check if data was added successfully
echo.
curl -X GET "http://localhost:8080/debug-water-56"

echo.
echo.
echo Step 3: Regenerate invoice for August 2025 (requires admin login)
echo Note: You need to use admin credentials for this
echo.
echo curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2025&month=8" ^
echo   -H "Authorization: Bearer [YOUR_ADMIN_JWT_TOKEN]"

echo.
echo.
echo ========================================================
echo EXPECTED RESULTS:
echo ========================================================
echo ✓ Water meter reading: 22 m³ consumption
echo ✓ Water fee calculation: 22 × 15,000 = 330,000 VND  
echo ✓ Invoice total: 400,000 (service) + 330,000 (water) = 730,000 VND
echo ✓ Invoice items will include WATER_FEE
echo ========================================================

echo.
echo MANUAL VERIFICATION:
echo 1. Check apartment 56 invoice details
echo 2. Look for "WATER_FEE" item with 330,000 VND
echo 3. Total should be ~730,000 VND instead of 400,000 VND

pause