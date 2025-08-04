@echo off
echo Testing Invoice Debug Endpoint...
echo.

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo Testing invoice ID 1...
curl -X GET "http://localhost:8080/api/payments/stripe/debug-invoice/1" -H "Content-Type: application/json"

echo.
echo.
echo Testing payment statistics...
curl -X GET "http://localhost:8080/api/payments/stripe/debug-stats" -H "Content-Type: application/json"

echo.
echo.
echo Testing all payments for invoice 1...
curl -X GET "http://localhost:8080/api/payments/invoice/1" -H "Content-Type: application/json"

echo.
echo.
echo Done!
pause 