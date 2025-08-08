@echo off
echo Testing Invoice Details APIs
echo ===========================

echo.
echo 1. Get all invoices (to see available invoice IDs)
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 2. Get invoice details by ID (includes items)
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/49" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 3. Get invoice items details by ID (new API)
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/49/items" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo.
echo 4. Get invoices by apartment IDs
echo --------------------------------------------------------
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55,57" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwOTAxMjM0NTY3IiwiaWF0IjoxNzM0NzI5NjAwLCJleHAiOjE3MzQ3MzMyMDB9.YourTokenHere"

echo.
echo Test completed!
echo.
echo Available APIs for invoice details:
echo - GET /api/admin/invoices (all invoices)
echo - GET /api/admin/invoices/{id} (invoice details with items)
echo - GET /api/admin/invoices/{id}/items (invoice items only)
echo - GET /api/admin/invoices/by-apartments?aptIds=... (invoices by apartment)
pause 