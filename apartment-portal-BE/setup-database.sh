#!/bin/bash

echo "========================================"
echo "SETUP DATABASE APARTMENT PORTAL"
echo "========================================"

# Cấu hình database
DB_NAME="apartment_portal"
DB_USER="root"
DB_PASS="password"
DB_HOST="localhost"
DB_PORT="3306"

echo ""
echo "1. Tạo database..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

if [ $? -ne 0 ]; then
    echo "Lỗi: Không thể kết nối database. Vui lòng kiểm tra:"
    echo "- MySQL đã được cài đặt và chạy"
    echo "- Thông tin đăng nhập database đúng"
    echo "- Quyền truy cập database"
    exit 1
fi

echo "Database $DB_NAME đã được tạo thành công!"

echo ""
echo "2. Chạy schema..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < src/main/resources/complete-schema.sql

if [ $? -ne 0 ]; then
    echo "Lỗi: Không thể chạy schema"
    exit 1
fi

echo "Schema đã được tạo thành công!"

echo ""
echo "3. Import dữ liệu mẫu..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < src/main/resources/sample-data.sql

if [ $? -ne 0 ]; then
    echo "Lỗi: Không thể import dữ liệu mẫu"
    exit 1
fi

echo "Dữ liệu mẫu đã được import thành công!"

echo ""
echo "========================================"
echo "SETUP HOÀN TẤT!"
echo "========================================"
echo ""
echo "Thông tin đăng nhập:"
echo ""
echo "ADMIN:"
echo "- Username: admin"
echo "- Email: admin@apartment.com"
echo "- Password: password"
echo ""
echo "STAFF:"
echo "- Username: staff1, staff2"
echo "- Password: password"
echo ""
echo "RESIDENTS:"
echo "- Username: resident1-resident10"
echo "- Password: password"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""
echo "Bạn có thể chạy ứng dụng Spring Boot ngay bây giờ!"
echo "" 