-- Migration script để thêm cột isVisible vào bảng facilities
-- Chạy script này trong database để cập nhật schema

-- Thêm cột isVisible vào bảng facilities
ALTER TABLE facilities ADD COLUMN is_visible BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hiển thị tiện ích';

-- Cập nhật tất cả tiện ích hiện tại thành hiển thị
UPDATE facilities SET is_visible = TRUE WHERE is_visible IS NULL;

-- Kiểm tra kết quả
SELECT id, name, is_visible FROM facilities LIMIT 5;
