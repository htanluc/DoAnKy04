-- Cập nhật bảng users để thêm trường email và đổi password thành password_hash
-- Chạy script này nếu database đã tồn tại

-- Thêm trường email
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;

-- Đổi tên cột password thành password_hash
ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(512) NOT NULL;

-- Thêm index cho email để tối ưu tìm kiếm
CREATE INDEX idx_users_email ON users(email);

-- Thêm index cho phone_number nếu chưa có
CREATE INDEX idx_users_phone_number ON users(phone_number);

-- Cập nhật dữ liệu mẫu (nếu cần)
-- UPDATE users SET email = CONCAT('user', id, '@example.com') WHERE email IS NULL;

-- Kiểm tra cấu trúc bảng sau khi cập nhật
DESCRIBE users; 