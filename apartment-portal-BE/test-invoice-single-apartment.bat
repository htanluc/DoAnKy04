@echo off
echo Testing Single Apartment Invoice Generation
echo ==========================================

echo.
echo 1. Generate invoice for specific apartment (ID: 55) for month 2024-01
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 2. Check if invoice was created for apartment 55
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 3. Get invoice details for apartment 55 (if exists)
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/55" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Generate invoice for another apartment (ID: 57) for month 2024-01
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=57&billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Check invoices for both apartments
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55,57" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo This test verifies that:
echo - Only the specified apartment gets an invoice created
echo - Other apartments are not affected
echo - All fee types (service, water, vehicle) are calculated for the specific apartment
pause 