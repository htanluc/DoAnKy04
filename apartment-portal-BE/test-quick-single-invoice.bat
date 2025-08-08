@echo off
echo Quick Test: Single Apartment Invoice Generation
echo ==============================================

echo.
echo Generate invoice for apartment 55, month 2024-01
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo Check if invoice was created
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
pause 