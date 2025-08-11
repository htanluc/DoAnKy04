@echo off
echo Testing VNPay API...
echo.

echo Test 1: Valid payment request
curl -X POST http://localhost:8080/api/payments/vnpay ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":\"TEST_ORDER_001\",\"amount\":50000,\"orderInfo\":\"Test payment\"}"

echo.
echo.
echo Test 2: Missing orderId
curl -X POST http://localhost:8080/api/payments/vnpay ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":50000,\"orderInfo\":\"Test payment\"}"

echo.
echo.
echo Test 3: Invalid amount
curl -X POST http://localhost:8080/api/payments/vnpay ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":\"TEST_ORDER_002\",\"amount\":0,\"orderInfo\":\"Test payment\"}"

echo.
echo.
echo Test 4: Missing orderInfo
curl -X POST http://localhost:8080/api/payments/vnpay ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":\"TEST_ORDER_003\",\"amount\":50000}"

echo.
echo Test completed.
pause
