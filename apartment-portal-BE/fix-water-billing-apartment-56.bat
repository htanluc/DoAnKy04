@echo off
echo ============================================
echo FIX: Water Billing for Apartment 56
echo ============================================

echo.
echo Step 1: Adding water meter reading for apartment 56...
echo.
echo This will add:
echo - Apartment: 56
echo - Month: 2025-08  
echo - Previous: 0 m3
echo - Current: 22 m3
echo - Consumption: 22 m3
echo - Expected fee: 22 x 15,000 = 330,000 VND

echo.
echo You need to run this SQL manually in your database:
echo.
type fix-apartment-56-water-billing.sql

echo.
echo.
echo Step 2: After adding the data, regenerate invoice for August 2025:
echo.
echo curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2025&month=8" 
echo   -H "Authorization: Bearer [YOUR_JWT_TOKEN]"

echo.
echo.
echo ============================================
echo MANUAL STEPS:
echo ============================================
echo 1. Connect to your database (MySQL/H2)
echo 2. Run the SQL commands from fix-apartment-56-water-billing.sql
echo 3. Use admin login to regenerate invoice for August 2025
echo 4. Check if apartment 56 now has water fee in invoice
echo ============================================

pause