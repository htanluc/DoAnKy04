@echo off
echo ========================================
echo Quick Restart and Debug Water Billing
echo ========================================

echo 1. Stopping any existing Gradle processes...
taskkill /f /im java.exe 2>nul
timeout /t 2

echo.
echo 2. Starting application in background...
start /b gradlew bootRun > app.log 2>&1

echo.
echo 3. Waiting for application to start (30 seconds)...
timeout /t 30

echo.
echo 4. Testing debug endpoint...
curl -X GET "http://localhost:8080/debug-water-56"

echo.
echo.
echo ========================================
echo Check app.log for full application logs
echo Look for apartment 56 water meter data
echo ========================================

pause