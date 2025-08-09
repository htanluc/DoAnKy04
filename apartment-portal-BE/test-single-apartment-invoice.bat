@echo off
echo Testing Single Apartment Invoice Generation API
echo =============================================
echo API: POST /api/admin/invoices/generate?apartmentId={id}&billingPeriod={yyyy-MM}
echo.

echo 1. Generate invoice for apartment 55, month 2024-01
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 2. Check if invoice was created for apartment 55, month 2024-01
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 3. Generate invoice for apartment 57, month 2024-01
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=57&billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Check invoices for both apartments 55 and 57
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55,57" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 5. Try to generate invoice for apartment 55 again (should fail - already exists)
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 6. Generate invoice for apartment 55, month 2024-02 (different month)
echo --------------------------------------------------------
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-02" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 7. Check all invoices for apartment 55 (should have 2 months)
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 8. Get invoice details for apartment 55, month 2024-01
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/55/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo This test verifies that:
echo - API creates invoice for specific apartment and month only
echo - Duplicate invoices are prevented
echo - Different months can be created for same apartment
echo - Invoice includes all fee types (service, water, vehicle)
echo.
echo API Format: POST /api/admin/invoices/generate?apartmentId={id}&billingPeriod={yyyy-MM}
echo Example: POST /api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01
pause 