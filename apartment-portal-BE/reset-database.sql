-- Script để reset database
-- Chạy lệnh: mysql -u root -p123456 < reset-database.sql

-- Xóa database cũ
DROP DATABASE IF EXISTS ApartmentDB;

-- Tạo database mới
CREATE DATABASE ApartmentDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE ApartmentDB;

-- Chạy schema mới
SOURCE complete-schema.sql; 