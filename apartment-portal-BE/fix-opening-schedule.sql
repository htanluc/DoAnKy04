-- Sửa cột opening_schedule thành LONGTEXT
USE apartment_portal;

-- Kiểm tra cấu trúc bảng hiện tại
DESCRIBE facilities;

-- Sửa cột opening_schedule thành LONGTEXT
ALTER TABLE facilities MODIFY COLUMN opening_schedule LONGTEXT NULL COMMENT 'Lịch mở cửa theo tuần';

-- Kiểm tra lại cấu trúc bảng sau khi sửa
DESCRIBE facilities;

-- Xóa dữ liệu cũ nếu cần (tùy chọn)
-- DELETE FROM facilities;

SELECT 'Database đã được sửa thành công!' as status;
