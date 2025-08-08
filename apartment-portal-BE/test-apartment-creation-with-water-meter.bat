@echo off
echo ==========================================
echo Test Creation of New Apartment with Automatic Water Meter Initialization
echo ==========================================

echo.
echo 1. Testing POST /api/apartments - Create new apartment
curl -X POST "http://localhost:8080/api/apartments" ^
  -H "Content-Type: application/json" ^
  -d "{\"buildingId\": 1, \"floorNumber\": 5, \"unitNumber\": \"A5-99\", \"area\": 80.0, \"status\": \"VACANT\"}"

echo.
echo.
echo 2. Checking if water meter was auto-initialized for current month
curl -X GET "http://localhost:8080/api/admin/water-readings/by-month?month=2024-12" ^
  -H "Accept: application/json"

echo.
echo.
echo 3. Testing manual water meter initialization for all apartments
curl -X POST "http://localhost:8080/api/admin/water-readings/init-all-apartments" ^
  -H "Content-Type: application/json"

echo.
echo.
echo 4. Testing manual current month template generation
curl -X POST "http://localhost:8080/api/admin/water-readings/generate-current-month" ^
  -H "Content-Type: application/json"

echo.
echo.
echo ==========================================
echo Test Complete! Check the responses above to verify:
echo - New apartment was created successfully
echo - Water meter reading was automatically initialized with value 0
echo - All utilities work correctly
echo ==========================================
pause