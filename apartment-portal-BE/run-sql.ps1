# Script PowerShell để chạy SQL
$sqlContent = Get-Content "create-sample-residents.sql" -Raw
$sqlContent | mysql -u root -p123456 -h localhost -P 3306 ApartmentDB