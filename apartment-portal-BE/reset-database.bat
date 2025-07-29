@echo off
echo Resetting ApartmentDB database...

REM Xóa database cũ và tạo mới
mysql -u root -p123456 -e "DROP DATABASE IF EXISTS ApartmentDB; CREATE DATABASE ApartmentDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

REM Chạy schema mới
mysql -u root -p123456 ApartmentDB < complete-schema.sql

echo Database reset completed!
pause 