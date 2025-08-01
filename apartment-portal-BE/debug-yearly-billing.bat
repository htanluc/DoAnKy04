@echo off
echo ========================================
echo DEBUG YEARLY BILLING API
echo ========================================

echo.
echo 1. Testing rate limiting...
echo.

REM Test multiple rapid requests
for /l %%i in (1,1,5) do (
    echo Request %%i:
    curl -X GET "http://localhost:8080/api/admin/yearly-billing/config/2025/7" ^
         -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
         -H "Content-Type: application/json"
    echo.
    timeout /t 1 /nobreak >nul
)

echo.
echo 2. Testing cache...
echo.

REM Test cache by making same request multiple times
echo First request (should hit database):
curl -X GET "http://localhost:8080/api/admin/yearly-billing/config/2025/7" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo Second request (should use cache):
curl -X GET "http://localhost:8080/api/admin/yearly-billing/config/2025/7" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo 3. Clear cache...
echo.

curl -X POST "http://localhost:8080/api/admin/yearly-billing/clear-cache" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo 4. Check cache status...
echo.

curl -X GET "http://localhost:8080/api/admin/yearly-billing/cache-status" ^
     -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" ^
     -H "Content-Type: application/json"
echo.

echo.
echo ========================================
echo DEBUG COMPLETE
echo ========================================
pause 