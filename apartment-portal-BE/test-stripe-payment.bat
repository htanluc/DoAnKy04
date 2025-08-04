@echo off
echo Testing Stripe Payment Flow...
echo.

echo 1. Testing debug stats...
curl -X GET "http://localhost:8080/api/payments/stripe/debug-stats"
echo.
echo.

echo 2. Testing regex parsing with problematic orderInfo...
curl -X GET "http://localhost:8080/api/payments/stripe/test-regex?orderInfo=Thanh%%20to%%C3%%A1n%%20h%%C3%%B3a%%20%%C4%%91%%C6%%A1n%%202024-11%%20-%%20User%%20110"
echo.
echo.

echo 3. Testing regex parsing with normal orderInfo...
curl -X GET "http://localhost:8080/api/payments/stripe/test-regex?orderInfo=Thanh%%20to%%C3%%A1n%%20h%%C3%%B3a%%20%%C4%%91%%C6%%A1n%%201%%20-%%20User%%20110"
echo.
echo.

echo 4. Creating a test payment directly...
curl -X POST "http://localhost:8080/api/payments/stripe/create-payment" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "invoiceId=1&userId=110&amount=1000000&sessionId=test_session_999"
echo.
echo.

echo 5. Final debug stats...
curl -X GET "http://localhost:8080/api/payments/stripe/debug-stats"
echo.
echo.

pause 